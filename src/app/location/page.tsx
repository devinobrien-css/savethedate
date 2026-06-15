import type { Metadata } from "next";
import { Fragment } from "react";
import {
  wedding,
  daySchedule,
  locationSummary,
  recommendationsIntro,
  travelRecs,
  lodgingRec,
} from "@/config/site";
import InfoPage from "@/components/InfoPage";
import ScheduleIcon from "@/components/ScheduleIcon";
import LocationMap from "@/components/LocationMap";

export const metadata: Metadata = {
  title: `Location & Time — ${wedding.partnerA} & ${wedding.partnerB}`,
  description: `${wedding.venueName} · ${wedding.weddingDateLabel}`,
};

export default function LocationPage() {
  // Overnight-stay note is opt-in (often family-only): hidden unless flagged on.
  const showLodging = process.env.RECOMMEND_LODGING === "true";
  const recs = showLodging ? [...travelRecs, lodgingRec] : travelRecs;

  return (
    <InfoPage eyebrow="Location & Time">
      {/* The date — the one fact everyone needs, front and center */}
      <div className="text-center">
        <p className="font-display leading-tight text-v1-ink text-[clamp(1.75rem,6vw,2.5rem)]">
          Saturday, {wedding.weddingDateLabel}
        </p>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-v1-denim/90 [text-wrap:balance]">
          {locationSummary}
        </p>
      </div>

      {/* SCHEDULE — the priority, leading the page so it can't be missed */}
      <div className="mt-14 text-center">
        <h2 className="text-[11px] uppercase tracking-widest2 text-v1-denim">
          The Schedule
        </h2>
        <div className="mx-auto mt-5 h-px w-12 bg-v1-blush" />
      </div>

      <ol className="mx-auto mt-12 max-w-md text-left">
        {daySchedule.map((stop, i) => {
          const last = i === daySchedule.length - 1;
          // Don't run the rail across a day break (next stop starts a new day).
          const drawConnector = !last && !daySchedule[i + 1]?.dayLabel;
          return (
            <Fragment key={stop.title}>
              {stop.dayLabel && (
                <li className="flex items-center justify-center gap-3 pb-9 pt-1 text-[11px] uppercase tracking-widest2 text-v1-denim">
                  <span className="h-px w-8 bg-v1-blush/40" />
                  {stop.dayLabel}
                  <span className="h-px w-8 bg-v1-blush/40" />
                </li>
              )}
              <li className="relative flex gap-5 pb-9 last:pb-0">
              {/* Rail: marker + connecting line */}
              <div className="flex flex-col items-center">
                <span
                  className={[
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors",
                    stop.transit
                      ? "border border-dashed border-v1-denim/40 bg-v1-paper text-v1-denim"
                      : "bg-v1-blush/15 text-v1-ink ring-1 ring-v1-blush/60 shadow-lg shadow-v1-blush/20",
                  ].join(" ")}
                >
                  <ScheduleIcon
                    name={stop.icon}
                    className={stop.transit ? "h-4 w-4" : "h-5 w-5"}
                  />
                </span>
                {drawConnector && (
                  <span
                    className={[
                      "mt-1.5 w-px flex-1",
                      stop.transit
                        ? "border-l border-dashed border-v1-denim/30"
                        : "bg-gradient-to-b from-v1-blush/50 to-v1-blush/20",
                    ].join(" ")}
                  />
                )}
              </div>

              {/* Content */}
              <div
                className={[
                  stop.transit ? "pt-2 opacity-80" : "pt-2.5",
                ].join(" ")}
              >
                {stop.time && (
                  <p className="text-[11px] font-semibold uppercase tracking-widest2 text-v1-blush">
                    {stop.time}
                  </p>
                )}
                <p
                  className={[
                    "text-v1-ink",
                    stop.time ? "mt-1" : "",
                    stop.transit
                      ? "text-sm font-medium"
                      : "font-display text-xl leading-snug",
                  ].join(" ")}
                >
                  {stop.title}
                </p>
                {stop.detail && (
                  <p className="mt-1 text-sm leading-relaxed text-v1-denim/80">
                    {stop.detail}
                  </p>
                )}
              </div>
              </li>
            </Fragment>
          );
        })}
      </ol>

      {/* Shuttle callout — make the free transportation impossible to miss */}
      <div className="mt-12 flex items-start gap-4 rounded-lg border border-v1-blush/40 bg-v1-blush/10 px-5 py-5 text-left sm:px-6">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-v1-blush/20 text-v1-ink ring-1 ring-v1-blush/50">
          <ScheduleIcon name="bus" className="h-5 w-5" />
        </span>
        <div>
          <p className="font-display text-lg leading-tight text-v1-ink">
            Shuttle service provided
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-v1-denim/90">
            Buses carry everyone from The Penn Club to the ceremony and back —
            no need to drive, park, or arrange a car. Just hop aboard.
          </p>
        </div>
      </div>

      {/* Map — where everything is */}
      <div className="mt-16 text-center">
        <p className="text-[11px] uppercase tracking-widest2 text-v1-denim">
          Where Everything Is
        </p>
        <div className="mx-auto mt-5 h-px w-12 bg-v1-blush" />
      </div>

      <div className="mt-10">
        <LocationMap />
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] uppercase tracking-widest2 text-v1-denim">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-v1-blush" /> The Penn Club
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full border border-dashed border-v1-denim" />
            Ceremony (TBA)
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-v1-navy" /> Grand Central
          </span>
        </div>
        <p className="mt-4 text-center text-[11px] uppercase tracking-widest2 text-v1-denim/70">
          Tap a pin to open it in your maps app
        </p>
      </div>

      {/* RECOMMENDATIONS — getting here & (optionally) staying overnight */}
      <div className="mt-20 text-center">
        <p className="text-[11px] uppercase tracking-widest2 text-v1-denim">
          Recommendations
        </p>
        <div className="mx-auto mt-5 h-px w-12 bg-v1-blush" />
        <p className="mt-6 font-display text-xl text-v1-ink">
          {recommendationsIntro}
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-4 text-left">
        {recs.map((rec) => (
          <div
            key={rec.title}
            className="flex items-start gap-4 rounded-lg border border-v1-ink/10 px-5 py-5 sm:px-6"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-v1-blush/15 text-v1-ink ring-1 ring-v1-blush/40">
              <ScheduleIcon name={rec.icon} className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-lg leading-tight text-v1-ink">
                {rec.title}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-v1-denim/90">
                {rec.body}
              </p>
              {rec.note && (
                <p className="mt-2 text-sm leading-relaxed text-v1-denim/80">
                  {rec.note}
                </p>
              )}
              {rec.linkHref && (
                <a
                  href={rec.linkHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest2 text-v1-blush transition-colors hover:text-v1-ink"
                >
                  {rec.linkLabel}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  >
                    <path d="M7 17 17 7M9 7h8v8" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-16 text-[11px] uppercase tracking-widest2 text-v1-denim">
        Some times &amp; locations to be confirmed · formal invitation to follow
      </p>
    </InfoPage>
  );
}
