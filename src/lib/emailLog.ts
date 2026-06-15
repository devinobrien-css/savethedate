import "server-only";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * Audit trail for every transactional email the app attempts. Each send (RSVP
 * confirmation, registry claim verification, …) records one row here with its
 * outcome, so the couple can see — from /admin/emails — exactly what went out,
 * to whom, and which attempts failed or were skipped (Resend not configured).
 *
 * Writes are best-effort: logEmail() swallows its own errors so a logging
 * problem can never break (or appear to break) the email it's recording.
 */

export const EMAIL_LOG_TABLE = "email_log";

/** Stable identifiers for each kind of email we send. */
export type EmailType = "rsvp_confirmation" | "registry_claim";

export const EMAIL_TYPE_LABELS: Record<EmailType, string> = {
  rsvp_confirmation: "RSVP confirmation",
  registry_claim: "Registry claim",
};

/**
 *  sent    — handed off to Resend successfully
 *  failed  — Resend returned an error (or threw)
 *  skipped — email isn't configured, so nothing was attempted
 */
export type EmailStatus = "sent" | "failed" | "skipped";

export type EmailLogEntry = {
  id: string;
  created_at: string;
  type: string;
  recipient: string;
  subject: string | null;
  status: EmailStatus;
  provider_id: string | null;
  error: string | null;
};

export async function logEmail(entry: {
  type: EmailType;
  recipient: string;
  subject?: string | null;
  status: EmailStatus;
  providerId?: string | null;
  error?: string | null;
}): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const { error } = await getSupabase()
      .from(EMAIL_LOG_TABLE)
      .insert({
        type: entry.type,
        recipient: entry.recipient,
        subject: entry.subject ?? null,
        status: entry.status,
        provider_id: entry.providerId ?? null,
        error: entry.error ?? null,
      });
    if (error) console.error("Email log insert failed:", error.message);
  } catch (e) {
    console.error("Email log insert threw:", e);
  }
}

/** Every logged email, newest first. Caller must have checked Supabase config. */
export async function getEmailLog(): Promise<EmailLogEntry[]> {
  const { data, error } = await getSupabase()
    .from(EMAIL_LOG_TABLE)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as EmailLogEntry[];
}
