import "server-only";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * Audit trail for every text the local admin SMS sender attempts (see
 * lib/localSms.ts + /admin/sms). One row per recipient per send, grouped by
 * broadcast_id so a single "send" reads back as a batch with per-guest results.
 *
 * Like emailLog, writes are best-effort: logSms() swallows its own errors so a
 * logging hiccup never derails (or appears to derail) an actual send.
 */

export const SMS_LOG_TABLE = "sms_log";

/**
 *  sent    — handed to the Messages app without error
 *  failed  — the osascript send threw / returned an error
 *  skipped — sending wasn't available (not running locally on the Mac)
 */
export type SmsStatus = "sent" | "failed" | "skipped";

export type SmsLogEntry = {
  id: string;
  created_at: string;
  recipient: string;
  body: string;
  status: SmsStatus;
  error: string | null;
  broadcast_id: string | null;
};

export async function logSms(entry: {
  recipient: string;
  body: string;
  status: SmsStatus;
  error?: string | null;
  broadcastId?: string | null;
}): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const { error } = await getSupabase()
      .from(SMS_LOG_TABLE)
      .insert({
        recipient: entry.recipient,
        body: entry.body,
        status: entry.status,
        error: entry.error ?? null,
        broadcast_id: entry.broadcastId ?? null,
      });
    if (error) console.error("SMS log insert failed:", error.message);
  } catch (e) {
    console.error("SMS log insert threw:", e);
  }
}

/** Every logged text, newest first. Caller must have checked Supabase config. */
export async function getSmsLog(): Promise<SmsLogEntry[]> {
  const { data, error } = await getSupabase()
    .from(SMS_LOG_TABLE)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as SmsLogEntry[];
}
