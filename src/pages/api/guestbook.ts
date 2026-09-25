import type { APIRoute } from 'astro';
import { insertGuestbook, listGuestbook, ValidationError } from '../../lib/db';
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

/** GET /api/guestbook — 200 { entries } newest first, at most 50. */
export const GET: APIRoute = async () => {
  try {
    return json({ entries: listGuestbook() }, 200);
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('NOT_IMPLEMENTED')) {
      return json({ error: GENERIC_ERROR }, 501);
    }
    console.error('GET /api/guestbook failed:', err);
    return json({ error: GENERIC_ERROR }, 500);
  }
};

/**
 * POST /api/guestbook
 * Contract: 201 { entry } · 400 validation · 429 rate limit · 501 / 500 generic.
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
    return json(
      {
        entry: {
          id: 0,
          name: typeof data.name === 'string' ? data.name.trim() : '',
          message: typeof data.message === 'string' ? data.message.trim() : '',
          created_at: new Date().toISOString(),
        },
      },
      201,
    );
  }

  const rate = checkRateLimit(`guestbook:${clientAddress ?? 'unknown'}`);
  if (!rate.ok) {
    return json({ error: RATE_LIMIT_ERROR }, 429);
  }

  try {
    const entry = insertGuestbook({
      name: data.name as string,
      message: data.message as string,
    });
    return json({ entry }, 201);
  } catch (err) {
    if (err instanceof ValidationError) return json({ error: err.message }, 400);
    if (err instanceof Error && err.message.startsWith('NOT_IMPLEMENTED')) {
      return json({ error: GENERIC_ERROR }, 501);
    }
    console.error('POST /api/guestbook failed:', err);
    return json({ error: GENERIC_ERROR }, 500);
  }
};
