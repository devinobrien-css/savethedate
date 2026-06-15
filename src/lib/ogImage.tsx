import { ImageResponse } from "next/og";
import { wedding } from "@/config/site";

/**
 * Shared renderer for per-page link-preview (Open Graph) images. Each page's
 * `opengraph-image.tsx` calls ogImage("<Page Title>") to produce a branded
 * 1200×630 card — the couple's names up top, the page title centered, and the
 * date/city below — so a shared link unfurls with that page's name on it.
 *
 * Pure typography (no photo fetch, default font) so it renders deterministically
 * at build time on any host. Tune the palette/sizes here and every page follows.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#23201c";
const MUTED = "#8a7c63";
const PAPER = "#f6f1e9";
const LINE = "#cbbfa8";

export function ogImage(title: string) {
  const couple = `${wedding.partnerA} & ${wedding.partnerB}`.toUpperCase();
  const meta = `${wedding.weddingDateLabel} · ${wedding.city}`.toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: PAPER,
          color: INK,
          position: "relative",
        }}
      >
        {/* Hairline frame */}
        <div
          style={{
            position: "absolute",
            top: 32,
            left: 32,
            right: 32,
            bottom: 32,
            border: `1px solid ${LINE}`,
          }}
        />
        <div style={{ fontSize: 26, letterSpacing: 14, color: MUTED }}>
          {couple}
        </div>
        <div
          style={{
            display: "flex",
            maxWidth: 980,
            marginTop: 30,
            marginBottom: 30,
            fontSize: 88,
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 24, letterSpacing: 8, color: MUTED }}>
          {meta}
        </div>
      </div>
    ),
    { ...size }
  );
}
