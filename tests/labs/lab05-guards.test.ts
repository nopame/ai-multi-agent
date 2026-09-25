import { describe, it, expect } from 'vitest';
import { mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Lab 05 guards — D7 / issue #10 (OpenCode backend).
 * Covers: validation + maxlength server-side, honeypot trap, rate limit,
 * guestbook closed by default (D5) but working when explicitly enabled.
 */
describe('lab05 contact guards', () => {
  const dataDir = join(process.cwd(), 'data', 'vitest-lab-guards');

  function ctx(body: unknown, ip: string) {
    const request = new Request('http://127.0.0.1:4321/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    return { request, clientAddress: ip } as unknown as Parameters<
      typeof import('../../src/pages/api/contact').POST
    >[0];
  }

  function ctxGB(body: unknown, ip: string) {
    const request = new Request('http://127.0.0.1:4321/api/guestbook', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    return { request, clientAddress: ip } as unknown as Parameters<
      typeof import('../../src/pages/api/guestbook').POST
    >[0];
  }

  it('insertContact rejects invalid fields (maxlength 80/120/2000 + email shape)', async () => {
    process.env.DATA_DIR = dataDir;
    rmSync(dataDir, { recursive: true, force: true });
    mkdirSync(dataDir, { recursive: true });
    const { insertContact } = await import('../../src/lib/db');
    expect(() => insertContact({ name: '', email: 'a@b.co', message: 'hi' })).toThrow(/VALIDATION/);
    expect(() => insertContact({ name: 'x'.repeat(81), email: 'a@b.co', message: 'hi' })).toThrow(/VALIDATION/);
    expect(() => insertContact({ name: 'A', email: 'a@b.co', message: '' })).toThrow(/VALIDATION/);
    expect(() => insertContact({ name: 'A', email: 'a@b.co', message: 'x'.repeat(2001) })).toThrow(/VALIDATION/);
    expect(() => insertContact({ name: 'A', email: 'not-an-email', message: 'hi' })).toThrow(/VALIDATION/);
    expect(() => insertContact({ name: 42, email: 'a@b.co', message: 'hi' })).toThrow(/VALIDATION/);
  });

  it('insertContact trims and persists a valid row', async () => {
    const { insertContact } = await import('../../src/lib/db');
    const row = insertContact({
      name: '  Ada  ',
      email: ' ada@example.com ',
      message: `x${'y'.repeat(1999)}`, // exactly 2000
    });
    expect(row.id).toBeGreaterThan(0);
    expect(row.name).toBe('Ada');
    expect(row.email).toBe('ada@example.com');
    expect(row.message.length).toBe(2000);
  });

  it('honeypot: filled website trap → 201 but nothing stored', async () => {
    const { POST } = await import('../../src/pages/api/contact');
    const { getDb } = await import('../../src/lib/db');
    const count = () =>
      (getDb().prepare('SELECT COUNT(*) AS c FROM contact_messages').get() as { c: number }).c;
    const before = count();
    const res = await POST(ctx({ name: 'Bot', email: 'bot@spam.io', message: 'buy now', website: 'http://spam.example' }, '198.51.100.1'));
    expect(res.status).toBe(201);
    expect(count()).toBe(before);
  });

  it('validation over API → 400 with a short generic body (no internals)', async () => {
    const { POST } = await import('../../src/pages/api/contact');
    const res = await POST(ctx({ name: 'A', email: 'oops', message: 'hi' }, '198.51.100.2'));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).not.toContain('VALIDATION:');
    expect(body.error).not.toMatch(/SELECT|INSERT|sqlite|stack/i);
    expect(body.error.length).toBeLessThan(120);
  });

  it('rate limit: 201 five times from one IP, then 429 — another IP unaffected', async () => {
    const { POST } = await import('../../src/pages/api/contact');
    const ip = '198.51.100.3';
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) {
      const res = await POST(ctx({ name: 'R', email: 'r@r.co', message: 'm' }, ip));
      statuses.push(res.status);
    }
    expect(statuses.filter((s) => s === 201).length).toBe(5);
    expect(statuses[5]).toBe(429);
    const other = await POST(ctx({ name: 'S', email: 's@s.co', message: 'm' }, '198.51.100.3-other'));
    expect(other.status).toBe(201);
  });

  it('guestbook stays closed by default (D5) — API answers 501', async () => {
    delete process.env.GUESTBOOK_ENABLED;
    const { GET } = await import('../../src/pages/api/guestbook');
    const res = await GET({} as unknown as Parameters<typeof GET>[0]);
    expect(res.status).toBe(501);
    expect(((await res.json()) as { error: string }).error).toBe('NOT_IMPLEMENTED');
  });

  it('guestbook API works when GUESTBOOK_ENABLED=1 (explicit decision required)', async () => {
    process.env.GUESTBOOK_ENABLED = '1';
    const { POST, GET } = await import('../../src/pages/api/guestbook');
    const post = await POST(ctxGB({ name: 'Bob', message: 'Nice site' }, '198.51.100.4'));
    expect(post.status).toBe(201);
    const get = await GET();
    expect(get.status).toBe(200);
    const data = (await get.json()) as { entries: { name: string; message: string }[] };
    expect(data.entries.some((e) => e.name === 'Bob')).toBe(true);
    delete process.env.GUESTBOOK_ENABLED;
  });
});