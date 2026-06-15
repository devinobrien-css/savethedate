import Link from "next/link";
import { wedding } from "@/config/site";

/**
 * Shared shell for the standalone info pages (Location & Time, Dress Code).
 * Keeps a consistent header, title treatment, and footer across them.
 */
export default function InfoPage({
  eyebrow,
  title,
  children,
}: {
  readonly eyebrow: string;
  /** Optional large display heading. Omit for an eyebrow-only header. */
  readonly title?: string;
  readonly children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-[100svh] flex-col overflow-x-hidden bg-v1-paper font-sans text-v1-ink">
      <header className="px-6 pt-8 sm:px-12">
        <Link
          href="/"
          className="text-[11px] uppercase tracking-widest2 text-v1-denim transition-colors hover:text-v1-ink"
        >
          ← {wedding.partnerA} &amp; {wedding.partnerB}
        </Link>
      </header>

      <section className="mx-auto w-full max-w-2xl flex-1 px-6 py-10 text-center sm:py-16">
        <p className="text-[11px] uppercase tracking-widest2 text-v1-denim">{eyebrow}</p>
        {title && (
          <h1 className="mt-6 font-display leading-tight text-v1-ink text-[clamp(2rem,9vw,3.75rem)] [text-wrap:balance]">
            {title}
          </h1>
        )}
        <div className="mx-auto mt-6 h-px w-14 bg-v1-blush" />
        <div className="mt-10">{children}</div>
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
