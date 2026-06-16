"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAuthed } from "@/lib/auth";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  REGISTRY_ITEMS_TABLE,
  REGISTRY_CLAIMS_TABLE,
} from "@/lib/registry";

/**
 * Admin-only mutations for the gift catalog. Each guards on the admin session
 * (same as the RSVP delete action) and revalidates both the admin view and the
 * public /registry page so changes show up immediately.
 */

async function guard(): Promise<boolean> {
  if (!(await isAuthed())) {
    redirect("/admin");
  }
  return isSupabaseConfigured();
}

function revalidateRegistry(): void {
  revalidatePath("/admin/registry");
  revalidatePath("/registry");
}

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}

/** Parse a "$129.00" / "129" / "" price field into integer cents, or null. */
function parsePriceCents(raw: string): number | null {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const dollars = Number(cleaned);
  if (!Number.isFinite(dollars) || dollars < 0) return null;
  return Math.round(dollars * 100);
}

type ItemFields = {
  title: string;
  description: string | null;
  price_cents: number | null;
  store_name: string | null;
  product_url: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  kind: "gift" | "fund";
  is_most_wanted: boolean;
};

function readItemFields(formData: FormData): ItemFields | null {
  const title = str(formData.get("title"));
  if (!title) return null;
  const sortRaw = parseInt(str(formData.get("sort_order")) || "0", 10);
  return {
    title,
    description: str(formData.get("description")) || null,
    price_cents: parsePriceCents(str(formData.get("price"))),
    store_name: str(formData.get("store_name")) || null,
    product_url: str(formData.get("product_url")) || null,
    image_url: str(formData.get("image_url")) || null,
    sort_order: Number.isFinite(sortRaw) ? sortRaw : 0,
    // Unchecked checkboxes submit nothing, so absence means inactive.
    is_active: str(formData.get("is_active")) === "on",
    kind: str(formData.get("kind")) === "fund" ? "fund" : "gift",
    is_most_wanted: str(formData.get("is_most_wanted")) === "on",
  };
}

/** Result of a save, so the admin form can show why a write didn't stick. */
export type ItemActionResult = { ok: true } | { ok: false; error: string };

const NOT_CONFIGURED: ItemActionResult = {
  ok: false,
  error: "Supabase isn't configured, so changes can't be saved.",
};

export async function createItem(formData: FormData): Promise<ItemActionResult> {
  if (!(await guard())) return NOT_CONFIGURED;
  const fields = readItemFields(formData);
  if (!fields) return { ok: false, error: "A title is required." };

  const supabase = getSupabase();
  const { error } = await supabase.from(REGISTRY_ITEMS_TABLE).insert(fields);
  if (error) {
    console.error("Registry item create failed:", error.message);
    return { ok: false, error: error.message };
  }
  revalidateRegistry();
  return { ok: true };
}

export async function updateItem(formData: FormData): Promise<ItemActionResult> {
  if (!(await guard())) return NOT_CONFIGURED;
  const id = str(formData.get("id"));
  if (!id) return { ok: false, error: "Missing the item to update." };
  const fields = readItemFields(formData);
  if (!fields) return { ok: false, error: "A title is required." };

  const supabase = getSupabase();
  const { error } = await supabase
    .from(REGISTRY_ITEMS_TABLE)
    .update(fields)
    .eq("id", id);
  if (error) {
    console.error("Registry item update failed:", error.message);
    return { ok: false, error: error.message };
  }
  revalidateRegistry();
  return { ok: true };
}

export async function deleteItem(formData: FormData): Promise<void> {
  if (!(await guard())) return;
  const id = str(formData.get("id"));
  if (!id) return;

  // Claims cascade-delete with the item (FK on delete cascade).
  const supabase = getSupabase();
  const { error } = await supabase.from(REGISTRY_ITEMS_TABLE).delete().eq("id", id);
  if (error) console.error("Registry item delete failed:", error.message);
  revalidateRegistry();
}

/**
 * Release the active claim on an item — frees it up again. Used to clear a
 * stuck `pending` claim (bad email, never confirmed) or to undo a confirmed
 * gift. We release rather than delete so the history stays intact.
 */
export async function releaseClaim(formData: FormData): Promise<void> {
  if (!(await guard())) return;
  const claimId = str(formData.get("claim_id"));
  if (!claimId) return;

  const supabase = getSupabase();
  const { error } = await supabase
    .from(REGISTRY_CLAIMS_TABLE)
    .update({ status: "released", released_at: new Date().toISOString() })
    .eq("id", claimId);
  if (error) console.error("Registry claim release failed:", error.message);
  revalidateRegistry();
}
