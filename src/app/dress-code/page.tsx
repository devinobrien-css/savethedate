import type { Metadata } from "next";
import { wedding } from "@/config/site";
import InfoPage from "@/components/InfoPage";

export const metadata: Metadata = {
  title: `Dress Code — ${wedding.partnerA} & ${wedding.partnerB}`,
  description: `${wedding.dressCode} · ${wedding.dressCodeNote}`,
};

// Palette inspiration shown to guests (matches the site's Powder Blue scheme).
const palette = [
  { name: "Powder Blue", hex: "#9fb8d0" },
  { name: "Ivory", hex: "#f3ecdc" },
  { name: "Gold", hex: "#c8a23a" },
  { name: "Greenery", hex: "#7c8d60" },
];

export default function DressCodePage() {
  return (
    <InfoPage eyebrow="Dress Code" title={wedding.dressCode}>
      <p className="text-[11px] uppercase tracking-widest2 text-v1-denim">
        {wedding.dressCodeNote}
      </p>

      <p className="mx-auto mt-10 max-w-xl text-base leading-relaxed text-v1-denim/85">
        Think polished and celebratory — suits and ties, cocktail dresses, or
        elegant separates. We&apos;ll be indoors at {wedding.venueName}, so dress
        for an evening of city-chic celebration.
      </p>

      <div className="mt-14">
        <p className="text-[11px] uppercase tracking-widest2 text-v1-denim">
          A little palette inspiration
        </p>
        <div className="mt-6 flex flex-wrap items-start justify-center gap-6">
          {palette.map((c) => (
            <div key={c.name} className="flex flex-col items-center gap-2">
              <span
                className="h-12 w-12 rounded-full ring-1 ring-v1-ink/10"
                style={{ backgroundColor: c.hex }}
              />
              <span className="text-[10px] uppercase tracking-widest2 text-v1-denim">
                {c.name}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs text-v1-denim/70">
          Inspiration only — wear whatever makes you feel wonderful.
        </p>
      </div>
    </InfoPage>
  );
}
