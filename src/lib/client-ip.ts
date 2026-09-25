/**
 * Best-effort client IP from proxy headers.
 * `x-forwarded-for` can be spoofed; the right-most proxy that appended the
 * header is what we trust most, so take the LAST entry, not the first.
 * For a single-instance personal site this is sufficient for rate limiting
 * (L10) — not for security-critical identity.
 */
export function getClientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    const parts = xff
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }
  return request.headers.get('x-real-ip') ?? 'local';
}
