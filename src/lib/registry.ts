import "server-only";
import { getSupabase } from "@/lib/supabase";

/**
 * Registry data access. Mirrors the RSVP setup: all reads/writes go through the
 * server-side service-role client (see lib/supabase.ts), so callers must already
 * have checked isSupabaseConfigured().
 *
 *  registry_items   — the gift catalog, edited from /admin/registry
 *  registry_claims  — email-verified "mark as purchased" reservations
 *
 * Reservation model is qty=1: an item is "covered" the moment a guest leaves a
 * claim (status pending or confirmed). A DB partial-unique index guarantees at
 * most one active claim per item, so claims here are simple to reason about.
 */

export const REGISTRY_ITEMS_TABLE = "registry_items";
export const REGISTRY_CLAIMS_TABLE = "registry_claims";

export type ClaimStatus = "pending" | "confirmed" | "released";

/**
 * Why a claim left the active set. `expired` is the one the confirm page cares
 * about — a guest who clicks late should be told their reservation timed out,
 * not that they released it themselves. `unsent` marks the rollback we do when
 * the verification email can't be delivered at all.
 */
export type ReleaseReason = "guest" | "admin" | "expired" | "unsent";

/**
 * Pending-claim lifecycle. A claim only holds its gift until the guest confirms;
 * left unconfirmed it would block the item forever, so it ages out:
 *
 *   0h            claim created, verification email sent
 *   48h – 72h     one reminder ("confirm or we'll release it")
 *   72h+          released back to the registry, reason `expired`
 *
 * The reminder and the expiry share a daily cron tick. Because the reminder
 * window is exactly 24h wide, precisely one daily tick lands inside it — every
 * claim gets one nudge, never two.
 */
export const CLAIM_PENDING_TTL_MS = 72 * 60 * 60 * 1000;
export const CLAIM_REMINDER_AFTER_MS = 48 * 60 * 60 * 1000;

/**
 * A reminded guest is promised a day to act, so expiry holds off until the
 * nudge has had that long to land — otherwise another guest claiming the same
 * gift could sweep it away minutes after we emailed the warning.
 */
export const CLAIM_REMINDER_GRACE_MS = 24 * 60 * 60 * 1000;

/** Most active claims one email address may hold at once (anti-abuse). */
export const MAX_ACTIVE_CLAIMS_PER_EMAIL = 5;

/** `gift` = a normal claimable item; `fund` = a "contribute cash toward" card. */
export type RegistryKind = "gift" | "fund";

export type RegistryItem = {
  id: string;
  created_at: string;
  title: string;
  description: string | null;
  price_cents: number | null;
  store_name: string | null;
  product_url: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  kind: RegistryKind;
  is_most_wanted: boolean;
};

export type RegistryClaim = {
  id: string;
  created_at: string;
  item_id: string;
  claimer_name: string;
  claimer_email: string;
  status: ClaimStatus;
  confirmed_at: string | null;
  released_at: string | null;
  note: string | null;
  tracking: string | null;
  released_reason: ReleaseReason | null;
  reminder_sent_at: string | null;
};

/** A claim still holding an item (pending verification or fully confirmed). */
export function isActiveClaim(c: Pick<RegistryClaim, "status">): boolean {
  return c.status !== "released";
}

/**
 * A pending claim that has aged past its TTL. It still sits in the table (the
 * sweep clears it), but it no longer covers its gift — reads treat it as gone
 * so the item shows as available the moment it goes stale.
 */
export function isPendingExpired(
  c: Pick<RegistryClaim, "status" | "created_at">,
  now: number = Date.now()
): boolean {
  if (c.status !== "pending") return false;
  return now - Date.parse(c.created_at) >= CLAIM_PENDING_TTL_MS;
}

/** A claim that actually holds its gift right now. */
export function isCoveringClaim(
  c: Pick<RegistryClaim, "status" | "created_at">,
  now: number = Date.now()
): boolean {
  return isActiveClaim(c) && !isPendingExpired(c, now);
}

/** "$129.00" / "$8.50" — null when no price is set. */
export function formatPrice(cents: number | null): string | null {
  if (cents == null) return null;
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ── Public-facing: items + whether each is already covered ────────────────

export type PublicRegistryItem = RegistryItem & { claimed: boolean };

/**
 * Active catalog for the public /registry page, in display order, each tagged
 * with whether it's already covered. We never expose who claimed it.
 */
export async function getPublicRegistry(): Promise<PublicRegistryItem[]> {
  const supabase = getSupabase();

  const [{ data: items, error: itemsErr }, { data: claims, error: claimsErr }] =
    await Promise.all([
      supabase
        .from(REGISTRY_ITEMS_TABLE)
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
      supabase
        .from(REGISTRY_CLAIMS_TABLE)
        .select("item_id, status, created_at")
        .neq("status", "released"),
    ]);

  if (itemsErr) throw new Error(itemsErr.message);
  if (claimsErr) throw new Error(claimsErr.message);

  // A pending claim past its TTL no longer covers its gift, even though the row
  // is still here — the sweep that clears it runs on the next claim or cron
  // tick. Reading by the same rule keeps the page honest in the meantime.
  const now = Date.now();
  const claimedIds = new Set(
    ((claims ?? []) as Pick<RegistryClaim, "item_id" | "status" | "created_at">[])
      .filter((c) => isCoveringClaim(c, now))
      .map((c) => c.item_id)
  );
  return ((items ?? []) as RegistryItem[]).map((it) => ({
    ...it,
    claimed: claimedIds.has(it.id),
  }));
}

// ── Admin-facing: every item + its active claim (with claimer details) ────

export type AdminRegistryItem = RegistryItem & { claim: RegistryClaim | null };

/** Full catalog (active + inactive) with each item's active claim, if any. */
export async function getAdminRegistry(): Promise<AdminRegistryItem[]> {
  const supabase = getSupabase();

  const [{ data: items, error: itemsErr }, { data: claims, error: claimsErr }] =
    await Promise.all([
      supabase
        .from(REGISTRY_ITEMS_TABLE)
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
      supabase
        .from(REGISTRY_CLAIMS_TABLE)
        .select("*")
        .neq("status", "released"),
    ]);

  if (itemsErr) throw new Error(itemsErr.message);
  if (claimsErr) throw new Error(claimsErr.message);

  const byItem = new Map<string, RegistryClaim>();
  for (const c of (claims ?? []) as RegistryClaim[]) byItem.set(c.item_id, c);

  return ((items ?? []) as RegistryItem[]).map((it) => ({
    ...it,
    claim: byItem.get(it.id) ?? null,
  }));
}


// ── Pending-claim maintenance ─────────────────────────────────────────────

/**
 * Release every pending claim that has aged out, freeing its gift. Called
 * opportunistically before a new claim (so a stale row can't trip the
 * one-active-claim index) and on the daily cron tick.
 *
 * Claims reminded less than `CLAIM_REMINDER_GRACE_MS` ago are left alone: we
 * told that guest they had a day to confirm, so we honour it even if another
 * guest is trying to claim the same gift.
 *
 * Returns the number of claims released.
 */
export async function expireStalePendingClaims(now: number = Date.now()): Promise<number> {
  const supabase = getSupabase();
  const staleBefore = new Date(now - CLAIM_PENDING_TTL_MS).toISOString();
  const remindedBefore = new Date(now - CLAIM_REMINDER_GRACE_MS).toISOString();

  const { data, error } = await supabase
    .from(REGISTRY_CLAIMS_TABLE)
    .update({
      status: "released",
      released_at: new Date(now).toISOString(),
      released_reason: "expired",
    })
    .eq("status", "pending")
    .lt("created_at", staleBefore)
    .or(`reminder_sent_at.is.null,reminder_sent_at.lt.${remindedBefore}`)
    .select("id");

  if (error) {
    console.error("Registry stale-claim sweep failed:", error.message);
    return 0;
  }
  return data?.length ?? 0;
}

/**
 * How many gifts this email address is currently holding. Used to cap one
 * person (or one bot working through the catalog) at a sensible number.
 */
export async function countActiveClaimsForEmail(email: string): Promise<number> {
  const supabase = getSupabase();
  const { count, error } = await supabase
    .from(REGISTRY_CLAIMS_TABLE)
    .select("id", { count: "exact", head: true })
    .eq("claimer_email", email)
    .neq("status", "released");

  if (error) {
    // Fail open: a counting problem shouldn't stop a genuine guest giving a gift.
    console.error("Registry active-claim count failed:", error.message);
    return 0;
  }
  return count ?? 0;
}
