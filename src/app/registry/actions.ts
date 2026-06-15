"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { REGISTRY_CLAIMS_TABLE } from "@/lib/registry";
import { verifyToken, REGISTRY_TOKEN_MAX_AGE_MS } from "@/lib/token";

/**
 * Release a claim from the link we emailed the guest. Triggered by a POST
 * (the "Yes, release it" button) rather than the page's GET load, so an email
 * scanner pre-fetching the link can't silently un-claim someone's gift.
 */
export async function releaseByToken(formData: FormData): Promise<void> {
  const token = String(formData.get("token") ?? "");
  const claimId = verifyToken(token, "registry:release", REGISTRY_TOKEN_MAX_AGE_MS);

  if (!claimId || !isSupabaseConfigured()) {
    redirect("/registry/release?status=invalid");
  }

  const supabase = getSupabase();
  // Only an active claim can be released; releasing an already-released one is
  // a no-op. We don't error either way — the guest just sees it's freed.
  const { error } = await supabase
    .from(REGISTRY_CLAIMS_TABLE)
    .update({ status: "released", released_at: new Date().toISOString() })
    .eq("id", claimId)
    .neq("status", "released");

  if (error) {
    console.error("Registry release-by-token failed:", error.message);
    redirect("/registry/release?status=error");
  }

  revalidatePath("/registry");
  redirect("/registry/release?status=done");
}
