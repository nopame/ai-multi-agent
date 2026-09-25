import type { APIRoute } from 'astro';
import { insertContact, ValidationError } from '../../lib/db';
import { checkRateLimit } from '../../lib/rate-limit';

export const prerender = false;

const GENERIC_ERROR = 'ระบบขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้งภายหลังครับ';
const RATE_LIMIT_ERROR = 'ส่งถี่เกินไป กรุณารอสักครู่แล้วลองใหม่ครับ';

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

/**
 * POST /api/contact
 * Contract: 201 { ok: true } (never echoes the email back) · 400 validation ·
 * 429 rate limit · 501 not implemented · 500 generic (never raw err.message).
 */
export const POST: APIRoute = async ({ request, clientAddress }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'ข้อมูลที่ส่งมาไม่ถูกต้อง' }, 400);
  }

  const data = (body ?? {}) as Record<string, unknown>;

  // Honeypot: pretend success but store nothing.
  if (typeof data.website === 'string' && data.website.trim() !== '') {
    return json({ ok: true }, 201);
  }

  const rate = checkRateLimit(`contact:${clientAddress ?? 'unknown'}`);
  if (!rate.ok) {
    return json({ error: RATE_LIMIT_ERROR }, 429);
  }

  try {
    insertContact({
      name: data.name as string,
      email: data.email as string,
      message: data.message as string,
    });
    return json({ ok: true }, 201);
  } catch (err) {
    if (err instanceof ValidationError) return json({ error: err.message }, 400);
    if (err instanceof Error && err.message.startsWith('NOT_IMPLEMENTED')) {
      return json({ error: GENERIC_ERROR }, 501);
    }
    console.error('POST /api/contact failed:', err);
    return json({ error: GENERIC_ERROR }, 500);
  }
};
