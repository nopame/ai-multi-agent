import type { APIRoute } from 'astro';
import { insertContact, ValidationError } from '../../lib/db';
import { checkRateLimit } from '../../lib/rate-limit';

export const prerender = false;

const SAFE_INVALID = 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบแล้วลองอีกครั้ง';
const SAFE_LIMIT = 'ส่งข้อความบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่';
const SAFE_ERROR = 'เกิดข้อผิดพลาดฝั่งเซิร์ฟเวอร์ ลองใหม่อีกครั้งภายหลัง';

const JSON_HEADERS = { 'content-type': 'application/json' };

/**
 * POST /api/contact
 * Body: JSON {name, email, message} (+ optional honeypot field "website").
 * - Honeypot filled  -> fake success 201, nothing persisted (spam drop).
 * - Over rate limit  -> 429 with safe message.
 * - Persisted row    -> 201 with the stored row.
 * Error responses never include stack traces, SQL, or API paths (D9).
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    // Honeypot: real visitors never fill the hidden "website" field.
    if (typeof body?.website === 'string' && body.website.trim() !== '') {
      return new Response(JSON.stringify({ ok: true }), {
        status: 201,
        headers: JSON_HEADERS,
      });
    }

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
    const limit = checkRateLimit(`contact:${ip}`);
    if (!limit.allowed) {
      return new Response(JSON.stringify({ error: SAFE_LIMIT }), {
        status: 429,
        headers: { ...JSON_HEADERS, 'retry-after': String(limit.retryAfterSeconds) },
      });
    }

    insertContact(body);
    // Do not echo the submitted email back (handoff 04 contract).
    return new Response(JSON.stringify({ ok: true }), {
      status: 201,
      headers: JSON_HEADERS,
    });
  } catch (err) {
    if (err instanceof ValidationError || err instanceof SyntaxError) {
      return new Response(JSON.stringify({ error: SAFE_INVALID }), {
        status: 400,
        headers: JSON_HEADERS,
      });
    }
    // Unexpected (DB failure etc.) — log details server-side only.
    console.error('[contact] request failed:', err);
    return new Response(JSON.stringify({ error: SAFE_ERROR }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }
};