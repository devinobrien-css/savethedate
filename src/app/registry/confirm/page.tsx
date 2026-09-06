import type { Metadata } from "next";
import Link from "next/link";
import { wedding, shippingAddressLines } from "@/config/site";
import InfoPage from "@/components/InfoPage";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  REGISTRY_CLAIMS_TABLE,
  REGISTRY_ITEMS_TABLE,
  isPendingExpired,
  type RegistryClaim,
} from "@/lib/registry";
import { verifyToken, REGISTRY_TOKEN_MAX_AGE_MS } from "@/lib/token";
import { saveTrackingByToken } from "../actions";

export const metadata: Metadata = {
  title: `Confirm your gift — ${wedding.partnerA} & ${wedding.partnerB}`,
  robots: { index: false, follow: false },
};

// Performs the confirm on load, so never cache.
export const dynamic = "force-dynamic";

type Outcome =
  | { kind: "ok"; itemTitle: string; tracking: string | null }
  | { kind: "released"; expired: boolean }
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
  if (claim.status === "released") {
    return { kind: "released", expired: claim.released_reason === "expired" };
  }

  // A pending claim that aged out is gone in every way that matters, even if the
  // sweep hasn't run yet — say so rather than silently confirming it.
  if (isPendingExpired(claim)) return { kind: "released", expired: true };

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

  return {
    kind: "ok",
    itemTitle: (itemRow as { title: string } | null)?.title ?? "your gift",
    tracking: claim.tracking,
  };
}

/** Copy for every outcome except the happy path. */
function messageFor(outcome: Exclude<Outcome, { kind: "ok" }>): {
  title: string;
  body: string;
} {
  switch (outcome.kind) {
    case "released":
      // A reservation that aged out isn't the guest's doing — say so plainly,
      // rather than implying they released it themselves.
      return outcome.expired
        ? {
            title: "This reservation timed out",
            body: "We didn't hear back within a few days, so the gift went back on the registry for someone else. If you'd still like to give it, head back and claim it again — it only takes a moment.",
          }
        : {
            title: "This gift was released",
            body: "This reservation has been released, so the gift is open for someone else. If that wasn't intended, head back to the registry and claim it again.",
          };
    case "invalid":
      return {
        title: "This link isn't valid",
        body: "The confirmation link is invalid or has expired. You can return to the registry and mark the gift again.",
      };
    case "error":
      return {
        title: "Something went wrong",
        body: "We couldn't confirm your gift just now. Please try the link again in a moment.",
      };
  }
}

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; saved?: string }>;
}) {
  const { token, saved } = await searchParams;
  const outcome = await confirm(token);

  if (outcome.kind === "ok") {
    const shipTo = shippingAddressLines();
    return (
      <InfoPage eyebrow="Registry & Gifts" title="Thank you — it's confirmed">
        <p className="text-sm leading-relaxed text-v1-denim/80">
          You're giving <span className="font-medium text-v1-ink">{outcome.itemTitle}</span>.
          We've marked it as covered so no one else doubles up. It means so much to us.
        </p>
        {shipTo ? (
          <div className="mt-8 border-t border-v1-ink/10 pt-6">
            <p className="text-[11px] uppercase tracking-widest2 text-v1-denim">
              Where to ship it
            </p>
            <address className="mt-3 text-sm not-italic leading-relaxed text-v1-ink">
              {shipTo.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
            <p className="mt-3 text-xs leading-relaxed text-v1-denim/70">
              No rush — we&apos;ve also included this in your confirmation email.
            </p>
          </div>
        ) : (
          <p className="mt-6 text-sm leading-relaxed text-v1-denim/80">
            Need a mailing address to send it? Just reply to your confirmation
            email and we&apos;ll share one.
          </p>
        )}
        <form
          action={saveTrackingByToken}
          className="mt-8 border-t border-v1-ink/10 pt-6"
        >
          <input type="hidden" name="token" value={token ?? ""} />
          <label
            htmlFor="tracking"
            className="text-[11px] uppercase tracking-widest2 text-v1-denim"
          >
            Tracking link (optional)
          </label>
          <p className="mt-2 text-xs leading-relaxed text-v1-denim/70">
            We&apos;re in an apartment, so if it&apos;s handy, drop the tracking
            link and we&apos;ll grab it before it wanders off. Totally optional.
          </p>
          <input
            id="tracking"
            name="tracking"
            type="text"
            defaultValue={outcome.tracking ?? ""}
            placeholder="Paste a tracking number or link"
            className="mt-3 w-full border border-v1-ink/20 bg-white px-3 py-2.5 text-sm text-v1-ink placeholder:text-v1-denim/40 focus:border-v1-blush focus:outline-none"
          />
          <button
            type="submit"
            className="mt-3 inline-block border border-v1-blush/70 bg-transparent px-7 py-3 text-[11px] uppercase tracking-widest2 text-v1-blush transition-colors duration-300 hover:bg-v1-blush hover:text-v1-ink"
          >
            Save tracking
          </button>
          {saved === "1" && (
            <p className="mt-3 text-xs leading-relaxed text-v1-denim/70">
              Thank you — saved! You can update or clear it any time from this
              page.
            </p>
          )}
          {saved === "error" && (
            <p className="mt-3 text-xs leading-relaxed text-red-600/90" role="alert">
              We couldn&apos;t save that just now — please try again in a moment.
            </p>
          )}
        </form>

        <p className="mt-8 text-[11px] uppercase tracking-widest2 text-v1-denim">
          With love · {wedding.partnerA} &amp; {wedding.partnerB}
        </p>
      </InfoPage>
    );
  }

  const m = messageFor(outcome);

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
