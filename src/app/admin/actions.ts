"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  checkPassword,
  createAdminSession,
  destroyAdminSession,
  isAdminPasswordConfigured,
  isAuthed,
} from "@/lib/auth";
import { getSupabase, isSupabaseConfigured, RSVP_TABLE } from "@/lib/supabase";

export type LoginState = { error?: string };

export async function login(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  if (!isAdminPasswordConfigured()) {
    return { error: "Admin password is not configured (set ADMIN_PASSWORD)." };
  }
  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) {
    return { error: "Incorrect password." };
  }
  await createAdminSession();
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await destroyAdminSession();
  redirect("/admin");
}

export async function deleteRsvp(formData: FormData): Promise<void> {
  // Guard: only an authenticated admin may delete.
  if (!(await isAuthed())) {
    redirect("/admin");
  }
  if (!isSupabaseConfigured()) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = getSupabase();
  const { error } = await supabase.from(RSVP_TABLE).delete().eq("id", id);
  if (error) {
    console.error("RSVP delete failed:", error.message);
  }
  revalidatePath("/admin");
}

export type UpdateRsvpResult = { error?: string };

/**
 * Edit an existing RSVP. Applies the same rules as the public form
 * (/api/rsvp): a decline zeroes the party and clears dietary/room answers.
 */
export async function updateRsvp(formData: FormData): Promise<UpdateRsvpResult> {
  if (!(await isAuthed())) {
    redirect("/admin");
  }
  if (!isSupabaseConfigured()) return { error: "Supabase isn't configured." };

  const str = (key: string) => String(formData.get(key) ?? "").trim();
  const id = str("id");
  const firstName = str("first_name");
  const lastName = str("last_name");
  const email = str("email").toLowerCase();
  const attending = str("attending") === "yes";
  const partySize = Math.max(1, Math.min(20, parseInt(str("party_size"), 10) || 1));
  const dietary = str("dietary").slice(0, 1000);
  const note = str("note");

  if (!id) return { error: "Missing RSVP id." };
  if (!firstName || !lastName) return { error: "First and last name are required." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { error: "Please enter a valid email." };
  }

  const supabase = getSupabase();
  const { error } = await supabase
    .from(RSVP_TABLE)
    .update({
      first_name: firstName,
      last_name: lastName,
      email,
      attending,
      party_size: attending ? partySize : 0,
      note: note || null,
      dietary: attending && dietary ? dietary : null,
      room_request: attending && str("room_request") === "on",
    })
    .eq("id", id);
  if (error) {
    console.error("RSVP update failed:", error.message);
    // rsvps.email is unique (the public form upserts on it).
    if (error.code === "23505") {
      return { error: "Another RSVP already uses that email." };
    }
    return { error: "Couldn't save changes." };
  }
  revalidatePath("/admin");
  return {};
}
