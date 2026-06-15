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
import { releaseByToken } from "../actions";

export const metadata: Metadata = {
  title: `Release a gift — ${wedding.partnerA} & ${wedding.partnerB}`,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const backLink = (
  <div className="mt-10">
    <Link
      href="/registry"
      className="inline-block border border-v1-blush/70 bg-transparent px-9 py-3.5 text-[11px] uppercase tracking-widest2 text-v1-blush transition-colors duration-300 hover:bg-v1-blush hover:text-v1-ink"
    >
      Back to the registry
    </Link>
  </div>
);

export default async function ReleasePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; status?: string }>;
}) {
  const { token, status } = await searchParams;

  // ── Post-action result states (set by the releaseByToken redirect) ──────
  if (status === "done") {
    return (
      <InfoPage eyebrow="Registry & Gifts" title="The gift has been released">
        <p className="text-sm leading-relaxed text-v1-denim/80">
          All set — it's open for someone else now. Thank you for letting us know.
        </p>
        {backLink}
      </InfoPage>
    );
  }
  if (status === "invalid" || status === "error") {
    return (
      <InfoPage eyebrow="Registry & Gifts" title="We couldn't release that">
        <p className="text-sm leading-relaxed text-v1-denim/80">
          The link is invalid or expired, or something went wrong. If you still need
          to free up the gift, reach out to us directly.
        </p>
        {backLink}
      </InfoPage>
    );
  }

  // ── Initial GET: validate the token and show a confirm button ───────────
  const claimId = verifyToken(token, "registry:release", REGISTRY_TOKEN_MAX_AGE_MS);
  if (!claimId || !isSupabaseConfigured()) {
    return (
      <InfoPage eyebrow="Registry & Gifts" title="This link isn't valid">
        <p className="text-sm leading-relaxed text-v1-denim/80">
          The release link is invalid or has expired.
        </p>
        {backLink}
      </InfoPage>
    );
  }

  const supabase = getSupabase();
  const { data: claimRow } = await supabase
    .from(REGISTRY_CLAIMS_TABLE)
    .select("*")
    .eq("id", claimId)
    .maybeSingle();
  const claim = claimRow as RegistryClaim | null;

  if (!claim || claim.status === "released") {
    return (
      <InfoPage eyebrow="Registry & Gifts" title="Nothing to release">
        <p className="text-sm leading-relaxed text-v1-denim/80">
          This gift isn't currently reserved under your name — it may already have
          been released.
        </p>
        {backLink}
      </InfoPage>
    );
  }

  const { data: itemRow } = await supabase
    .from(REGISTRY_ITEMS_TABLE)
    .select("title")
    .eq("id", claim.item_id)
    .maybeSingle();
  const itemTitle = (itemRow as { title: string } | null)?.title ?? "this gift";

  return (
    <InfoPage eyebrow="Registry & Gifts" title="Release this gift?">
      <p className="text-sm leading-relaxed text-v1-denim/80">
        You currently have <span className="font-medium text-v1-ink">{itemTitle}</span>{" "}
        reserved. Releasing it makes it available for another guest to give.
      </p>
      <form action={releaseByToken} className="mt-10 flex flex-col items-center gap-4">
        <input type="hidden" name="token" value={token} />
        <button
          type="submit"
          className="inline-block border border-v1-blush/70 bg-transparent px-9 py-3.5 text-[11px] uppercase tracking-widest2 text-v1-blush transition-colors duration-300 hover:bg-v1-blush hover:text-v1-ink"
        >
          Yes, release it
        </button>
        <Link
          href="/registry"
          className="text-[11px] uppercase tracking-widest2 text-v1-denim transition-colors hover:text-v1-ink"
        >
          Keep it reserved
        </Link>
      </form>
    </InfoPage>
  );
}
