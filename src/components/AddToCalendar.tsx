"use client";

import { googleCalendarUrl, icsDataUrl, eventTitle } from "@/lib/calendar";

type Variant = "v1" | "v2" | "v3";

const themes: Record<Variant, string> = {
  v1: "border border-v1-mist/60 text-v1-paper hover:bg-v1-paper hover:text-v1-ink tracking-widest2 uppercase rounded-none",
  v2: "border border-v2-walnut text-v2-walnut hover:bg-v2-walnut hover:text-v2-linen tracking-[0.18em] uppercase rounded-full",
  v3: "border border-v3-delft text-v3-delft hover:bg-v3-delft hover:text-white tracking-[0.22em] uppercase rounded-full",
};

export default function AddToCalendar({ variant }: { variant: Variant }) {
  const base =
    "inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-sans transition-colors duration-300";
  const cls = `${base} ${themes[variant]}`;
  const fileName = eventTitle().replace(/[^\w]+/g, "-").toLowerCase();

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <a href={googleCalendarUrl()} target="_blank" rel="noopener noreferrer" className={cls}>
        Add to Google Calendar
      </a>
      <a href={icsDataUrl()} download={`${fileName}.ics`} className={cls}>
        Add to Apple Calendar
      </a>
    </div>
  );
}
