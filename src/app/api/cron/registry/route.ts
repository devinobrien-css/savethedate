import { NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  REGISTRY_CLAIMS_TABLE,
  REGISTRY_ITEMS_TABLE,
  CLAIM_PENDING_TTL_MS,
  CLAIM_REMINDER_AFTER_MS,
  expireStalePendingClaims,
  type RegistryClaim,
} from "@/lib/registry";
import { EMAIL_LOG_TABLE } from "@/lib/emailLog";
import { signToken } from "@/lib/token";
import { siteBase } from "@/lib/siteUrl";
import { sendRegistryClaimReminder } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Daily pending-claim sweep (see vercel.json crons).
 *
 * Two passes, in this order:
 *   1. remind — claims aged 48–72h get the one "still giving this?" nudge
 *   2. expire — claims past 72h go back on the registry
 *
 * Reminding first matters: a claim sitting right at the boundary should get its
 * warning on this tick and be released on the next, never both at once. The
 * expiry itself honours that grace period (see expireStalePendingClaims).
 *
 * The reminder window is exactly 24h wide, so on a daily schedule precisely one
 * tick lands inside it — every claim gets one nudge, never two. `reminder_sent_at`
 * is the belt-and-braces guard if the schedule is ever run more often.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  // Without a secret this would be an open endpoint that anyone could use to
  // force email sends, so refuse rather than run unauthenticated.
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET is not configured." },
      { status: 503 }
    );
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, skipped: "supabase-not-configured" });
  }

  const now = Date.now();
  const reminded = await sendDueReminders(request, now);
  const expired = await expireStalePendingClaims(now);

  return NextResponse.json({ ok: true, reminded, expired });
}

type ReminderResult = { sent: number; skipped: number; failed: number };

/**
 * Nudge every pending claim in the 48–72h window that hasn't been nudged yet.
 *
 * Addresses whose original verification email never actually left are skipped:
 * those are overwhelmingly typos, and re-sending to them only generates a
 * second bounce against a domain that also carries our RSVP mail. They still
 * expire on schedule — they just don't get mailed twice.
 */
async function sendDueReminders(request: Request, now: number): Promise<ReminderResult> {
  const result: ReminderResult = { sent: 0, skipped: 0, failed: 0 };
  const supabase = getSupabase();

  const windowStart = new Date(now - CLAIM_PENDING_TTL_MS).toISOString();
  const windowEnd = new Date(now - CLAIM_REMINDER_AFTER_MS).toISOString();

  const { data, error } = await supabase
    .from(REGISTRY_CLAIMS_TABLE)
    .select("id, item_id, claimer_name, claimer_email")
    .eq("status", "pending")
    .is("reminder_sent_at", null)
    .gte("created_at", windowStart)
    .lt("created_at", windowEnd);

  if (error) {
    console.error("Registry reminder lookup failed:", error.message);
    return result;
  }
  const due = (data ?? []) as Pick<
    RegistryClaim,
    "id" | "item_id" | "claimer_name" | "claimer_email"
  >[];
  if (due.length === 0) return result;

  // Only remind addresses the first email actually reached.
  const { data: logRows } = await supabase
    .from(EMAIL_LOG_TABLE)
    .select("recipient")
    .eq("type", "registry_claim")
    .eq("status", "sent")
    .in("recipient", [...new Set(due.map((c) => c.claimer_email))]);
  const deliverable = new Set(
    ((logRows ?? []) as { recipient: string }[]).map((r) => r.recipient)
  );

  // Titles for the batch, so each send doesn't re-query.
  const { data: itemRows } = await supabase
    .from(REGISTRY_ITEMS_TABLE)
    .select("id, title")
    .in("id", [...new Set(due.map((c) => c.item_id))]);
  const titles = new Map(
    ((itemRows ?? []) as { id: string; title: string }[]).map((i) => [i.id, i.title])
  );

  const base = siteBase(request);

  for (const claim of due) {
    if (!deliverable.has(claim.claimer_email)) {
      result.skipped += 1;
      continue;
    }
    try {
      const issued = Date.now();
      await sendRegistryClaimReminder({
        to: claim.claimer_email,
        name: claim.claimer_name,
        itemTitle: titles.get(claim.item_id) ?? "your gift",
        confirmUrl: `${base}/registry/confirm?token=${encodeURIComponent(
          signToken("registry:confirm", claim.id, issued)
        )}`,
        releaseUrl: `${base}/registry/release?token=${encodeURIComponent(
          signToken("registry:release", claim.id, issued)
        )}`,
      });
      // Stamped only after a successful send, so a failure retries tomorrow —
      // while still inside the window, since expiry defers to the grace period.
      await supabase
        .from(REGISTRY_CLAIMS_TABLE)
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq("id", claim.id);
      result.sent += 1;
    } catch (e) {
      // One bad address must not strand the rest of the batch.
      console.error(`Registry reminder failed for claim ${claim.id}:`, e);
      result.failed += 1;
    }
  }

  return result;
}
