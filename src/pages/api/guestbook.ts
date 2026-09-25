import type { APIRoute } from 'astro';
import { insertGuestbook, listGuestbook } from '../../lib/db';
import { errorResponse, isHoneypotHit, jsonResponse, parseJsonBody } from '../../lib/http';
import { hitRateLimit } from '../../lib/rate-limit';

export const prerender = false;

/**
 * Guestbook is Later (D5): the API stays CLOSED (501) unless GUESTBOOK_ENABLED=1.
 * Turning it on requires a new decision replacing D5; the page stays unlinked either way.
 * When open, it uses the same guards as contact: rate limit, honeypot `website`,
 * validation (name ≤ 80 · message ≤ 500), short error bodies (D9).
 */
function isOpen(): boolean {
  return process.env.GUESTBOOK_ENABLED === '1';
}

export const GET: APIRoute = async () => {
  if (!isOpen()) return errorResponse(new Error('NOT_IMPLEMENTED: guestbook'));
  try {
    return jsonResponse({ entries: listGuestbook() }, 200);
  } catch (err) {
    return errorResponse(err);
  }
};

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (!isOpen()) return errorResponse(new Error('NOT_IMPLEMENTED: guestbook'));
  const ip = clientAddress || request.headers.get('x-forwarded-for') || 'unknown';
  if (!hitRateLimit(`guestbook:${ip}`)) {
    return jsonResponse({ error: 'ส่งบ่อยเกินไป ลองอีกครั้งภายหลังครับ' }, 429);
  }
  const parsed = await parseJsonBody(request);
  if (!parsed.ok) return parsed.response;
  if (isHoneypotHit(parsed.data)) {
    const data = parsed.data as { name?: string; message?: string };
    return jsonResponse({ id: 0, name: data.name ?? '', message: data.message ?? '', created_at: '' }, 201);
  }
  try {
    const row = insertGuestbook(parsed.data as { name: string; message: string });
    return jsonResponse(row, 201);
  } catch (err) {
    return errorResponse(err);
  }
};