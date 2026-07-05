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
import { PARTIES_TABLE, GUESTS_TABLE } from "@/lib/guests";

/**
 * Admin-only mutations for the address book. The mailing unit is the *party*
 * (household label + one address); each party holds one or more *guests* (the
 * named people). Each action guards on the admin session (same as the
 * RSVP/registry actions) and revalidates the guests view.
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

type PartyFields = {
  household_label: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  notes: string | null;
};

function readPartyFields(formData: FormData): PartyFields {
  return {
    household_label: str(formData.get("household_label")) || null,
    address_line1: str(formData.get("address_line1")) || null,
    address_line2: str(formData.get("address_line2")) || null,
    city: str(formData.get("city")) || null,
    state: str(formData.get("state")) || null,
    postal_code: str(formData.get("postal_code")) || null,
    country: str(formData.get("country")) || "USA",
    notes: str(formData.get("notes")) || null,
  };
}

type PersonFields = {
  first_name: string;
  last_name: string | null;
  email: string | null;
  notes: string | null;
};

function readPersonFields(formData: FormData): PersonFields | null {
  const first_name = str(formData.get("first_name"));
  if (!first_name) return null; // first name is the one required field
  return {
    first_name,
    last_name: str(formData.get("last_name")) || null,
    // Emails are stored lowercased so they match the RSVP email index.
    email: str(formData.get("email")).toLowerCase() || null,
    notes: str(formData.get("notes")) || null,
  };
}

// ── Parties (the envelope: household + address) ──────────────────────────────

/**
 * Create a party together with its first guest (a party must have at least one
 * person). Optionally links an existing RSVP to that first guest — used by
 * "Add to address book" on an unlinked RSVP.
 */
export async function createParty(formData: FormData): Promise<void> {
  if (!(await guard())) return;
  const person = readPersonFields(formData);
  if (!person) return; // need at least the first guest's name

  const supabase = getSupabase();
  const { data: party, error: partyErr } = await supabase
    .from(PARTIES_TABLE)
    .insert(readPartyFields(formData))
    .select("id")
    .single();
  if (partyErr || !party) {
    console.error("Party create failed:", partyErr?.message);
    return;
  }

  const { data: guest, error: guestErr } = await supabase
    .from(GUESTS_TABLE)
    .insert({ ...person, party_id: party.id })
    .select("id")
    .single();
  if (guestErr || !guest) {
    console.error("First guest create failed:", guestErr?.message);
    return;
  }

  const linkRsvpId = str(formData.get("link_rsvp_id"));
  if (linkRsvpId) {
    await supabase
      .from(RSVP_TABLE)
      .update({ party_id: party.id })
      .eq("id", linkRsvpId);
  }
  revalidate();
}

/** Update a party's household label + mailing address. */
export async function updateParty(formData: FormData): Promise<void> {
  if (!(await guard())) return;
  const id = str(formData.get("id"));
  if (!id) return;

  const supabase = getSupabase();
  const { error } = await supabase
    .from(PARTIES_TABLE)
    .update({ ...readPartyFields(formData), updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) console.error("Party update failed:", error.message);
  revalidate();
}

/**
 * Delete a party and everyone in it (guests cascade). The party's RSVPs are
 * preserved — rsvps.party_id is ON DELETE SET NULL, so they return to the
 * unlinked list rather than being removed.
 */
export async function deleteParty(formData: FormData): Promise<void> {
  if (!(await guard())) return;
  const id = str(formData.get("id"));
  if (!id) return;

  const supabase = getSupabase();
  const { error } = await supabase.from(PARTIES_TABLE).delete().eq("id", id);
  if (error) console.error("Party delete failed:", error.message);
  revalidate();
}

// ── Guests (the named people inside a party) ─────────────────────────────────

/** Add a person to an existing party (appended to the end of its order). */
export async function addGuest(formData: FormData): Promise<void> {
  if (!(await guard())) return;
  const party_id = str(formData.get("party_id"));
  const person = readPersonFields(formData);
  if (!party_id || !person) return;

  const supabase = getSupabase();
  // New people sort after the existing ones in the party.
  const { count } = await supabase
    .from(GUESTS_TABLE)
    .select("id", { count: "exact", head: true })
    .eq("party_id", party_id);

  const { error } = await supabase
    .from(GUESTS_TABLE)
    .insert({ ...person, party_id, sort_order: count ?? 0 });
  if (error) console.error("Guest add failed:", error.message);
  revalidate();
}

/**
 * Move a person up or down within their party. Loads the party in its current
 * order, swaps the target with its neighbor, then rewrites a clean 0..n-1
 * sequence so the new order sticks even if existing sort_order values collide.
 */
export async function moveGuest(formData: FormData): Promise<void> {
  if (!(await guard())) return;
  const id = str(formData.get("id"));
  const dir = str(formData.get("dir")); // "up" | "down"
  if (!id || (dir !== "up" && dir !== "down")) return;

  const supabase = getSupabase();
  const { data: target, error: readErr } = await supabase
    .from(GUESTS_TABLE)
    .select("party_id")
    .eq("id", id)
    .single<{ party_id: string | null }>();
  if (readErr || !target?.party_id) return;

  const { data: members, error: listErr } = await supabase
    .from(GUESTS_TABLE)
    .select("id")
    .eq("party_id", target.party_id)
    .order("sort_order", { ascending: true })
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true });
  if (listErr || !members) {
    console.error("Guest move read failed:", listErr?.message);
    return;
  }

  const ids = members.map((m) => m.id as string);
  const i = ids.indexOf(id);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i === -1 || j < 0 || j >= ids.length) return; // already at an edge
  [ids[i], ids[j]] = [ids[j], ids[i]];

  // Rewrite a clean 0..n-1 sequence (a few rows; safe regardless of prior values).
  await Promise.all(
    ids.map((gid, idx) =>
      supabase.from(GUESTS_TABLE).update({ sort_order: idx }).eq("id", gid),
    ),
  );
  revalidate();
}

/** Edit a single person's name / email / note. */
export async function updateGuest(formData: FormData): Promise<void> {
  if (!(await guard())) return;
  const id = str(formData.get("id"));
  const person = readPersonFields(formData);
  if (!id || !person) return;

  const supabase = getSupabase();
  const { error } = await supabase
    .from(GUESTS_TABLE)
    .update({ ...person, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) console.error("Guest update failed:", error.message);
  revalidate();
}

/**
 * Remove a single person from a party (their RSVP, if any, is kept and returns
 * to the unlinked list). Note: deleting a party's last guest leaves an empty
 * party; the admin can delete the party itself if they want it gone.
 */
export async function deleteGuest(formData: FormData): Promise<void> {
  if (!(await guard())) return;
  const id = str(formData.get("id"));
  if (!id) return;

  const supabase = getSupabase();
  const { error } = await supabase.from(GUESTS_TABLE).delete().eq("id", id);
  if (error) console.error("Guest delete failed:", error.message);
  revalidate();
}

// ── RSVP ↔ party linking ─────────────────────────────────────────────────────

/** Attach an RSVP to a party (or move it to a different party). */
export async function linkRsvp(formData: FormData): Promise<void> {
  if (!(await guard())) return;
  const rsvpId = str(formData.get("rsvp_id"));
  const partyId = str(formData.get("party_id"));
  if (!rsvpId || !partyId) return;

  const supabase = getSupabase();
  const { error } = await supabase
    .from(RSVP_TABLE)
    .update({ party_id: partyId })
    .eq("id", rsvpId);
  if (error) console.error("RSVP link failed:", error.message);
  revalidate();
}

/** Detach an RSVP from its party — it returns to the unlinked list. */
export async function unlinkRsvp(formData: FormData): Promise<void> {
  if (!(await guard())) return;
  const rsvpId = str(formData.get("rsvp_id"));
  if (!rsvpId) return;

  const supabase = getSupabase();
  const { error } = await supabase
    .from(RSVP_TABLE)
    .update({ party_id: null })
    .eq("id", rsvpId);
  if (error) console.error("RSVP unlink failed:", error.message);
  revalidate();
}

/**
 * Create a new party (with its first guest) pre-filled from an unlinked RSVP
 * and link the RSVP to that party in one step. The new party has the person's
 * name + email; the admin fills in the address afterward.
 */
export async function createPartyFromRsvp(formData: FormData): Promise<void> {
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
    console.error("Party-from-RSVP read failed:", readErr?.message);
    return;
  }

  const { data: party, error: partyErr } = await supabase
    .from(PARTIES_TABLE)
    .insert({})
    .select("id")
    .single();
  if (partyErr || !party) {
    console.error("Party-from-RSVP party insert failed:", partyErr?.message);
    return;
  }

  const { error: insertErr } = await supabase
    .from(GUESTS_TABLE)
    .insert({
      party_id: party.id,
      first_name: rsvp.first_name,
      last_name: rsvp.last_name || null,
      email: rsvp.email || null,
    });
  if (insertErr) {
    console.error("Party-from-RSVP guest insert failed:", insertErr?.message);
    return;
  }

  const { error: linkErr } = await supabase
    .from(RSVP_TABLE)
    .update({ party_id: party.id })
    .eq("id", rsvpId);
  if (linkErr) console.error("Party-from-RSVP link failed:", linkErr.message);
  revalidate();
}
