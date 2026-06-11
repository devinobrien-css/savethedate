import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { wedding, versions, galleryPhotos } from "@/config/site";
import Reveal from "@/components/Reveal";
import Countdown from "@/components/Countdown";
import Gallery from "@/components/Gallery";
import RSVPForm from "@/components/RSVPForm";
import AddToCalendar from "@/components/AddToCalendar";

const v = versions.v3;

export const metadata: Metadata = {
  title: `${wedding.partnerA} & ${wedding.partnerB} — Save the Date`,
  description: `Save the date · ${wedding.weddingDateLabel} · ${wedding.city}`,
};

/** Delicate delphinium-style floral spray drawn as line art. */
function Floral({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 60" className={className} aria-hidden fill="none">
      <path
        d="M100 58V20"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
      {[
        [100, 18],
        [92, 26],
        [108, 26],
        [86, 36],
        [114, 36],
      ].map(([cx, cy], i) => (
        <g key={i} transform={`translate(${cx} ${cy})`}>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse
              key={a}
              cx="0"
              cy="-3.4"
              rx="1.7"
              ry="3.2"
              fill="currentColor"
              opacity="0.5"
              transform={`rotate(${a})`}
            />
          ))}
          <circle cx="0" cy="0" r="1" fill="currentColor" />
        </g>
      ))}
      <path
        d="M100 40c-22-2-40 4-58 14M100 44c22-2 40 4 58 14"
        stroke="currentColor"
        strokeWidth="0.7"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* a few leaves */}
      {[
        [60, 52, -30],
        [140, 52, 30],
        [74, 49, -20],
        [126, 49, 20],
      ].map(([x, y, r], i) => (
        <path
          key={i}
          d="M0 0c6-3 12-3 16 0-4 3-10 3-16 0Z"
          fill="currentColor"
          opacity="0.4"
          transform={`translate(${x} ${y}) rotate(${r})`}
        />
      ))}
    </svg>
  );
}

export default function VersionThree() {
  const f = v.flags;
  return (
    <main className="bg-v3-white text-v3-ink font-serif selection:bg-v3-powder selection:text-v3-ink">
      {/* ───────────── HERO ───────────── */}
      {f.hero && (
        <section className="relative px-6 pt-10 pb-16 sm:pt-14">
          <div className="mx-auto max-w-4xl">
            <Reveal className="text-center">
              <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-v3-delft">
                Save the Date
              </p>
              <Floral className="mx-auto mt-6 h-14 w-56 text-v3-periwinkle" />
              <h1 className="mt-4 font-serif text-6xl sm:text-8xl font-light leading-[0.95] text-v3-ink">
                {wedding.partnerA}
                <span className="block font-script text-v3-delft text-[0.5em] my-2">
                  and
                </span>
                {wedding.partnerB}
              </h1>
              <p className="mt-8 font-sans text-sm uppercase tracking-[0.3em] text-v3-delft">
                {wedding.weddingDateLabel}
              </p>
              <p className="mt-2 font-sans text-[11px] uppercase tracking-[0.25em] text-v3-periwinkle">
                {wedding.city}
              </p>
            </Reveal>

            {/* framed hero image — invitation-suite feel */}
            <Reveal className="mt-12" delay={120}>
              <div className="relative mx-auto aspect-[4/5] w-full max-w-2xl overflow-hidden border border-v3-powder p-2 bg-v3-white">
                <div className="relative h-full w-full overflow-hidden">
                  <Image
                    src={v.hero}
                    alt={`${wedding.partnerA} and ${wedding.partnerB}`}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 640px"
                    className="object-cover object-[50%_30%] animate-ken-burns"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ───────────── MESSAGE ───────────── */}
      <section className="px-6 py-20 sm:py-28 bg-v3-haze/50">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Floral className="mx-auto mb-8 h-12 w-48 text-v3-periwinkle" />
          <p className="font-serif text-2xl sm:text-3xl leading-relaxed text-v3-ink font-light">
            {wedding.message}
          </p>
          <p className="mt-8 font-sans text-[11px] uppercase tracking-[0.3em] text-v3-delft">
            {wedding.proposalPlace}
          </p>
        </Reveal>
      </section>

      {/* ───────────── COUNTDOWN ───────────── */}
      {f.countdown && (
        <section className="px-6 py-20 sm:py-28">
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-v3-ink">
              Until forever
            </h2>
            <p className="mt-3 mb-12 font-sans text-[11px] uppercase tracking-[0.3em] text-v3-delft">
              A little while longer
            </p>
            <Countdown variant="v3" />
          </Reveal>
        </section>
      )}

      {/* ───────────── CEREMONY (TBD) ───────────── */}
      {f.ceremony && (
        <section className="px-6 py-20 sm:py-24 bg-v3-white">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="font-serif text-5xl sm:text-7xl font-light text-v3-ink">
              {wedding.dateStylized}
            </p>
            <Floral className="mx-auto my-6 h-12 w-48 text-v3-periwinkle" />
            <h2 className="font-serif text-2xl sm:text-3xl font-light text-v3-ink">
              {wedding.ceremonyHeading}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-v3-delft font-light">
              {wedding.ceremonyNote}
            </p>
          </Reveal>
        </section>
      )}

      {/* ───────────── DETAILS ───────────── */}
      {f.details && (
        <section className="px-6 py-20 sm:py-28">
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-v3-ink">
              The Details
            </h2>
            <Floral className="mx-auto my-7 h-12 w-48 text-v3-periwinkle" />
            <div className="grid gap-10 sm:grid-cols-3 border-y border-v3-powder py-12">
              {[
                ["When", wedding.weddingDateLabel, wedding.ceremonyTime],
                ["Where", wedding.venueName, wedding.venueAddress],
                ["Attire", "Garden formal", "Soft hues welcome"],
              ].map(([label, line1, line2]) => (
                <div key={label}>
                  <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-v3-delft">
                    {label}
                  </p>
                  <p className="mt-3 font-serif text-2xl text-v3-ink">{line1}</p>
                  <p className="mt-1 text-base text-v3-delft/80">{line2}</p>
                </div>
              ))}
            </div>
            <div className="mt-12">
              <AddToCalendar variant="v3" />
            </div>
            <p className="mt-8 font-sans text-[11px] uppercase tracking-[0.3em] text-v3-periwinkle">
              A formal invitation will follow
            </p>
          </Reveal>
        </section>
      )}

      {/* ───────────── RSVP ───────────── */}
      {f.rsvp && (
        <section className="px-6 py-20 sm:py-28 bg-v3-haze/50">
          <Reveal className="mx-auto max-w-2xl text-center mb-10">
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-v3-ink">
              Kindly Reply
            </h2>
            <p className="mt-3 font-sans text-[11px] uppercase tracking-[0.3em] text-v3-delft">
              {wedding.rsvpByLabel}
            </p>
          </Reveal>
          <Reveal className="mx-auto max-w-2xl">
            <RSVPForm variant="v3" />
          </Reveal>
        </section>
      )}

      {/* ───────────── GALLERY ───────────── */}
      {f.gallery && (
        <section className="px-6 py-20 sm:py-28 bg-v3-haze/50">
          <Reveal className="mx-auto max-w-2xl text-center mb-12">
            <Floral className="mx-auto mb-6 h-12 w-48 text-v3-periwinkle" />
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-v3-ink">
              In bloom
            </h2>
            <p className="mt-3 font-sans text-[11px] uppercase tracking-[0.3em] text-v3-delft">
              Our favorite frames
            </p>
          </Reveal>
          <div className="mx-auto max-w-5xl">
            <Gallery photos={galleryPhotos} variant="v3" />
          </div>
        </section>
      )}

      {/* ───────────── FOOTER ───────────── */}
      <footer className="px-6 py-16 text-center">
        <Floral className="mx-auto mb-6 h-12 w-48 text-v3-periwinkle" />
        <p className="font-script text-5xl text-v3-delft">
          {wedding.partnerA} &amp; {wedding.partnerB}
        </p>
        <p className="mt-4 font-sans text-[11px] uppercase tracking-[0.3em] text-v3-delft">
          {wedding.weddingDateLabel} · {wedding.city}
        </p>
        <Link
          href="/"
          className="mt-8 inline-block font-sans text-[11px] uppercase tracking-[0.3em] text-v3-periwinkle hover:text-v3-ink transition-colors"
        >
          ← All designs
        </Link>
      </footer>
    </main>
  );
}
