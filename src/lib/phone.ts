/**
 * Phone helpers — pure, no dependencies, safe to import anywhere (client or
 * server). We store and text US numbers in E.164 form (+1XXXXXXXXXX) so the
 * Messages app and the SMS log have one canonical shape to work with.
 */

/**
 * Best-effort normalize a US phone string to E.164 (+1XXXXXXXXXX).
 * Returns null when the input doesn't look like a US 10-digit number
 * (optionally already prefixed with a 1 / +1). Keeps it deliberately strict —
 * a bad number should drop the phone, never block the RSVP.
 */
export function toE164(raw: string): string | null {
  const digits = (raw || "").replace(/[^\d]/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

/** "+15551234567" → "(555) 123-4567" for display; falls back to the input. */
export function formatPhone(e164: string | null): string {
  if (!e164) return "—";
  const m = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(e164);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : e164;
}
