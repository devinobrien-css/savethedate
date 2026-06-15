import type { Metadata } from "next";
import Link from "next/link";
import { wedding } from "@/config/site";
import InfoPage from "@/components/InfoPage";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  REGISTRY_CLAIMS_TABLE,
  REGISTRY_ITEMS_TABLE,
  type RegistryClaim,
} from "@/lib/registry";
import { verifyToken, REGISTRY_TOKEN_MAX_AGE_MS } from "@/lib/token";

export const metadata: Metadata = {
  title: `Confirm your gift — ${wedding.partnerA} & ${wedding.partnerB}`,
  robots: { index: false, follow: false },
};

// Performs the confirm on load, so never cache.
export const dynamic = "force-dynamic";

type Outcome =
  | { kind: "ok"; itemTitle: string }
  | { kind: "released" }
  | { kind: "invalid" }
  | { kind: "error" };

async function confirm(token: string | undefined): Promise<Outcome> {
  const claimId = verifyToken(token, "registry:confirm", REGISTRY_TOKEN_MAX_AGE_MS);
  if (!claimId || !isSupabaseConfigured()) return { kind: "invalid" };

  const supabase = getSupabase();
  const { data: claimRow, error } = await supabase
    .from(REGISTRY_CLAIMS_TABLE)
    .select("*")
    .eq("id", claimId)
    .maybeSingle();

  if (error) {
    console.error("Registry confirm lookup failed:", error.message);
    return { kind: "error" };
  }
  const claim = claimRow as RegistryClaim | null;
  if (!claim) return { kind: "invalid" };
  if (claim.status === "released") return { kind: "released" };

  // pending → confirmed (idempotent: a re-click while already confirmed is fine)
  if (claim.status === "pending") {
    const { error: upErr } = await supabase
      .from(REGISTRY_CLAIMS_TABLE)
      .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
      .eq("id", claim.id);
    if (upErr) {
      console.error("Registry confirm update failed:", upErr.message);
      return { kind: "error" };
    }
  }

  const { data: itemRow } = await supabase
    .from(REGISTRY_ITEMS_TABLE)
    .select("title")
    .eq("id", claim.item_id)
    .maybeSingle();

  return { kind: "ok", itemTitle: (itemRow as { title: string } | null)?.title ?? "your gift" };
}

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const outcome = await confirm(token);

  if (outcome.kind === "ok") {
    return (
      <InfoPage eyebrow="Registry & Gifts" title="Thank you — it's confirmed">
        <p className="text-sm leading-relaxed text-v1-denim/80">
          You're giving <span className="font-medium text-v1-ink">{outcome.itemTitle}</span>.
          We've marked it as covered so no one else doubles up. It means so much to us.
        </p>
        <p className="mt-8 text-[11px] uppercase tracking-widest2 text-v1-denim">
          With love · {wedding.partnerA} &amp; {wedding.partnerB}
        </p>
      </InfoPage>
    );
  }

  const messages: Record<Exclude<Outcome["kind"], "ok">, { title: string; body: string }> = {
    released: {
      title: "This gift was released",
      body: "This reservation has been released, so the gift is open for someone else. If that wasn't intended, head back to the registry and claim it again.",
    },
    invalid: {
      title: "This link isn't valid",
      body: "The confirmation link is invalid or has expired. You can return to the registry and mark the gift again.",
    },
    error: {
      title: "Something went wrong",
      body: "We couldn't confirm your gift just now. Please try the link again in a moment.",
    },
  };
  const m = messages[outcome.kind];

  return (
    <InfoPage eyebrow="Registry & Gifts" title={m.title}>
      <p className="text-sm leading-relaxed text-v1-denim/80">{m.body}</p>
      <div className="mt-10">
        <Link
          href="/registry"
          className="inline-block border border-v1-blush/70 bg-transparent px-9 py-3.5 text-[11px] uppercase tracking-widest2 text-v1-blush transition-colors duration-300 hover:bg-v1-blush hover:text-v1-ink"
        >
          Back to the registry
        </Link>
      </div>
    </InfoPage>
  );
}
