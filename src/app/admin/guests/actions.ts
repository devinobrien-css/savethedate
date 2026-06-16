"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAuthed } from "@/lib/auth";
import {
  getSupabase,
  isSupabaseConfigured,
  RSVP_TABLE,
  type RSVP,
} from "@/lib/supabase";
import { GUESTS_TABLE } from "@/lib/guests";

/**
 * Admin-only mutations for the address book. Each guards on the admin session
 * (same as the RSVP/registry actions) and revalidates the guests view so
 * changes show up immediately.
 */

async function guard(): Promise<boolean> {
  if (!(await isAuthed())) {
    redirect("/admin");
  }
  return isSupabaseConfigured();
}

function revalidate(): void {
  revalidatePath("/admin/guests");
}

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}

type GuestFields = {
  first_name: string;
  last_name: string | null;
  email: string | null;
  household_label: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
};

function readGuestFields(formData: FormData): GuestFields | null {
  const first_name = str(formData.get("first_name"));
  if (!first_name) return null; // first name is the one required field
  return {
    first_name,
    last_name: str(formData.get("last_name")) || null,
    // Emails are stored lowercased so they match the RSVP email index.
    email: str(formData.get("email")).toLowerCase() || null,
    household_label: str(formData.get("household_label")) || null,
    address_line1: str(formData.get("address_line1")) || null,
    address_line2: str(formData.get("address_line2")) || null,
    city: str(formData.get("city")) || null,
    state: str(formData.get("state")) || null,
    postal_code: str(formData.get("postal_code")) || null,
    country: str(formData.get("country")) || "USA",
  };
}

export async function createGuest(formData: FormData): Promise<void> {
  if (!(await guard())) return;
  const fields = readGuestFields(formData);
  if (!fields) return;

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from(GUESTS_TABLE)
    .insert({ ...fields, notes: str(formData.get("notes")) || null })
    .select("id")
    .single();
  if (error) {
    console.error("Guest create failed:", error.message);
    return;
  }

  // Optionally link an RSVP straight away (used by "Add to address book" on an
  // unlinked RSVP — we create the guest from it, then attach it).
  const linkRsvpId = str(formData.get("link_rsvp_id"));
  if (linkRsvpId && data?.id) {
    await supabase
      .from(RSVP_TABLE)
      .update({ guest_id: data.id })
      .eq("id", linkRsvpId);
  }
  revalidate();
}

export async function updateGuest(formData: FormData): Promise<void> {
  if (!(await guard())) return;
  const id = str(formData.get("id"));
  if (!id) return;
  const fields = readGuestFields(formData);
  if (!fields) return;

  const supabase = getSupabase();
  const { error } = await supabase
    .from(GUESTS_TABLE)
    .update({
      ...fields,
      notes: str(formData.get("notes")) || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) console.error("Guest update failed:", error.message);
  revalidate();
}

export async function deleteGuest(formData: FormData): Promise<void> {
  if (!(await guard())) return;
  const id = str(formData.get("id"));
  if (!id) return;

  // Linked RSVPs are preserved — the FK is ON DELETE SET NULL, so they simply
  // return to the "unlinked" list rather than being removed.
  const supabase = getSupabase();
  const { error } = await supabase.from(GUESTS_TABLE).delete().eq("id", id);
  if (error) console.error("Guest delete failed:", error.message);
  revalidate();
}

/** Attach an RSVP to a guest (or move it to a different guest). */
export async function linkRsvp(formData: FormData): Promise<void> {
  if (!(await guard())) return;
  const rsvpId = str(formData.get("rsvp_id"));
  const guestId = str(formData.get("guest_id"));
  if (!rsvpId || !guestId) return;

  const supabase = getSupabase();
  const { error } = await supabase
    .from(RSVP_TABLE)
    .update({ guest_id: guestId })
    .eq("id", rsvpId);
  if (error) console.error("RSVP link failed:", error.message);
  revalidate();
}

/** Detach an RSVP from its guest — it returns to the unlinked list. */
export async function unlinkRsvp(formData: FormData): Promise<void> {
  if (!(await guard())) return;
  const rsvpId = str(formData.get("rsvp_id"));
  if (!rsvpId) return;

  const supabase = getSupabase();
  const { error } = await supabase
    .from(RSVP_TABLE)
    .update({ guest_id: null })
    .eq("id", rsvpId);
  if (error) console.error("RSVP unlink failed:", error.message);
  revalidate();
}

/**
 * Create a guest pre-filled from an unlinked RSVP and link the RSVP to it in
 * one step. The new guest has the name + email already; the admin just fills in
 * the address afterward.
 */
export async function createGuestFromRsvp(formData: FormData): Promise<void> {
  if (!(await guard())) return;
  const rsvpId = str(formData.get("rsvp_id"));
  if (!rsvpId) return;

  const supabase = getSupabase();
  const { data: rsvp, error: readErr } = await supabase
    .from(RSVP_TABLE)
    .select("*")
    .eq("id", rsvpId)
    .single<RSVP>();
  if (readErr || !rsvp) {
    console.error("Guest-from-RSVP read failed:", readErr?.message);
    return;
  }

  const { data: guest, error: insertErr } = await supabase
    .from(GUESTS_TABLE)
    .insert({
      first_name: rsvp.first_name,
      last_name: rsvp.last_name || null,
      email: rsvp.email || null,
    })
    .select("id")
    .single();
  if (insertErr || !guest) {
    console.error("Guest-from-RSVP insert failed:", insertErr?.message);
    return;
  }

  const { error: linkErr } = await supabase
    .from(RSVP_TABLE)
    .update({ guest_id: guest.id })
    .eq("id", rsvpId);
  if (linkErr) console.error("Guest-from-RSVP link failed:", linkErr.message);
  revalidate();
}
