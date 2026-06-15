import "server-only";
import { Resend } from "resend";
import { buildRsvpConfirmation, type Variant } from "@/emails/rsvpConfirmation";
import { buildRegistryClaim } from "@/emails/registryClaim";
import { logEmail } from "@/lib/emailLog";

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
  const { subject } = buildRsvpConfirmation(input);

  if (!isEmailConfigured()) {
    await logEmail({
      type: "rsvp_confirmation",
      recipient: input.to,
      subject,
      status: "skipped",
      error: "Email is not configured (RESEND_API_KEY / RESEND_FROM).",
    });
    return;
  }

  const { html, text } = buildRsvpConfirmation(input);
  const { data, error } = await client().emails.send({
    from: process.env.RESEND_FROM!,
    to: input.to,
    subject,
    html,
    text,
  });
  if (error) {
    await logEmail({
      type: "rsvp_confirmation",
      recipient: input.to,
      subject,
      status: "failed",
      error: error.message,
    });
    // Throw so the caller can log it; the RSVP itself still succeeds.
    throw new Error(error.message);
  }
  await logEmail({
    type: "rsvp_confirmation",
    recipient: input.to,
    subject,
    status: "sent",
    providerId: data?.id ?? null,
  });
}

/**
 * "Confirm your gift" verification email for a registry claim. Unlike the RSVP
 * confirmation, this one is load-bearing — the claim stays `pending` until the
 * guest clicks the confirm link — so the caller should surface failures (and
 * not pretend the claim is locked in if we couldn't reach them).
 */
export async function sendRegistryClaimVerification(input: {
  to: string;
  name: string;
  itemTitle: string;
  confirmUrl: string;
  releaseUrl: string;
}): Promise<void> {
  const { subject } = buildRegistryClaim(input);

  if (!isEmailConfigured()) {
    await logEmail({
      type: "registry_claim",
      recipient: input.to,
      subject,
      status: "skipped",
      error: "Email is not configured (RESEND_API_KEY / RESEND_FROM).",
    });
    throw new Error("Email is not configured (set RESEND_API_KEY and RESEND_FROM).");
  }

  const { html, text } = buildRegistryClaim(input);
  const { data, error } = await client().emails.send({
    from: process.env.RESEND_FROM!,
    to: input.to,
    subject,
    html,
    text,
  });
  if (error) {
    await logEmail({
      type: "registry_claim",
      recipient: input.to,
      subject,
      status: "failed",
      error: error.message,
    });
    throw new Error(error.message);
  }
  await logEmail({
    type: "registry_claim",
    recipient: input.to,
    subject,
    status: "sent",
    providerId: data?.id ?? null,
  });
}
