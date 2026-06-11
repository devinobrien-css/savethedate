"use client";

import { useEffect, useState } from "react";
import { wedding } from "@/config/site";

type Variant = "v1" | "v2" | "v3";

const themes: Record<
  Variant,
  { wrap: string; cell: string; num: string; label: string }
> = {
  v1: {
    wrap: "gap-3 sm:gap-5",
    cell: "border border-v1-mist/50 bg-white/60 backdrop-blur-sm rounded-none",
    num: "font-display text-v1-ink",
    label: "text-v1-denim uppercase tracking-widest2 font-sans",
  },
  v2: {
    wrap: "gap-3 sm:gap-6",
    cell: "border border-v2-caramel/30 bg-v2-linen/70 rounded-xl shadow-sm",
    num: "font-display text-v2-espresso",
    label: "text-v2-walnut uppercase tracking-[0.25em] font-sans",
  },
  v3: {
    wrap: "gap-3 sm:gap-5",
    cell: "border-b border-v3-powder bg-transparent rounded-none",
    num: "font-serif text-v3-ink",
    label: "text-v3-delft uppercase tracking-[0.3em] font-sans",
  },
};

function diff(target: number) {
  const now = Date.now();
  const d = Math.max(0, target - now);
  return {
    days: Math.floor(d / 86400000),
    hours: Math.floor((d / 3600000) % 24),
    minutes: Math.floor((d / 60000) % 60),
    seconds: Math.floor((d / 1000) % 60),
  };
}

export default function Countdown({ variant }: { variant: Variant }) {
  const target = new Date(wedding.weddingDateISO).getTime();
  const [t, setT] = useState(() => diff(target));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const theme = themes[variant];
  const units: [string, number][] = [
    ["Days", t.days],
    ["Hours", t.hours],
    ["Minutes", t.minutes],
    ["Seconds", t.seconds],
  ];

  return (
    <div className={`flex justify-center ${theme.wrap}`}>
      {units.map(([label, value]) => (
        <div
          key={label}
          className={`flex flex-col items-center justify-center px-4 py-5 sm:px-7 sm:py-7 min-w-[68px] sm:min-w-[110px] ${theme.cell}`}
        >
          <span
            className={`text-3xl sm:text-5xl leading-none tabular-nums ${theme.num}`}
            suppressHydrationWarning
          >
            {mounted ? String(value).padStart(2, "0") : "--"}
          </span>
          <span className={`mt-2 text-[10px] sm:text-xs ${theme.label}`}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
