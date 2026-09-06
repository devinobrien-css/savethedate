import "server-only";

/**
 * Absolute base for links we email out: SITE_URL when set, otherwise the origin
 * of the request being served. Trailing slashes trimmed so callers can append
 * a path directly.
 */
export function siteBase(request: Request): string {
  return (process.env.SITE_URL || new URL(request.url).origin).replace(/\/+$/, "");
}
