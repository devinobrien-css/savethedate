import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { wedding, gifts, venmoUrl } from "@/config/site";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getPublicRegistry, formatPrice } from "@/lib/registry";
import RegistryCard, { type RegistryCardItem } from "@/components/RegistryCard";

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
  let loadError = false;

  if (isSupabaseConfigured()) {
    try {
      const rows = await getPublicRegistry();
      items = rows.map((it) => ({
        id: it.id,
        title: it.title,
        description: it.description,
        priceLabel: formatPrice(it.price_cents),
        storeName: it.store_name,
        productUrl: it.product_url,
        imageUrl: it.image_url,
        claimed: it.claimed,
      }));
    } catch {
      loadError = true;
    }
  }

  const vUrl = venmoUrl();

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
          <h1 className="mt-6 font-display text-4xl leading-tight text-v1-ink sm:text-6xl">
            Your presence is the present
          </h1>
          <div className="mx-auto mt-6 h-px w-14 bg-v1-blush" />
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-v1-denim/80">
            If you&apos;d like to give something more, we&apos;ve gathered a few things below.
            Mark anything as yours and we&apos;ll send a quick email to confirm — that way no
            two gifts overlap.
          </p>
        </div>

        {/* Catalog */}
        <div className="mt-14">
          {loadError ? (
            <p className="text-center text-sm text-v1-denim/80">
              The registry is taking a moment to load — please check back shortly.
            </p>
          ) : items.length === 0 ? (
            <p className="text-center text-sm text-v1-denim/80">
              Our registry is still coming together — check back soon.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <RegistryCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Cash gifts */}
        {gifts.show && (
          <div className="mt-20 border-t border-v1-ink/10 pt-14 text-center">
            <h2 className="font-display text-3xl text-v1-ink">{gifts.heading}</h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-v1-denim/80">
              {gifts.note}
            </p>
            <div className="mt-8 flex flex-col items-center gap-4">
              {vUrl && (
                <a
                  href={vUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block border border-v1-blush/70 bg-transparent px-9 py-3.5 text-[11px] uppercase tracking-widest2 text-v1-blush transition-colors duration-300 hover:bg-v1-blush hover:text-v1-ink"
                >
                  Venmo @{gifts.venmoHandle}
                </a>
              )}
              {gifts.checkCashNote && (
                <p className="mx-auto max-w-md text-sm leading-relaxed text-v1-denim/70">
                  {gifts.checkCashNote}
                </p>
              )}
            </div>
          </div>
        )}
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
