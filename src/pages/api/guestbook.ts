import type { APIRoute } from 'astro';
import { insertGuestbook, listGuestbook, ValidationError } from '../../lib/db';
import { checkRateLimit } from '../../lib/rate-limit';
import { getClientIp } from '../../lib/client-ip';

export const prerender = false;

const SAFE_INVALID = 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบแล้วลองใหม่';
const SAFE_LIMIT = 'ส่งข้อความบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่';
const SAFE_ERROR = 'เกิดข้อผิดพลาดฝั่งเซิร์ฟเวอร์ ลองใหม่อีกครั้งภายหลัง';

const JSON_HEADERS = { 'content-type': 'application/json' };

/** Error messages never include stack traces, SQL, or API paths (D9). */
export const GET: APIRoute = async () => {
  try {
    const rows = listGuestbook();
    return new Response(JSON.stringify({ entries: rows }), {
      status: 200,
      headers: JSON_HEADERS,
    });
  } catch (err) {
    console.error('[guestbook] list failed:', err);
    return new Response(JSON.stringify({ error: SAFE_ERROR }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }
};

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

    // Rate limit identical to /api/contact (closes L12).
    const ip = getClientIp(request);
    const limit = checkRateLimit(`guestbook:${ip}`);
    if (!limit.allowed) {
      return new Response(JSON.stringify({ error: SAFE_LIMIT }), {
        status: 429,
        headers: {
          ...JSON_HEADERS,
          'retry-after': String(limit.retryAfterSeconds),
        },
      });
    }

    const row = insertGuestbook(body);
    return new Response(JSON.stringify(row), {
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
    console.error('[guestbook] insert failed:', err);
    return new Response(JSON.stringify({ error: SAFE_ERROR }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }
};