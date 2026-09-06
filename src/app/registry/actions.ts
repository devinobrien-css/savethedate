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
    .update({
      status: "released",
      released_at: new Date().toISOString(),
      released_reason: "guest",
    })
    .eq("id", claimId)
    .neq("status", "released");

  if (error) {
    console.error("Registry release-by-token failed:", error.message);
    redirect("/registry/release?status=error");
  }

  revalidatePath("/registry");
  redirect("/registry/release?status=done");
}

/**
 * Save (or clear) the optional tracking number/link a gifter leaves on the
 * confirm page. Reuses the confirm token — the guest is already on that page —
 * and only touches active claims. Always redirects back to the confirm page,
 * which re-runs its idempotent confirm and shows the saved tracking.
 */
export async function saveTrackingByToken(formData: FormData): Promise<void> {
  const token = String(formData.get("token") ?? "");
  const tracking = String(formData.get("tracking") ?? "").trim().slice(0, 500);
  const back = `/registry/confirm?token=${encodeURIComponent(token)}`;

  const claimId = verifyToken(token, "registry:confirm", REGISTRY_TOKEN_MAX_AGE_MS);
  if (!claimId || !isSupabaseConfigured()) redirect(back);

  const supabase = getSupabase();
  // `select` so we can tell an actual write from a no-op: an update that matches
  // zero rows (claim gone, or already released) reports no error, and we don't
  // want to thank the guest for something we never stored.
  const { data, error } = await supabase
    .from(REGISTRY_CLAIMS_TABLE)
    .update({ tracking: tracking || null })
    .eq("id", claimId)
    .neq("status", "released")
    .select("id");

  if (error) {
    console.error("Registry tracking save failed:", error.message);
    redirect(`${back}&saved=error`);
  }
  if (!data || data.length === 0) redirect(`${back}&saved=error`);

  revalidatePath("/admin/registry");
  redirect(`${back}&saved=1`);
}
