import Image from "next/image";
import type { Metadata } from "next";
import { wedding, versions, galleryPhotos } from "@/config/site";
import Reveal from "@/components/Reveal";
import Countdown from "@/components/Countdown";
import Gallery from "@/components/Gallery";
import RSVPForm from "@/components/RSVPForm";
import AddToCalendar from "@/components/AddToCalendar";

const v = versions.v1;

export const metadata: Metadata = {
  title: `${wedding.partnerA} & ${wedding.partnerB} — Save the Date`,
  description: `Save the date · ${wedding.weddingDateLabel} · ${wedding.city}`,
};

export default function VersionOne() {
  const f = v.flags;
  return (
    <main className="bg-v1-paper text-v1-ink font-sans selection:bg-v1-denim selection:text-white">
      {/* ───────────── HERO ───────────── */}
      {f.hero && (
        <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src={v.hero}
              alt={`${wedding.partnerA} and ${wedding.partnerB}`}
              fill
              priority
              sizes="100vw"
              className="object-cover object-[50%_35%] animate-ken-burns"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-v1-ink/70 via-v1-ink/20 to-v1-ink/80" />
            <div className="absolute inset-0 bg-gradient-to-r from-v1-ink/40 to-transparent" />
          </div>

          <div className="relative z-10 flex h-full flex-col">
            {/* top bar */}
            <header className="flex items-center justify-between px-6 sm:px-12 pt-8 text-v1-paper/90">
              <span className="font-display text-lg tracking-wide">
                {wedding.partnerA[0]} &amp; {wedding.partnerB[0]}
              </span>
              <span className="hidden sm:block text-[11px] uppercase tracking-widest2">
                {wedding.city}
              </span>
            </header>

            {/* center */}
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center text-v1-paper">
              <p className="animate-fade-in text-[11px] sm:text-sm uppercase tracking-widest2 text-v1-mist">
                Save the Date
              </p>
              <h1 className="mt-6 animate-fade-up font-display text-[15vw] leading-[0.92] sm:text-8xl lg:text-9xl">
                {wedding.partnerA}
                <span className="mx-3 inline-block font-script text-v1-blush text-[0.7em] align-middle">
                  &amp;
                </span>
                {wedding.partnerB}
              </h1>
              <p className="mt-2 font-sans text-sm sm:text-base uppercase tracking-[0.25em]">
                are getting married
              </p>
              <div className="mt-8 flex items-center gap-4 animate-fade-up [animation-delay:200ms]">
                <span className="h-px w-10 bg-v1-mist/60" />
                <p className="text-sm sm:text-base uppercase tracking-widest2">
                  {wedding.weddingDateLabel}
                </p>
                <span className="h-px w-10 bg-v1-mist/60" />
              </div>
              <a
                href="#rsvp"
                className="mt-20 sm:mt-24 inline-block animate-fade-up [animation-delay:400ms] border border-v1-blush/70 bg-transparent px-10 py-3.5 font-sans text-[11px] uppercase tracking-widest2 text-v1-blush transition-colors duration-300 hover:bg-v1-blush hover:text-v1-ink"
              >
                RSVP Now
              </a>
            </div>

            {/* scroll cue */}
            <div className="flex justify-center pb-10">
              <div className="flex flex-col items-center gap-2 text-v1-mist animate-float">
                <span className="text-[10px] uppercase tracking-widest2">Scroll</span>
                <span className="h-10 w-px bg-v1-mist/50" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ───────────── INTRO ───────────── */}
      <section className="bg-v1-ink text-v1-paper py-24 sm:py-32 px-6">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="font-script text-5xl sm:text-6xl text-v1-blush">She said yes</p>
          <p className="mt-8 font-display text-2xl sm:text-4xl leading-snug text-v1-mist">
            {wedding.message}
          </p>
          <p className="mt-10 text-[11px] uppercase tracking-widest2 text-v1-sky">
            {wedding.proposalPlace}
          </p>
        </Reveal>
      </section>

      {/* ───────────── COUNTDOWN ───────────── */}
      {f.countdown && (
        <section className="bg-v1-paper py-24 sm:py-28 px-6">
          <Reveal className="mx-auto max-w-4xl text-center">
            <h2 className="font-display text-3xl sm:text-5xl text-v1-ink">
              Counting down
            </h2>
            <p className="mt-3 mb-12 text-[11px] uppercase tracking-widest2 text-v1-denim">
              Until we say “I do”
            </p>
            <Countdown variant="v1" />
          </Reveal>
        </section>
      )}

      {/* ───────────── SPLIT / ACCENT ───────────── */}
      <section className="flex flex-col lg:flex-row items-stretch bg-v1-paper">
        <Reveal className="relative w-full aspect-[1366/2048] lg:aspect-auto lg:w-[560px] lg:h-[640px] lg:shrink-0">
          <Image
            src={v.accentImage}
            alt="The proposal"
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover object-center"
          />
        </Reveal>
        <Reveal className="flex flex-1 items-center justify-center bg-v1-navy text-v1-paper px-8 sm:px-16 py-20">
          <div className="max-w-lg">
            <p className="text-[11px] uppercase tracking-widest2 text-v1-mist">Our story</p>
            <div className="mt-4 h-px w-12 bg-v1-mist/50" />
            <h3 className="mt-6 font-display text-4xl sm:text-5xl leading-tight">
              From a city morning to forever.
            </h3>
            <p className="mt-7 text-lg leading-loose text-v1-paper/80 font-sans">
              Beneath the skyline and the sun&apos;s golden light, one
              question changed everything. Now we&apos;re turning that moment into
              a lifetime — and we want you in the room when we do.
            </p>
            <p className="mt-8 text-[11px] uppercase tracking-widest2 text-v1-mist">
              {wedding.proposalPlace}
            </p>
          </div>
        </Reveal>
      </section>

      {/* ───────────── CEREMONY (TBD) ───────────── */}
      {f.ceremony && (
        <section className="bg-v1-paper py-20 sm:py-24 px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="font-display text-5xl sm:text-7xl text-v1-ink">
              {wedding.dateStylized}
            </p>
            <div className="mx-auto my-7 h-px w-16 bg-v1-mist" />
            <h2 className="font-display text-2xl sm:text-3xl text-v1-navy">
              {wedding.ceremonyHeading}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-v1-denim font-sans">
              {wedding.ceremonyNote}
            </p>
          </Reveal>
        </section>
      )}

      {/* ───────────── DETAILS ───────────── */}
      {f.details && (
        <section id="details" className="bg-v1-ink text-v1-paper py-24 sm:py-32 px-6 scroll-mt-0">
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl sm:text-5xl">The Details</h2>
            <div className="mt-12 grid sm:grid-cols-3 gap-10 text-center">
              <div>
                <p className="text-[11px] uppercase tracking-widest2 text-v1-sky">When</p>
                <p className="mt-3 font-display text-2xl">{wedding.weddingDateLabel}</p>
                <p className="mt-1 text-sm text-v1-mist">{wedding.ceremonyTime}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-widest2 text-v1-sky">Where</p>
                <p className="mt-3 font-display text-2xl">{wedding.venueName}</p>
                <p className="mt-1 text-sm text-v1-mist">{wedding.venueAddress}</p>
              </div>
              <div id="dress" className="scroll-mt-24">
                <p className="text-[11px] uppercase tracking-widest2 text-v1-sky">Dress</p>
                <p className="mt-3 font-display text-2xl">{wedding.dressCode}</p>
                <p className="mt-1 text-sm text-v1-mist">{wedding.dressCodeNote}</p>
              </div>
            </div>
            <div className="mt-14">
              <AddToCalendar variant="v1" />
            </div>
            <p className="mt-8 text-[11px] uppercase tracking-widest2 text-v1-sky">
              Formal invitation to follow
            </p>
          </Reveal>
        </section>
      )}

      {/* ───────────── RSVP ───────────── */}
      {f.rsvp && (
        <section id="rsvp" className="bg-v1-paper py-24 sm:py-28 px-6">
          <Reveal className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="font-display text-3xl sm:text-5xl text-v1-ink">RSVP</h2>
            <div className="mx-auto mt-5 h-px w-14 bg-v1-blush" />
            <p className="mt-5 text-[11px] uppercase tracking-widest2 text-v1-denim">
              {wedding.rsvpByLabel}
            </p>
          </Reveal>
          <Reveal className="mx-auto max-w-2xl">
            <div className="border border-v1-ink/10 border-t-2 border-t-v1-blush bg-white px-7 py-10 sm:px-12 sm:py-12 shadow-[0_24px_60px_-28px_rgba(30,42,58,0.4)]">
              <RSVPForm variant="v1" />
            </div>
          </Reveal>
        </section>
      )}

      {/* ───────────── GALLERY ───────────── */}
      {f.gallery && (
        <section className="bg-v1-paper py-24 sm:py-28 px-6">
          <Reveal className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="font-display text-3xl sm:text-5xl text-v1-ink">The moment</h2>
            <p className="mt-3 text-[11px] uppercase tracking-widest2 text-v1-denim">
              {wedding.proposalPlace}
            </p>
          </Reveal>
          <div className="mx-auto max-w-5xl">
            <Gallery photos={galleryPhotos} variant="v1" />
          </div>
        </section>
      )}

      {/* ───────────── FOOTER ───────────── */}
      <footer className="bg-v1-ink text-v1-mist py-16 text-center">
        <p className="font-script text-5xl text-v1-blush">
          {wedding.partnerA} &amp; {wedding.partnerB}
        </p>
        <p className="mt-4 text-[11px] uppercase tracking-widest2">
          {wedding.weddingDateLabel} · {wedding.city}
        </p>
      </footer>
    </main>
  );
}
