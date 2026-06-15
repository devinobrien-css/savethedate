import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { wedding } from "@/config/site";
import InfoPage from "@/components/InfoPage";
import RSVPForm from "@/components/RSVPForm";

export const metadata: Metadata = {
  title: `RSVP — ${wedding.partnerA} & ${wedding.partnerB}`,
  description: `Kindly respond by ${wedding.rsvpByLabel}.`,
};

export default function RSVPPage() {
  if (process.env.NAV_RSVP === "false") notFound();

  return (
    <InfoPage eyebrow="RSVP" title="Will you join us?">
      <p className="text-[11px] uppercase tracking-widest2 text-v1-denim">
        {wedding.rsvpByLabel}
      </p>

      <div className="mt-10 border border-v1-ink/10 border-t-2 border-t-v1-blush bg-white px-7 py-10 sm:px-12 sm:py-12 shadow-[0_24px_60px_-28px_rgba(30,42,58,0.4)]">
        <RSVPForm variant="v1" />
      </div>
    </InfoPage>
  );
}
