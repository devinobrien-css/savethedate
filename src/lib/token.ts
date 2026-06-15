import "server-only";
import crypto from "node:crypto";

/**
 * Stateless, signed action tokens for email links (e.g. confirm / release a
 * registry claim). Same HMAC approach as the admin session cookie in auth.ts,
 * but self-contained and general-purpose: the payload travels in the link and
 * we verify its signature + age on the way back in — no token table needed.
 *
 * Token shape:  <urlSafeBase64(payloadJson)>.<hmacHex>
 * Payload:      { p: string; a: string; t: number }  (purpose, action-data, issuedAtMs)
 */

function secret(): string {
  // Dedicated secret, falling back to the admin session secret, then a
  // dev-only default so local runs work without extra setup.
  return (
    process.env.REGISTRY_TOKEN_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    "dev-insecure-secret-change-me"
  );
}

function b64urlEncode(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): Buffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

function hmac(value: string): string {
  return crypto.createHmac("sha256", secret()).update(value).digest("hex");
}

/**
 * Sign an action token. `purpose` namespaces the token (e.g. "registry:confirm")
 * so a confirm link can't be replayed as a release link; `data` is the thing
 * being acted on (e.g. a claim id). The issue time is baked in for TTL checks.
 */
export function signToken(purpose: string, data: string, issuedAtMs: number): string {
  const payload = b64urlEncode(Buffer.from(JSON.stringify({ p: purpose, a: data, t: issuedAtMs })));
  return `${payload}.${hmac(payload)}`;
}

/**
 * Verify a token's signature, purpose, and age. Returns the embedded `data`
 * (e.g. the claim id) on success, or null if anything is off. Constant-time
 * signature comparison, like the admin cookie check.
 */
export function verifyToken(
  token: string | undefined | null,
  purpose: string,
  maxAgeMs: number
): string | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot < 0) return null;

  const payload = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  const expected = hmac(payload);

  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  let parsed: { p?: unknown; a?: unknown; t?: unknown };
  try {
    parsed = JSON.parse(b64urlDecode(payload).toString("utf8"));
  } catch {
    return null;
  }

  if (parsed.p !== purpose) return null;
  if (typeof parsed.a !== "string") return null;
  const issuedAt = Number(parsed.t);
  if (!Number.isFinite(issuedAt)) return null;

  const age = Date.now() - issuedAt;
  if (age < 0 || age >= maxAgeMs) return null;

  return parsed.a;
}

/** Token validity window for registry email links. */
export const REGISTRY_TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
