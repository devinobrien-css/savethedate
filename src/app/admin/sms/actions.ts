"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { isAuthed } from "@/lib/auth";
import { getSupabase, isSupabaseConfigured, RSVP_TABLE } from "@/lib/supabase";
import { isLocalSmsAvailable, sendViaMessages } from "@/lib/localSms";
import { logSms } from "@/lib/smsLog";
import { toE164 } from "@/lib/phone";

export type SendState = { ok?: boolean; message?: string; error?: string };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Gap between sends so a burst from a personal number doesn't look like spam. */
function throttleMs(): number {
  const n = parseInt(process.env.SMS_THROTTLE_MS || "", 10);
  return Number.isFinite(n) && n >= 0 ? n : 2000;
}

/**
 * Send a text to either a single test number or every opted-in guest, one at a
 * time through the Mac's Messages app. Each recipient is logged (sent/failed)
 * under one broadcast_id. Returns a summary for the composer to display.
 */
export async function sendBroadcast(
  _prev: SendState,
  formData: FormData
): Promise<SendState> {
  if (!(await isAuthed())) return { error: "Not signed in." };
  if (!isLocalSmsAvailable()) {
    return {
      error:
        "Sending only works when the admin runs locally on the Mac (Messages isn't reachable on the deployed host).",
    };
  }
  if (!isSupabaseConfigured()) return { error: "Supabase isn't configured." };

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Write a message first." };

  // Resolve recipients (E.164, de-duplicated).
  let invalidExtra = 0;

  // Selected guests: resolve their phones server-side from the chosen IDs, so
  // we re-check opt-in/opt-out at send time and never trust client phones.
  const guestIds = formData.getAll("guestId").map(String).filter(Boolean);
  const guestPhones: string[] = [];
  if (guestIds.length > 0) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from(RSVP_TABLE)
      .select("phone")
      .in("id", guestIds)
      .eq("sms_opt_in", true)
      .eq("sms_opted_out", false)
      .not("phone", "is", null);
    if (error) return { error: `Couldn't load recipients: ${error.message}` };
    guestPhones.push(...(data ?? []).map((r) => r.phone as string).filter(Boolean));
  }

  // Extra ad-hoc numbers: free-typed, normalized here; bad ones are counted
  // and skipped rather than aborting the send.
  const extraPhones: string[] = [];
  for (const tok of String(formData.get("extraNumbers") ?? "").split(/[\s,;]+/)) {
    if (!tok) continue;
    const e164 = toE164(tok);
    if (e164) extraPhones.push(e164);
    else invalidExtra++;
  }

  const recipients = [...new Set([...guestPhones, ...extraPhones])];
  if (recipients.length === 0)
    return { error: "No valid recipients selected." };

  const broadcastId = randomUUID();
  const gap = throttleMs();
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < recipients.length; i++) {
    const to = recipients[i];
    try {
      await sendViaMessages(to, body);
      sent++;
      await logSms({ recipient: to, body, status: "sent", broadcastId });
    } catch (e) {
      failed++;
      const error = e instanceof Error ? e.message : String(e);
      await logSms({ recipient: to, body, status: "failed", error, broadcastId });
    }
    if (i < recipients.length - 1 && gap > 0) await sleep(gap);
  }

  revalidatePath("/admin/sms");

  return {
    ok: failed === 0 && invalidExtra === 0,
    message:
      `Broadcast done — ${sent} sent` +
      (failed ? `, ${failed} failed` : "") +
      (invalidExtra ? `, ${invalidExtra} invalid number${invalidExtra === 1 ? "" : "s"} skipped` : "") +
      ".",
  };
}
