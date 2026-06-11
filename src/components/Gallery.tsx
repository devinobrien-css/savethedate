"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type Variant = "v1" | "v2" | "v3";

const themes: Record<Variant, { tile: string; ring: string }> = {
  v1: { tile: "rounded-none", ring: "ring-v1-denim" },
  v2: { tile: "rounded-2xl", ring: "ring-v2-caramel" },
  v3: { tile: "rounded-sm", ring: "ring-v3-delft" },
};

export default function Gallery({
  photos,
  variant,
}: {
  photos: string[];
  variant: Variant;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const theme = themes[variant];

  const close = useCallback(() => setOpen(null), []);
  const next = useCallback(
    () => setOpen((i) => (i === null ? i : (i + 1) % photos.length)),
    [photos.length]
  );
  const prev = useCallback(
    () => setOpen((i) => (i === null ? i : (i - 1 + photos.length) % photos.length)),
    [photos.length]
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, next, prev]);

  return (
    <>
      <div className="grid grid-cols-3 gap-1 sm:gap-2">
        {photos.map((src, i) => (
          <button
            key={src}
            onClick={() => setOpen(i)}
            className={`group relative block aspect-square w-full overflow-hidden ${theme.tile} focus:outline-none focus-visible:ring-2 ${theme.ring}`}
            aria-label={`Open photo ${i + 1}`}
          >
            <Image
              src={src}
              alt={`Engagement photo ${i + 1}`}
              width={1366}
              height={2048}
              sizes="(max-width: 768px) 33vw, 33vw"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/30">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-7 w-7 scale-90 text-white opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100"
              >
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
            </span>
          </button>
        ))}
      </div>

      {open !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in"
          onClick={close}
        >
          <button
            className="absolute top-5 right-6 text-white/80 hover:text-white text-3xl font-light"
            onClick={close}
            aria-label="Close"
          >
            ×
          </button>
          <button
            className="absolute left-3 sm:left-8 text-white/70 hover:text-white text-4xl sm:text-5xl font-light px-3"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="Previous"
          >
            ‹
          </button>
          <div
            className="relative max-h-[88vh] max-w-[92vw] sm:max-w-[70vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photos[open]}
              alt={`Engagement photo ${open + 1}`}
              width={1366}
              height={2048}
              className="max-h-[88vh] w-auto h-auto object-contain shadow-2xl"
              priority
            />
            <p className="mt-3 text-center text-white/60 text-sm font-sans tracking-widest2">
              {open + 1} / {photos.length}
            </p>
          </div>
          <button
            className="absolute right-3 sm:right-8 text-white/70 hover:text-white text-4xl sm:text-5xl font-light px-3"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="Next"
          >
            ›
          </button>
        </div>
      )}
    </>
  );
}
