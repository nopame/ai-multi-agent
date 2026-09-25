/**
 * In-memory sliding-window rate limiter (D7 · #10 — server-side, with tests in
 * tests/labs/lab05-guards.test.ts). Single-process only; enough for a personal
 * site. Defaults: 5 requests per IP per minute.
 */
const hits = new Map<string, number[]>();

export function hitRateLimit(key: string, limit = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 1_000) {
    for (const [k, ts] of hits) {
      if (ts.every((t) => now - t >= windowMs)) hits.delete(k);
    }
  }
  return true;
}