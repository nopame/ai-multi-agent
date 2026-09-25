import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * Backend security contract for /api/guestbook (closes L12):
 * honeypot drop, server-side rate limit identical to /api/contact,
 * safe error messages (D9).
 */
describe('POST /api/guestbook security', () => {
  let dataDir: string;

  beforeAll(() => {
    dataDir = mkdtempSync(join(tmpdir(), 'guestbook-api-'));
    process.env.DATA_DIR = dataDir;
  });

  beforeEach(async () => {
    const { getDb } = await import('../src/lib/db');
    getDb().prepare('DELETE FROM guestbook').run();
    const { resetRateLimits } = await import('../src/lib/rate-limit');
    resetRateLimits();
  });

  afterAll(async () => {
    const { closeDb } = await import('../src/lib/db');
    closeDb();
    rmSync(dataDir, { recursive: true, force: true });
    delete process.env.DATA_DIR;
  });

  async function post(body: unknown, ip = 'test-ip'): Promise<Response> {
    const { POST } = await import('../src/pages/api/guestbook');
    return POST({
      request: new Request('http://localhost/api/guestbook', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': ip,
        },
        body: JSON.stringify(body),
      }),
    } as never);
  }

  const validBody = { name: 'Bob', message: 'Nice site' };

  it('persists a valid submission with 201', async () => {
    const res = await post(validBody);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.name).toBe('Bob');
  });

  it('drops honeypot submissions without persisting', async () => {
    const res = await post({ ...validBody, website: 'spam.example.com' });
    expect(res.status).toBe(201);
    const { getDb } = await import('../src/lib/db');
    const count = getDb().prepare('SELECT COUNT(*) AS c FROM guestbook').get() as {
      c: number;
    };
    expect(count.c).toBe(0);
  });

  it('rate-limits after 5 submissions per window (429)', async () => {
    for (let i = 0; i < 5; i++) {
      const res = await post({ ...validBody, message: `msg ${i}` }, 'rl-ip');
      expect(res.status).toBe(201);
    }
    const sixth = await post({ ...validBody, message: 'six' }, 'rl-ip');
    expect(sixth.status).toBe(429);
    const data = await sixth.json();
    expect(typeof data.error).toBe('string');
    expect(sixth.headers.get('retry-after')).toBeTruthy();
  });

  it('buckets by the right-most x-forwarded-for entry (L10)', async () => {
    // Same right-most IP via different proxy chains -> shared bucket.
    for (let i = 0; i < 5; i++) {
      const { POST } = await import('../src/pages/api/guestbook');
      const res = await POST({
        request: new Request('http://localhost/api/guestbook', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-forwarded-for': `203.0.113.${i}, 198.51.100.7`,
          },
          body: JSON.stringify(validBody),
        }),
      } as never);
      expect(res.status).toBe(201);
    }
    const sixth = await post(validBody, '198.51.100.7');
    expect(sixth.status).toBe(429);
  });

  it('rejects invalid input with 400 and a safe message', async () => {
    const cases = [
      { name: '', message: 'hi' },
      { name: 'A', message: '' },
      { name: 'A', message: 'x'.repeat(501) },
      'not-an-object',
    ];
    for (const body of cases) {
      const res = await post(body);
      expect(res.status, `status for ${JSON.stringify(body)}`).toBe(400);
      const data = await res.json();
      // No stack traces, SQL, or API paths in the message (D9)
      expect(String(data.error)).not.toMatch(/SELECT|INSERT|sqlite|Error:|api\//i);
    }
  });
});
