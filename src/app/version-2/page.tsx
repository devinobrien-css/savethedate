import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { wedding, versions, galleryPhotos } from "@/config/site";
import Reveal from "@/components/Reveal";
import Countdown from "@/components/Countdown";
import Gallery from "@/components/Gallery";
import RSVPForm from "@/components/RSVPForm";
import AddToCalendar from "@/components/AddToCalendar";

const v = versions.v2;

export const metadata: Metadata = {
  title: `${wedding.partnerA} & ${wedding.partnerB} — Save the Date`,
  description: `Save the date · ${wedding.weddingDateLabel} · A warm celebration in ${wedding.city}`,
};

/** Small decorative botanical sprig (inline SVG) for the "home" feel. */
function Sprig({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 24" className={className} aria-hidden fill="none">
      <path d="M2 12h54" stroke="currentColor" strokeWidth="1" />
      <path d="M118 12H64" stroke="currentColor" strokeWidth="1" />
      <path
        d="M60 4c-3 3-3 5 0 8 3-3 3-5 0-8Z"
        fill="currentColor"
        opacity="0.85"
      />
      <circle cx="60" cy="16" r="1.6" fill="currentColor" />
    </svg>
  );
}

export default function VersionTwo() {
  const f = v.flags;
  return (
    <main className="bg-v2-linen text-v2-espresso font-serif selection:bg-v2-caramel selection:text-v2-linen">
      {/* ───────────── HERO ───────────── */}
      {f.hero && (
        <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden">
          <Image
            src={v.hero}
            alt={`${wedding.partnerA} and ${wedding.partnerB}`}
            fill
            priority
            sizes="100vw"
            className="object-cover object-[50%_40%] animate-ken-burns"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-v2-espresso/55 via-v2-espresso/30 to-v2-espresso/75" />
          {/* center scrim keeps the script names legible over bright sun-flare */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_46%_42%_at_50%_46%,rgba(61,43,34,0.55),transparent_70%)]" />

          <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-v2-linen [text-shadow:0_2px_18px_rgba(61,43,34,0.55)]">
            <Reveal>
              <p className="font-sans text-[11px] sm:text-sm uppercase tracking-[0.3em] text-v2-sand">
                Together with their families
              </p>
              <p className="mt-7 font-script text-6xl sm:text-7xl text-v2-cream">
                {wedding.partnerA}
              </p>
              <p className="my-1 font-sans text-sm uppercase tracking-[0.4em] text-v2-sand">
                and
              </p>
              <p className="font-script text-6xl sm:text-7xl text-v2-cream">
                {wedding.partnerB}
              </p>
              <p className="mt-8 font-sans text-sm sm:text-base uppercase tracking-[0.25em]">
                are getting married
              </p>
            </Reveal>
          </div>

          {/* soft scalloped bottom edge into the cream body */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-v2-linen [mask-image:radial-gradient(28px_at_50%_0,transparent_98%,black)] [mask-size:56px_100%] [mask-repeat:repeat-x]" />
        </section>
      )}

      {/* ───────────── WELCOME / FEELS LIKE HOME ───────────── */}
      <section className="py-24 sm:py-32 px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Sprig className="mx-auto mb-8 h-6 w-32 text-v2-caramel" />
          <h2 className="font-display text-3xl sm:text-4xl text-v2-walnut">
            Come as you are — it feels like home.
          </h2>
          <p className="mt-7 text-lg sm:text-xl leading-relaxed text-v2-espresso/80">
            {wedding.message}
          </p>
          <p className="mt-8 font-sans text-[11px] uppercase tracking-[0.3em] text-v2-caramel">
            A backyard celebration · {wedding.city}
          </p>
        </Reveal>
      </section>

      {/* ───────────── COUNTDOWN ───────────── */}
      {f.countdown && (
        <section className="px-6 pb-24 sm:pb-28">
          <Reveal className="mx-auto max-w-4xl rounded-[2rem] bg-v2-cream/70 border border-v2-taupe/40 px-6 py-16 text-center shadow-sm">
            <h2 className="font-display text-2xl sm:text-3xl text-v2-walnut">
              We&apos;ll be ready in
            </h2>
            <Sprig className="mx-auto my-6 h-5 w-28 text-v2-caramel" />
            <Countdown variant="v2" />
          </Reveal>
        </section>
      )}

      {/* ───────────── SPLIT / STORY ───────────── */}
      <section className="px-6 pb-24 sm:pb-28">
        <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2">
          <Reveal className="order-2 lg:order-1">
            <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-v2-caramel">
              How it happened
            </p>
            <h3 className="mt-4 font-display text-3xl sm:text-4xl text-v2-walnut leading-tight">
              A morning in the park, a forever in the making.
            </h3>
            <p className="mt-6 text-lg leading-relaxed text-v2-espresso/80">
              The light was warm, the question was simple, and the answer was
              yes. We can&apos;t wait to gather everyone we love in one warm,
              familiar place — good food, string lights, and the people who feel
              like home.
            </p>
          </Reveal>
          <Reveal className="order-1 lg:order-2">
            {/* arched image — quintessential warm/organic */}
            <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-t-[10rem] rounded-b-2xl border-4 border-v2-cream shadow-xl">
              <Image
                src={v.accentImage}
                alt="The proposal"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover object-[50%_35%]"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────────── CEREMONY (TBD) ───────────── */}
      {f.ceremony && (
        <section className="bg-v2-cream/50 py-20 sm:py-24 px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="font-script text-6xl text-v2-caramel">
              {wedding.dateStylized}
            </p>
            <Sprig className="mx-auto my-6 h-5 w-28 text-v2-caramel" />
            <h2 className="font-display text-2xl sm:text-3xl text-v2-walnut">
              {wedding.ceremonyHeading}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-v2-espresso/80">
              {wedding.ceremonyNote}
            </p>
          </Reveal>
        </section>
      )}

      {/* ───────────── DETAILS ───────────── */}
      {f.details && (
        <section className="py-24 sm:py-32 px-6">
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl sm:text-4xl text-v2-walnut">
              Save our date
            </h2>
            <Sprig className="mx-auto my-7 h-5 w-32 text-v2-caramel" />
            <div className="grid gap-10 sm:grid-cols-3">
              {[
                ["When", wedding.weddingDateLabel, wedding.ceremonyTime],
                ["Where", wedding.venueName, wedding.venueAddress],
                ["Wear", "Garden party", "Comfortable & cheerful"],
              ].map(([label, line1, line2]) => (
                <div key={label}>
                  <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-v2-caramel">
                    {label}
                  </p>
                  <p className="mt-3 font-display text-2xl text-v2-espresso">{line1}</p>
                  <p className="mt-1 text-base text-v2-walnut/80">{line2}</p>
                </div>
              ))}
            </div>
            <div className="mt-14">
              <AddToCalendar variant="v2" />
            </div>
            <p className="mt-8 font-sans text-[11px] uppercase tracking-[0.3em] text-v2-caramel">
              An invitation with all the details will follow
            </p>
          </Reveal>
        </section>
      )}

      {/* ───────────── RSVP ───────────── */}
      {f.rsvp && (
        <section className="bg-v2-cream/60 py-24 sm:py-28 px-6">
          <Reveal className="mx-auto max-w-2xl text-center mb-10">
            <h2 className="font-display text-3xl sm:text-4xl text-v2-walnut">
              Will you join us?
            </h2>
            <p className="mt-3 font-sans text-[11px] uppercase tracking-[0.3em] text-v2-caramel">
              {wedding.rsvpByLabel}
            </p>
          </Reveal>
          <Reveal className="mx-auto max-w-2xl rounded-[2rem] bg-v2-linen border border-v2-taupe/40 px-6 py-10 sm:px-10 shadow-sm">
            <RSVPForm variant="v2" />
          </Reveal>
        </section>
      )}

      {/* ───────────── GALLERY ───────────── */}
      {f.gallery && (
        <section className="bg-v2-sand/50 py-24 sm:py-28 px-6">
          <Reveal className="mx-auto max-w-2xl text-center mb-12">
            <Sprig className="mx-auto mb-6 h-5 w-28 text-v2-caramel" />
            <h2 className="font-display text-3xl sm:text-4xl text-v2-walnut">
              Moments we&apos;re keeping
            </h2>
            <p className="mt-3 font-sans text-[11px] uppercase tracking-[0.3em] text-v2-caramel">
              {wedding.proposalPlace}
            </p>
          </Reveal>
          <div className="mx-auto max-w-5xl">
            <Gallery photos={galleryPhotos} variant="v2" />
          </div>
        </section>
      )}

      {/* ───────────── FOOTER ───────────── */}
      <footer className="py-16 text-center bg-v2-espresso text-v2-sand">
        <p className="font-script text-5xl text-v2-cream">
          {wedding.partnerA} &amp; {wedding.partnerB}
        </p>
        <Sprig className="mx-auto my-5 h-5 w-28 text-v2-caramel" />
        <p className="font-sans text-[11px] uppercase tracking-[0.3em]">
          {wedding.weddingDateLabel} · {wedding.city}
        </p>
        <Link
          href="/"
          className="mt-8 inline-block font-sans text-[11px] uppercase tracking-[0.3em] text-v2-taupe hover:text-v2-cream transition-colors"
        >
          ← All designs
        </Link>
      </footer>
    </main>
  );
}
