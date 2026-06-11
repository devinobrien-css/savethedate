import Image from "next/image";
import Link from "next/link";
import { wedding, versions } from "@/config/site";

const cards = [
  {
    cfg: versions.v1,
    blurb: "Modern New York — sleek, editorial, city-light drama.",
    swatches: ["#1c2433", "#4a6896", "#8fa9c9", "#e8c4ab"],
    tone: "from-v1-ink/80 to-v1-ink/30",
  },
  {
    cfg: versions.v2,
    blurb: "A Connecticut backyard — warm, inviting, feels like home.",
    swatches: ["#3d2b22", "#a9743f", "#d8c1ad", "#f3ead9"],
    tone: "from-v2-espresso/75 to-v2-espresso/20",
  },
  {
    cfg: versions.v3,
    blurb: "New England floral — simple, elegant, in full bloom.",
    swatches: ["#33475b", "#5f7fa6", "#8ba4c9", "#dde7f2"],
    tone: "from-v3-ink/70 to-v3-ink/20",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 font-sans">
      <header className="px-6 pt-20 pb-12 text-center">
        <p className="text-[11px] uppercase tracking-[0.35em] text-neutral-400">
          Save the Date · Three Designs
        </p>
        <h1 className="mt-6 font-display text-4xl sm:text-6xl">
          {wedding.partnerA} &amp; {wedding.partnerB}
        </h1>
        <p className="mt-4 text-sm uppercase tracking-[0.3em] text-neutral-400">
          {wedding.weddingDateLabel} · {wedding.city}
        </p>
        <p className="mx-auto mt-6 max-w-xl text-neutral-400 leading-relaxed">
          Three directions for the same celebration. Preview each, then pick the
          one that feels most like you.
        </p>
      </header>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-24 md:grid-cols-3">
        {cards.map(({ cfg, blurb, swatches, tone }) => (
          <Link
            key={cfg.slug}
            href={`/${cfg.slug}`}
            className="group relative block overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900"
          >
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src={cfg.hero}
                alt={cfg.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover object-[50%_35%] transition-transform duration-[1.2s] ease-out group-hover:scale-105"
              />
              <div
                className={`absolute inset-0 bg-gradient-to-t ${tone} transition-opacity duration-500 group-hover:opacity-90`}
              />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/70">
                  {cfg.slug.replace("-", " ")}
                </p>
                <h2 className="mt-2 font-display text-2xl text-white">{cfg.name}</h2>
                <p className="mt-2 text-sm text-white/80">{blurb}</p>
                <div className="mt-4 flex gap-1.5">
                  {swatches.map((c) => (
                    <span
                      key={c}
                      className="h-4 w-4 rounded-full ring-1 ring-white/30"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <span className="mt-5 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-white">
                  View design
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </section>

      <footer className="border-t border-neutral-800 px-6 py-10 text-center text-[11px] uppercase tracking-[0.3em] text-neutral-500">
        Designed with love · {wedding.proposalPlace}
      </footer>
    </main>
  );
}
