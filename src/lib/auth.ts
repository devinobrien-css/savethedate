import "server-only";
import { cookies } from "next/headers";
import crypto from "node:crypto";

/**
 * Minimal stateless admin session: a single shared password (ADMIN_PASSWORD)
 * gates the /admin dashboard. On login we drop an HMAC-signed cookie; we
 * verify its signature on each request. No database/session store needed.
 */
const COOKIE = "std_admin";
const MAX_AGE_DAYS = 30;

function secret(): string {
  // Falls back to a dev-only secret so local runs work; set ADMIN_SESSION_SECRET in prod.
  return process.env.ADMIN_SESSION_SECRET || "dev-insecure-secret-change-me";
}

function sign(value: string): string {
  const mac = crypto.createHmac("sha256", secret()).update(value).digest("hex");
  return `${value}.${mac}`;
}

function verify(signed: string | undefined): boolean {
  if (!signed) return false;
  const idx = signed.lastIndexOf(".");
  if (idx < 0) return false;
  const value = signed.slice(0, idx);
  const mac = signed.slice(idx + 1);
  const expected = crypto.createHmac("sha256", secret()).update(value).digest("hex");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  if (!crypto.timingSafeEqual(a, b)) return false;

  // value is "admin:<issuedAtMs>" — reject if expired
  const [role, issued] = value.split(":");
  if (role !== "admin") return false;
  const issuedAt = Number(issued);
  if (!Number.isFinite(issuedAt)) return false;
  const ageMs = Date.now() - issuedAt;
  return ageMs >= 0 && ageMs < MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
}

export function isAdminPasswordConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

/** Constant-time password check against ADMIN_PASSWORD. */
export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function createAdminSession(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, sign(`admin:${Date.now()}`), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_DAYS * 24 * 60 * 60,
  });
}

export async function destroyAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function isAuthed(): Promise<boolean> {
  const store = await cookies();
  return verify(store.get(COOKIE)?.value);
}
