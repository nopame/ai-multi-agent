/**
 * In-memory rate limit per key (e.g. `${endpoint}:${ip}`).
 * Good enough for the single-instance v1 (one Docker container).
 * Fixed window: at most `limit` hits per `windowMs` per key.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export const RATE_LIMIT = 5;
export const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

export type RateLimitResult = { ok: boolean; retryAfterSec: number };

export function checkRateLimit(
  key: string,
  limit: number = RATE_LIMIT,
  windowMs: number = RATE_WINDOW_MS,
  now: number = Date.now(),
): RateLimitResult {
  const bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }
  if (bucket.count >= limit) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }
  bucket.count += 1;
  return { ok: true, retryAfterSec: 0 };
}

/** Test helper: clear all buckets. */
export function resetRateLimits(): void {
  buckets.clear();
}
