import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * Backend security contract for /api/contact (D7):
 * honeypot drop, server-side rate limit, safe error messages.
 * Covers the gap L8 left open (rate limit มี test).
 */
describe('POST /api/contact security', () => {
  let dataDir: string;

  beforeAll(() => {
    dataDir = mkdtempSync(join(tmpdir(), 'contact-api-'));
    process.env.DATA_DIR = dataDir;
  });

  beforeEach(async () => {
    const { getDb } = await import('../src/lib/db');
    getDb()
      .prepare('DELETE FROM contact_messages')
      .run();
  });

  afterAll(async () => {
    const { closeDb } = await import('../src/lib/db');
    closeDb();
    rmSync(dataDir, { recursive: true, force: true });
    delete process.env.DATA_DIR;
  });

  async function post(body: unknown, ip = 'test-ip'): Promise<Response> {
    const { POST } = await import('../src/pages/api/contact');
    return POST({
      request: new Request('http://localhost/api/contact', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': ip,
        },
        body: JSON.stringify(body),
      }),
    } as never);
  }

  const validBody = {
    name: 'Ada',
    email: 'ada@example.com',
    message: 'Hello from security test',
  };

  it('persists a valid submission with 201 and does not echo PII', async () => {
    const res = await post(validBody);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.ok).toBe(true);
    // Contract: response must not echo the submitted email
    expect(JSON.stringify(data)).not.toContain('ada@example.com');
  });

  it('deletes contact messages older than 90 days on insert (D7)', async () => {
    const { getDb } = await import('../src/lib/db');
    getDb()
      .prepare(
        `INSERT INTO contact_messages (name, email, message, created_at)
         VALUES ('Old', 'old@example.com', 'stale', datetime('now', '-91 days'))`
      )
      .run();
    await post({ ...validBody, email: 'fresh@example.com' });
    const count = getDb()
      .prepare('SELECT COUNT(*) AS c FROM contact_messages')
      .get() as { c: number };
    expect(count.c).toBe(1);
  });

  it('drops honeypot submissions without persisting', async () => {
    const res = await post({ ...validBody, website: 'spam.example.com' });
    expect(res.status).toBe(201);
    const { getDb } = await import('../src/lib/db');
    const count = getDb()
      .prepare('SELECT COUNT(*) AS c FROM contact_messages')
      .get() as { c: number };
    expect(count.c).toBe(0);
  });

  it('rate-limits after 5 submissions per window (429)', async () => {
    const { resetRateLimits } = await import('../src/lib/rate-limit');
    resetRateLimits();
    for (let i = 0; i < 5; i++) {
      const res = await post({ ...validBody, email: `p${i}@example.com` }, 'rl-ip');
      expect(res.status).toBe(201);
    }
    const sixth = await post({ ...validBody, email: 'six@example.com' }, 'rl-ip');
    expect(sixth.status).toBe(429);
    const data = await sixth.json();
    expect(typeof data.error).toBe('string');
  });

  it('rejects invalid input with 400 and a safe message', async () => {
    const cases = [
      { name: 'A', email: 'not-an-email', message: 'hi' },
      { name: '', email: 'a@b.co', message: 'hi' },
      { name: 'A', email: 'a@b.co', message: 'x'.repeat(2001) },
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