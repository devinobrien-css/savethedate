import Link from "next/link";
import type { Metadata } from "next";
import { wedding, enabledNavLinks } from "@/config/site";

export const metadata: Metadata = {
  title: `${wedding.partnerA} & ${wedding.partnerB} — Wedding`,
  description: `${wedding.weddingDateLabel} · ${wedding.city}`,
};

export default function Home() {
  const links = enabledNavLinks();

  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center overflow-x-hidden bg-v1-paper px-6 py-20 font-sans text-v1-ink">
      <header className="w-full max-w-md text-center">
        <h1 className="mt-6 font-display leading-[1.05] text-[clamp(2.25rem,11vw,3.75rem)]">
          {wedding.partnerA}
          <span className="mx-2 sm:mx-3 font-script text-v1-blush">&amp;</span>
          {wedding.partnerB}
        </h1>
        <p className="mt-2 text-[11px] uppercase tracking-[0.2em] sm:tracking-widest2 text-v1-denim">
          Are getting married
        </p>
        <div className="mx-auto mt-6 h-px w-14 bg-v1-blush" />
        <p className="mt-6 text-[10px] sm:text-[11px] uppercase tracking-[0.18em] sm:tracking-widest2 text-v1-denim">
          {wedding.weddingDateLabel} · {wedding.city}
        </p>
      </header>

      <nav className="mt-14 w-full max-w-md space-y-3">
        {links.map((link) => {
          const external = link.href.startsWith("http");
          const inner = (
            <>
              <span>
                <span className="block font-display text-xl text-v1-ink">
                  {link.label}
                </span>
                <span className="mt-0.5 block text-[10px] uppercase tracking-widest2 text-v1-denim">
                  {link.caption}
                </span>
              </span>
              <span
                aria-hidden
                className="text-v1-blush transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </>
          );
          const cls =
            "group flex items-center justify-between border border-v1-ink/15 border-l-2 border-l-v1-blush bg-white px-6 py-5 transition-colors duration-300 hover:border-v1-blush hover:bg-v1-blush/5";

          return external ? (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cls}
            >
              {inner}
            </a>
          ) : (
            <Link key={link.label} href={link.href} className={cls}>
              {inner}
            </Link>
          );
        })}
      </nav>

      <footer className="mt-16 text-center text-[11px] uppercase tracking-widest2 text-v1-denim/70">
        We can&apos;t wait to celebrate with you
      </footer>
    </main>
  );
}
