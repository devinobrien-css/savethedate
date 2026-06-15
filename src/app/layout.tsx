import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Playfair_Display,
  Jost,
  Tangerine,
} from "next/font/google";
import { wedding } from "@/config/site";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-jost",
  display: "swap",
});

const tangerine = Tangerine({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-tangerine",
  display: "swap",
});

// Absolute base for link-preview URLs. Apple/link unfurlers need ABSOLUTE
// og:image URLs, so metadataBase must point at production. Set SITE_URL on the
// host; the fallback is the live domain.
const siteUrl = process.env.SITE_URL || "https://devinandrebecca.com";

const coupleName = `${wedding.partnerA} & ${wedding.partnerB}`;
const shareTitle = `${coupleName} — Wedding`;
const shareDescription = `${wedding.weddingDateLabel} · ${wedding.city}`;
// A real engagement photo as the share thumbnail (portrait previews fine in
// Messages). Swap this path to change the image shown in link previews.
const shareImage = "/photos/IMG_6817.JPG";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Save the Date",
  description: "We're getting married — save the date.",
  openGraph: {
    type: "website",
    siteName: coupleName,
    title: shareTitle,
    description: shareDescription,
    url: "/",
    images: [{ url: shareImage, width: 1366, height: 2048, alt: coupleName }],
  },
  twitter: {
    card: "summary_large_image",
    title: shareTitle,
    description: shareDescription,
    images: [shareImage],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${playfair.variable} ${jost.variable} ${tangerine.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
