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
