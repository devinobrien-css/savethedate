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
};

/** A claim still holding an item (pending verification or fully confirmed). */
export function isActiveClaim(c: Pick<RegistryClaim, "status">): boolean {
  return c.status !== "released";
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
        .select("item_id, status")
        .neq("status", "released"),
    ]);

  if (itemsErr) throw new Error(itemsErr.message);
  if (claimsErr) throw new Error(claimsErr.message);

  const claimedIds = new Set((claims ?? []).map((c) => c.item_id as string));
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
