import "server-only";
import { Resend } from "resend";
import { buildRsvpConfirmation, type Variant } from "@/emails/rsvpConfirmation";

/**
 * Transactional email via Resend. Configured lazily so a missing API key
 * never breaks the build or the RSVP flow — confirmation emails are a
 * best-effort nicety layered on top of the (already-saved) RSVP.
 *
 * Env:
 *   RESEND_API_KEY  — from resend.com/api-keys
 *   RESEND_FROM     — verified sender, e.g. "Devin & Rebecca <rsvp@yourdomain.com>"
 */
export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM);
}

let cached: Resend | null = null;
function client(): Resend {
  if (!cached) cached = new Resend(process.env.RESEND_API_KEY!);
  return cached;
}

export async function sendRsvpConfirmation(input: {
  to: string;
  firstName: string;
  attending: boolean;
  partySize: number;
  variant?: Variant;
}): Promise<void> {
  if (!isEmailConfigured()) return;

  const { subject, html, text } = buildRsvpConfirmation(input);
  const { error } = await client().emails.send({
    from: process.env.RESEND_FROM!,
    to: input.to,
    subject,
    html,
    text,
  });
  if (error) {
    // Throw so the caller can log it; the RSVP itself still succeeds.
    throw new Error(error.message);
  }
}
