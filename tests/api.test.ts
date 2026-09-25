import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Backend tests for the contact/guestbook API contract:
 * validation, retention, honeypot, rate limit (D6), response shapes.
 * Uses its own DATA_DIR so real data is never touched.
 */
const dataDir = join(process.cwd(), 'data', 'vitest-api');

process.env.DATA_DIR = dataDir;

type DbModule = typeof import('../src/lib/db');
type RateLimitModule = typeof import('../src/lib/rate-limit');
type ContactRoute = typeof import('../src/pages/api/contact');
type GuestbookRoute = typeof import('../src/pages/api/guestbook');

let db: DbModule;
let rateLimit: RateLimitModule;
let contactRoute: ContactRoute;
let guestbookRoute: GuestbookRoute;

beforeAll(async () => {
  rmSync(dataDir, { recursive: true, force: true });
  mkdirSync(dataDir, { recursive: true });
  db = await import('../src/lib/db');
  rateLimit = await import('../src/lib/rate-limit');
  contactRoute = await import('../src/pages/api/contact');
  guestbookRoute = await import('../src/pages/api/guestbook');
});

beforeEach(() => {
  rateLimit.resetRateLimits();
  db.getDb().exec('DELETE FROM contact_messages; DELETE FROM guestbook;');
});

function post(handler: ContactRoute['POST'], payload: unknown, ip = '10.0.0.1') {
  const request = new Request('http://localhost/api/test', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: typeof payload === 'string' ? payload : JSON.stringify(payload),
  });
  return handler({ request, clientAddress: ip } as never);
}

describe('db validation', () => {
  it('trims input and persists', () => {
    const row = db.insertContact({ name: '  Ada  ', email: ' ada@example.com ', message: ' hi ' });
    expect(row.id).toBeGreaterThan(0);
    expect(row.name).toBe('Ada');
    expect(row.email).toBe('ada@example.com');
    expect(row.message).toBe('hi');
  });

  it.each([
    [{ name: '', email: 'a@b.co', message: 'x' }],
    [{ name: 'A', email: 'not-an-email', message: 'x' }],
    [{ name: 'A', email: 'a@b.co', message: '   ' }],
    [{ name: 'n'.repeat(81), email: 'a@b.co', message: 'x' }],
    [{ name: 'A', email: 'a@b.co', message: 'm'.repeat(1001) }],
    [{ name: 1, email: 'a@b.co', message: 'x' }],
  ])('insertContact rejects invalid input %j', (input) => {
    expect(() => db.insertContact(input as never)).toThrow(db.ValidationError);
  });

  it('guestbook rejects message over 500 chars', () => {
    expect(() => db.insertGuestbook({ name: 'B', message: 'm'.repeat(501) })).toThrow(
      db.ValidationError,
    );
  });

  it('ValidationError messages are short Thai text without stack/SQL', () => {
    try {
      db.insertContact({ name: '', email: '', message: '' });
      expect.unreachable();
    } catch (err) {
      expect(err).toBeInstanceOf(db.ValidationError);
      const msg = (err as Error).message;
      expect(msg).not.toMatch(/SQL|SELECT|INSERT|at\s+\w+\s+\(/i);
      expect(msg.length).toBeLessThan(120);
    }
  });
});

describe('retention (90 days)', () => {
  it('insertContact deletes contact messages older than 90 days', () => {
    db.getDb()
      .prepare(`INSERT INTO contact_messages (name, email, message, created_at) VALUES (?, ?, ?, datetime('now', '-91 days'))`)
      .run('Old', 'old@example.com', 'stale');
    db.insertContact({ name: 'New', email: 'new@example.com', message: 'fresh' });
    const rows = db.getDb().prepare('SELECT name FROM contact_messages').all() as { name: string }[];
    expect(rows.map((r) => r.name)).toEqual(['New']);
  });

  it('keeps messages newer than 90 days', () => {
    db.getDb()
      .prepare(`INSERT INTO contact_messages (name, email, message, created_at) VALUES (?, ?, ?, datetime('now', '-89 days'))`)
      .run('Recent', 'r@example.com', 'keep');
    db.insertContact({ name: 'New', email: 'new@example.com', message: 'fresh' });
    const count = db.getDb().prepare('SELECT COUNT(*) AS c FROM contact_messages').get() as { c: number };
    expect(count.c).toBe(2);
  });
});

describe('guestbook listing', () => {
  it('returns newest first and caps at 50', () => {
    for (let i = 1; i <= 55; i += 1) {
      db.insertGuestbook({ name: `N${i}`, message: `msg ${i}` });
    }
    const rows = db.listGuestbook();
    expect(rows.length).toBe(50);
    expect(rows[0].name).toBe('N55');
    expect(rows.at(-1)?.name).toBe('N6');
  });
});

describe('rate limit (D6)', () => {
  it('allows up to the limit then blocks with retryAfter', () => {
    for (let i = 0; i < 5; i += 1) {
      expect(rateLimit.checkRateLimit('k', 5, 1000, 0).ok).toBe(true);
    }
    const blocked = rateLimit.checkRateLimit('k', 5, 1000, 0);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });

  it('resets after the window passes', () => {
    for (let i = 0; i < 5; i += 1) rateLimit.checkRateLimit('k', 5, 1000, 0);
    expect(rateLimit.checkRateLimit('k', 5, 1000, 1001).ok).toBe(true);
  });

  it('tracks keys independently', () => {
    for (let i = 0; i < 5; i += 1) rateLimit.checkRateLimit('a', 5, 1000, 0);
    expect(rateLimit.checkRateLimit('b', 5, 1000, 0).ok).toBe(true);
  });
});

describe('POST /api/contact contract', () => {
  it('returns 201 { ok: true } without echoing the email', async () => {
    const res = await post(contactRoute.POST, {
      name: 'Ada',
      email: 'ada@example.com',
      message: 'hello',
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toEqual({ ok: true });
    expect(JSON.stringify(body)).not.toContain('ada@example.com');
  });

  it('honeypot returns 201 but stores nothing', async () => {
    const res = await post(contactRoute.POST, {
      name: 'Bot',
      email: 'bot@example.com',
      message: 'spam',
      website: 'http://spam.example',
    });
    expect(res.status).toBe(201);
    const count = db.getDb().prepare('SELECT COUNT(*) AS c FROM contact_messages').get() as { c: number };
    expect(count.c).toBe(0);
  });

  it('whitespace-only honeypot is not treated as spam', async () => {
    const res = await post(contactRoute.POST, {
      name: 'Ada',
      email: 'ada@example.com',
      message: 'hello',
      website: '   ',
    });
    expect(res.status).toBe(201);
  });

  it('returns 400 with a safe Thai message on validation failure', async () => {
    const res = await post(contactRoute.POST, { name: '', email: 'bad', message: '' });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(typeof body.error).toBe('string');
    expect(body.error).not.toMatch(/SQL|stack|NOT_IMPLEMENTED/i);
  });

  it('returns 400 on malformed JSON', async () => {
    const res = await post(contactRoute.POST, '{not json');
    expect(res.status).toBe(400);
  });

  it('returns 429 after 5 requests from the same IP', async () => {
    const payload = { name: 'Ada', email: 'ada@example.com', message: 'hi' };
    for (let i = 0; i < 5; i += 1) {
      expect((await post(contactRoute.POST, payload, '9.9.9.9')).status).toBe(201);
    }
    const res = await post(contactRoute.POST, payload, '9.9.9.9');
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(typeof body.error).toBe('string');
  });

  it('rate limit is per IP', async () => {
    const payload = { name: 'Ada', email: 'ada@example.com', message: 'hi' };
    for (let i = 0; i < 5; i += 1) await post(contactRoute.POST, payload, '9.9.9.9');
    expect((await post(contactRoute.POST, payload, '8.8.8.8')).status).toBe(201);
  });
});

describe('guestbook API contract', () => {
  it('GET returns 200 { entries } newest first', async () => {
    db.insertGuestbook({ name: 'First', message: 'one' });
    db.insertGuestbook({ name: 'Second', message: 'two' });
    const res = await guestbookRoute.GET({} as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.entries[0].name).toBe('Second');
    expect(body.entries[1].name).toBe('First');
    expect(Object.keys(body.entries[0]).sort()).toEqual(['created_at', 'id', 'message', 'name']);
  });

  it('POST returns 201 { entry }', async () => {
    const res = await post(guestbookRoute.POST, { name: 'Bob', message: 'Nice site' });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.entry.name).toBe('Bob');
    expect(body.entry.id).toBeGreaterThan(0);
  });

  it('honeypot returns 201 { entry } but stores nothing', async () => {
    const res = await post(guestbookRoute.POST, {
      name: 'Bot',
      message: 'spam',
      website: 'x',
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.entry).toBeTruthy();
    expect(db.listGuestbook().length).toBe(0);
  });

  it('returns 429 after 5 posts from the same IP', async () => {
    const payload = { name: 'Bob', message: 'hi' };
    for (let i = 0; i < 5; i += 1) {
      expect((await post(guestbookRoute.POST, payload, '7.7.7.7')).status).toBe(201);
    }
    expect((await post(guestbookRoute.POST, payload, '7.7.7.7')).status).toBe(429);
  });

  it('GET and POST rate limits are separate buckets', async () => {
    const payload = { name: 'Bob', message: 'hi' };
    for (let i = 0; i < 5; i += 1) await post(guestbookRoute.POST, payload, '6.6.6.6');
    expect((await guestbookRoute.GET({} as never)).status).toBe(200);
  });
});
