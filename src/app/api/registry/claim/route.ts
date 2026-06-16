import { NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  REGISTRY_ITEMS_TABLE,
  REGISTRY_CLAIMS_TABLE,
  type RegistryItem,
} from "@/lib/registry";
import { signToken } from "@/lib/token";
import { sendRegistryClaimVerification } from "@/lib/email";

export const runtime = "nodejs";

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}

/** Absolute base for email links: SITE_URL if set, else this request's origin. */
function siteBase(request: Request): string {
  return (process.env.SITE_URL || new URL(request.url).origin).replace(/\/+$/, "");
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "The registry isn't available right now." },
      { status: 503 }
    );
  }

  let data: FormData;
  try {
    data = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: bots fill hidden fields. Pretend success so they don't retry.
  if (str(data.get("website"))) {
    return NextResponse.json({ ok: true });
  }

  const itemId = str(data.get("itemId"));
  const name = str(data.get("name"));
  const email = str(data.get("email")).toLowerCase();
  // Optional note from the gifter; cap it so the column can't be abused.
  const note = str(data.get("note")).slice(0, 500) || null;

  if (!itemId) {
    return NextResponse.json({ error: "Missing the gift." }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ error: "Please include your name." }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "Please include a valid email." }, { status: 400 });
  }

  const supabase = getSupabase();

  // Confirm the item exists and is still active.
  const { data: itemRow, error: itemErr } = await supabase
    .from(REGISTRY_ITEMS_TABLE)
    .select("id, title, is_active")
    .eq("id", itemId)
    .maybeSingle();

  if (itemErr) {
    console.error("Registry item lookup failed:", itemErr.message);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
  const item = itemRow as Pick<RegistryItem, "id" | "title" | "is_active"> | null;
  if (!item || !item.is_active) {
    return NextResponse.json({ error: "That gift is no longer available." }, { status: 404 });
  }

  // Create the pending claim. The partial-unique index (one active claim per
  // item) is the real guard against a double-claim race — a second submitter
  // hits a unique violation here, which we translate into a friendly 409.
  const { data: claimRow, error: claimErr } = await supabase
    .from(REGISTRY_CLAIMS_TABLE)
    .insert({ item_id: item.id, claimer_name: name, claimer_email: email, note })
    .select("id")
    .single();

  if (claimErr) {
    if (claimErr.code === "23505") {
      return NextResponse.json(
        { error: "Someone just claimed this one — please pick another gift." },
        { status: 409 }
      );
    }
    console.error("Registry claim insert failed:", claimErr.message);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }

  const claimId = (claimRow as { id: string }).id;

  // Send the verification email. This step is load-bearing — the claim only
  // counts once confirmed — so if we can't email them, undo the reservation
  // and ask them to retry rather than silently locking the gift.
  try {
    const base = siteBase(request);
    const now = Date.now();
    const confirmUrl = `${base}/registry/confirm?token=${encodeURIComponent(
      signToken("registry:confirm", claimId, now)
    )}`;
    const releaseUrl = `${base}/registry/release?token=${encodeURIComponent(
      signToken("registry:release", claimId, now)
    )}`;

    await sendRegistryClaimVerification({
      to: email,
      name,
      itemTitle: item.title,
      confirmUrl,
      releaseUrl,
    });
  } catch (e) {
    console.error("Registry verification email failed:", e);
    await supabase
      .from(REGISTRY_CLAIMS_TABLE)
      .update({ status: "released", released_at: new Date().toISOString() })
      .eq("id", claimId);
    return NextResponse.json(
      { error: "We couldn't send the confirmation email. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
