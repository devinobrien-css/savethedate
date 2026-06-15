import type { Metadata } from "next";
import { wedding } from "@/config/site";
import InfoPage from "@/components/InfoPage";
import PaletteExamples from "@/components/PaletteExamples";

export const metadata: Metadata = {
  title: `Dress Code — ${wedding.partnerA} & ${wedding.partnerB}`,
  description: `${wedding.dressCode} · ${wedding.dressCodeNote}`,
};

// Palette inspiration shown to guests. Ivory is reserved for the bride and
// powder blue for the bridesmaids, so neither appears here.
const palette = [
  { name: "Navy", hex: "#2c3e57" },
  { name: "Denim", hex: "#4a6b8a" },
  { name: "Sage", hex: "#7c8d60" },
  { name: "Emerald", hex: "#1f6b54" },
  { name: "Gold", hex: "#c8a23a" },
  { name: "Terracotta", hex: "#bf6a4a" },
  { name: "Dusty Rose", hex: "#c89aa0" },
  { name: "Plum", hex: "#6b4a6b" },
  { name: "Charcoal", hex: "#3a3a40" },
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

        <PaletteExamples />

        <p className="mt-8 text-xs text-v1-denim/70">
          Inspiration only — wear whatever makes you feel wonderful.
        </p>
      </div>
    </InfoPage>
  );
}
