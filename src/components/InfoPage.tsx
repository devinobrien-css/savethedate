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
  readonly title: string;
  readonly children: React.ReactNode;
}) {
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

      <section className="mx-auto w-full max-w-2xl flex-1 px-6 py-16 text-center sm:py-24">
        <p className="text-[11px] uppercase tracking-widest2 text-v1-denim">{eyebrow}</p>
        <h1 className="mt-6 font-display text-4xl leading-tight text-v1-ink sm:text-6xl">
          {title}
        </h1>
        <div className="mx-auto mt-6 h-px w-14 bg-v1-blush" />
        <div className="mt-12">{children}</div>
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
