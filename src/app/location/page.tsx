import type { Metadata } from "next";
import { wedding } from "@/config/site";
import InfoPage from "@/components/InfoPage";
import AddToCalendar from "@/components/AddToCalendar";

export const metadata: Metadata = {
  title: `Location & Time — ${wedding.partnerA} & ${wedding.partnerB}`,
  description: `${wedding.venueName} · ${wedding.weddingDateLabel}`,
};

const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${wedding.venueName}, ${wedding.venueAddress}`
)}`;

export default function LocationPage() {
  return (
    <InfoPage eyebrow="Location & Time" title={wedding.venueName}>
      <div className="grid gap-10 border-y border-v1-ink/10 py-12 sm:grid-cols-2">
        <div>
          <p className="text-[11px] uppercase tracking-widest2 text-v1-denim">When</p>
          <p className="mt-3 font-display text-2xl text-v1-ink">
            {wedding.weddingDateLabel}
          </p>
          <p className="mt-1 text-sm text-v1-denim/80">{wedding.ceremonyTime}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-widest2 text-v1-denim">Where</p>
          <p className="mt-3 font-display text-2xl text-v1-ink">{wedding.venueName}</p>
          <p className="mt-1 text-sm text-v1-denim/80">{wedding.venueAddress}</p>
        </div>
      </div>

      <div className="mt-12 flex flex-col items-center gap-5">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block border border-v1-blush/70 bg-transparent px-9 py-3.5 text-[11px] uppercase tracking-widest2 text-v1-blush transition-colors duration-300 hover:bg-v1-blush hover:text-v1-ink"
        >
          Get Directions
        </a>
        <AddToCalendar variant="v1" />
      </div>

      <p className="mt-12 text-[11px] uppercase tracking-widest2 text-v1-denim">
        Ceremony time to be announced · formal invitation to follow
      </p>
    </InfoPage>
  );
}
