import Image from "next/image";

/**
 * "Colors in action" gallery for the Dress Code page — a pool of example looks
 * across the palette colors, meant to be shortlisted to favorites. Photos are
 * hot-linked from Unsplash (free license); images.unsplash.com is allow-listed
 * in next.config.mjs under images.remotePatterns.
 */

const examples = [
  {
    name: "Navy",
    hex: "#2c3e57",
    src: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=70&auto=format&fit=crop",
    alt: "A man in a navy blue suit",
  },
  {
    name: "Navy",
    hex: "#2c3e57",
    src: "https://images.unsplash.com/photo-1765229281558-b0a2555894af?w=600&q=70&auto=format&fit=crop",
    alt: "A woman in a navy blue evening gown",
  },
  {
    name: "Charcoal",
    hex: "#3a3a40",
    src: "https://images.unsplash.com/photo-1622497170185-5d668f816a56?w=600&q=70&auto=format&fit=crop",
    alt: "A man in a charcoal grey suit",
  },
  {
    name: "Grey",
    hex: "#8a8a90",
    src: "https://images.unsplash.com/photo-1515736076039-a3ca66043b27?w=600&q=70&auto=format&fit=crop",
    alt: "A man in a light grey suit",
  },
  {
    name: "Black tie",
    hex: "#1c1c20",
    src: "https://images.unsplash.com/photo-1582757794585-ddff6bb050c1?w=600&q=70&auto=format&fit=crop",
    alt: "A man in a classic black tuxedo",
  },
  {
    name: "Emerald",
    hex: "#1f6b54",
    src: "https://images.unsplash.com/photo-1765229280659-d35a2467b976?w=600&q=70&auto=format&fit=crop",
    alt: "A woman in an emerald green gown",
  },
  {
    name: "Emerald",
    hex: "#1f6b54",
    src: "https://images.unsplash.com/photo-1768489038903-b9f420a81b8d?w=600&q=70&auto=format&fit=crop",
    alt: "A man in a green suit",
  },
  {
    name: "Sage",
    hex: "#7c8d60",
    src: "https://images.unsplash.com/photo-1596783047904-4000addd05cd?w=600&q=70&auto=format&fit=crop",
    alt: "A woman in a sage green dress",
  },
  {
    name: "Gold",
    hex: "#c8a23a",
    src: "https://images.unsplash.com/photo-1765229296513-2d3f5ac9fae1?w=600&q=70&auto=format&fit=crop",
    alt: "A woman in an elegant gold dress",
  },
  {
    name: "Gold",
    hex: "#c8a23a",
    src: "https://images.unsplash.com/photo-1741985979879-b651b5d0beba?w=600&q=70&auto=format&fit=crop",
    alt: "A woman in a champagne floor-length gown",
  },
  {
    name: "Terracotta",
    hex: "#bf6a4a",
    src: "https://images.unsplash.com/photo-1683660107856-cdad7a562d12?w=600&q=70&auto=format&fit=crop",
    alt: "A woman in a terracotta colored dress",
  },
  {
    name: "Dusty Rose",
    hex: "#c89aa0",
    src: "https://images.unsplash.com/photo-1686686200263-f858545912ce?w=600&q=70&auto=format&fit=crop",
    alt: "A woman in a dusty rose dress",
  },
  {
    name: "Dusty Rose",
    hex: "#c89aa0",
    src: "https://images.unsplash.com/photo-1689735474643-e0e145a9d577?w=600&q=70&auto=format&fit=crop",
    alt: "A woman in a mauve pink gown",
  },
  {
    name: "Plum",
    hex: "#6b4a6b",
    src: "https://images.unsplash.com/photo-1747264463903-76bb12c71ee7?w=600&q=70&auto=format&fit=crop",
    alt: "A woman in a plum purple dress",
  },
  {
    name: "Plum",
    hex: "#6b4a6b",
    src: "https://images.unsplash.com/photo-1765229279084-dae3e4631670?w=600&q=70&auto=format&fit=crop",
    alt: "A woman in a purple beaded gown",
  },
  {
    name: "Burgundy",
    hex: "#6e2433",
    src: "https://images.unsplash.com/photo-1773574488221-08b2883a1c80?w=600&q=70&auto=format&fit=crop",
    alt: "A woman in a burgundy gown",
  },
];

export default function PaletteExamples() {
  return (
    <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
      {examples.map(({ name, hex, src, alt }, i) => (
        <figure
          key={`${name}-${i}`}
          className="overflow-hidden rounded-xl border border-v1-ink/10 bg-white/40"
        >
          <div className="relative aspect-[3/4] w-full">
            <Image
              src={src}
              alt={alt}
              fill
              sizes="(min-width: 640px) 25vw, 50vw"
              className="object-cover"
            />
          </div>
          <figcaption className="flex items-center justify-center gap-2 px-2 py-3">
            <span
              className="h-3 w-3 shrink-0 rounded-full ring-1 ring-v1-ink/10"
              style={{ backgroundColor: hex }}
            />
            <span className="text-[10px] uppercase tracking-widest2 text-v1-denim">
              {name}
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
