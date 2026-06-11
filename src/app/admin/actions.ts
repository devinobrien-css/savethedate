"use server";

import { redirect } from "next/navigation";
import {
  checkPassword,
  createAdminSession,
  destroyAdminSession,
  isAdminPasswordConfigured,
} from "@/lib/auth";

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
