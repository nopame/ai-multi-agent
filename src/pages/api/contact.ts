import type { APIRoute } from 'astro';
import { insertContact } from '../../lib/db';
import { errorResponse, isHoneypotHit, jsonResponse, parseJsonBody } from '../../lib/http';
import { hitRateLimit } from '../../lib/rate-limit';

export const prerender = false;

/**
 * POST /api/contact
 * Contract (docs/fe-be-contract-check.md · D7 · #10):
 * - JSON {name, email, message} in → 201 + stored row out
 * - 429 when the same IP exceeds 5 requests/minute (UI shows its generic error)
 * - honeypot `website` filled → 201 but nothing stored (bot trap)
 * - bad fields (maxlength 80/120/2000, email shape) → 400 short message
 * - 501 only from the NOT_IMPLEMENTED path; server faults → 500 short message
 */
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const ip = clientAddress || request.headers.get('x-forwarded-for') || 'unknown';
  if (!hitRateLimit(`contact:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return jsonResponse({ error: 'ส่งบ่อยเกินไป ลองอีกครั้งภายหลังครับ' }, 429);
  }
  const parsed = await parseJsonBody(request);
  if (!parsed.ok) return parsed.response;
  if (isHoneypotHit(parsed.data)) {
    const data = parsed.data as { name?: string; email?: string; message?: string };
    return jsonResponse(
      { id: 0, name: data.name ?? '', email: data.email ?? '', message: data.message ?? '', created_at: '' },
      201,
    );
  }
  try {
    const row = insertContact(parsed.data as { name: string; email: string; message: string });
    return jsonResponse(row, 201);
  } catch (err) {
    return errorResponse(err);
  }
};