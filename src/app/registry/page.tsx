import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { wedding } from "@/config/site";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getPublicRegistry, formatPrice } from "@/lib/registry";
import RegistryCatalog from "@/components/RegistryCatalog";
import { type RegistryCardItem } from "@/components/RegistryCard";
import RegistryFunds, { type FundCardItem } from "@/components/RegistryFunds";
import CashGiftBanner from "@/components/CashGiftBanner";

export const metadata: Metadata = {
  title: `Registry & Gifts — ${wedding.partnerA} & ${wedding.partnerB}`,
  description: "Our registry and ways to give.",
};

// Reflects live claim status, so render fresh.
export const dynamic = "force-dynamic";

export default async function RegistryPage() {
  // Keep this page in lockstep with the home-page button: if the registry nav
  // is switched off, the page is off too.
  if (process.env.NAV_REGISTRY === "false") notFound();

  let items: RegistryCardItem[] = [];
  let funds: FundCardItem[] = [];
  let loadError = false;

  if (isSupabaseConfigured()) {
    try {
      const rows = await getPublicRegistry();
      // Claimable gifts go through the catalog (bands/sort/search/claim);
      // "contribute cash toward" funds render as their own descriptive cards.
      items = rows
        .filter((it) => it.kind !== "fund")
        .map((it) => ({
          id: it.id,
          title: it.title,
          description: it.description,
          priceCents: it.price_cents,
          priceLabel: formatPrice(it.price_cents),
          storeName: it.store_name,
          productUrl: it.product_url,
          imageUrl: it.image_url,
          claimed: it.claimed,
          mostWanted: it.is_most_wanted,
        }));
      funds = rows
        .filter((it) => it.kind === "fund")
        .map((it) => ({
          id: it.id,
          title: it.title,
          description: it.description,
          imageUrl: it.image_url,
          mostWanted: it.is_most_wanted,
        }));
    } catch {
      loadError = true;
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-v1-paper font-sans text-v1-ink">
      <header className="px-6 pt-8 sm:px-12">
        <Link
          href="/"
          className="text-[11px] uppercase tracking-widest2 text-v1-denim transition-colors hover:text-v1-ink"
        >
          ← {wedding.partnerA} &amp; {wedding.partnerB}
        </Link>
      </header>

      <section className="mx-auto w-full max-w-5xl flex-1 px-6 py-16 sm:py-20">
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-widest2 text-v1-denim">Registry &amp; Gifts</p>
          <div className="mx-auto mt-6 h-px w-14 bg-v1-blush" />
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-v1-denim/80">
            If you&apos;d like to give something more, we&apos;ve gathered a few things below.
            Mark anything as yours and we&apos;ll send a quick email to confirm — that way no
            two gifts overlap.
          </p>
        </div>

        {/* Heads-up that cash-gift ideas live further down */}
        {funds.length > 0 && <CashGiftBanner />}

        {/* Catalog */}
        <div className="mt-14">
          {loadError ? (
            <p className="text-center text-sm text-v1-denim/80">
              The registry is taking a moment to load — please check back shortly.
            </p>
          ) : items.length === 0 && funds.length === 0 ? (
            <p className="text-center text-sm text-v1-denim/80">
              Our registry is still coming together — check back soon.
            </p>
          ) : (
            items.length > 0 && <RegistryCatalog items={items} />
          )}
        </div>

        {/* Contribute cash toward */}
        <RegistryFunds funds={funds} />
      </section>

      <footer className="border-t border-v1-ink/10 px-6 py-10 text-center">
        <Link
          href="/"
          className="text-[11px] uppercase tracking-widest2 text-v1-denim transition-colors hover:text-v1-ink"
        >
          ← Back to directory
        </Link>
      </footer>
    </main>
  );
}
