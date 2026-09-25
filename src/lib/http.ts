/**
 * Shared helpers for API routes (backend · OpenCode).
 * Contract: docs/fe-be-contract-check.md · docs/handoffs/04-claude-to-opencode.md
 * D9 — error responses must be short: no stack, SQL, API paths, or course text.
 */

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

/**
 * Map a thrown error to a safe response:
 * - NOT_IMPLEMENTED (stub / closed guestbook gate) → 501 so the frontend falls back calmly.
 * - VALIDATION (bad field, from src/lib/db.ts) → 400 with a short generic message.
 * - anything else → log server-side, answer 500 with a generic short message.
 */
export function errorResponse(err: unknown): Response {
  const message = err instanceof Error ? err.message : String(err);
  if (message.startsWith('NOT_IMPLEMENTED')) {
    return jsonResponse({ error: 'NOT_IMPLEMENTED' }, 501);
  }
  if (message.startsWith('VALIDATION')) {
    return jsonResponse({ error: 'ข้อมูลไม่ถูกต้อง ตรวจแล้วส่งใหม่อีกครั้งครับ' }, 400);
  }
  console.error('[api] unhandled error:', err);
  return jsonResponse({ error: 'เกิดข้อผิดพลาด ลองอีกครั้งภายหลัง' }, 500);
}

/**
 * Parse a JSON request body.
 * Malformed JSON or a non-object body → 400 with a short message (never the parser's raw text).
 */
export async function parseJsonBody(
  request: Request,
): Promise<{ ok: true; data: Record<string, unknown> } | { ok: false; response: Response }> {
  try {
    const data: unknown = await request.json();
    if (data === null || typeof data !== 'object' || Array.isArray(data)) {
      return { ok: false, response: jsonResponse({ error: 'รูปแบบข้อมูลไม่ถูกต้อง' }, 400) };
    }
    return { ok: true, data: data as Record<string, unknown> };
  } catch {
    return { ok: false, response: jsonResponse({ error: 'รูปแบบข้อมูลไม่ถูกต้อง' }, 400) };
  }
}

/**
 * Honeypot trap (D7 · #10). The form sends a hidden input named `website`
 * (frontend must add it when the form opens — see docs/handoffs/05-opencode-to-claude.md).
 * A non-empty value means a bot filled it: answer 201 like success but store nothing.
 */
export function isHoneypotHit(data: Record<string, unknown>): boolean {
  const v = data.website;
  return typeof v === 'string' && v.trim() !== '';
}