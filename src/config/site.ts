/**
 * ─────────────────────────────────────────────────────────────────────────
 *  SAVE-THE-DATE · CENTRAL CONFIG
 * ─────────────────────────────────────────────────────────────────────────
 *  Everything content-related lives here so it can be edited in one place.
 *  Devin & Rebecca · July 17, 2027 · The Penn Club, Manhattan.
 * ─────────────────────────────────────────────────────────────────────────
 */

export type SectionFlags = {
  hero: boolean;
  countdown: boolean;
  gallery: boolean;
  ceremony: boolean;
  details: boolean;
  rsvp: boolean;
};

export type WeddingDetails = {
  /** First names, used throughout the copy */
  partnerA: string;
  partnerB: string;
  /** ISO 8601 — drives the countdown + calendar files. Local time of the event. */
  weddingDateISO: string;
  /** Human-friendly date string shown in the UI */
  weddingDateLabel: string;
  /** Stylized short date used as a decorative accent (e.g. "7 • 17 • 27") */
  dateStylized: string;
  /** Time shown in the UI / used for the calendar event */
  ceremonyTime: string;
  /** Duration of the calendar hold, in hours */
  durationHours: number;
  venueName: string;
  venueAddress: string;
  city: string;
  /** Where the proposal happened — flavor copy */
  proposalPlace: string;
  /** A short note / invitation line */
  message: string;
  /** Heading + body for the "ceremony details to come" section */
  ceremonyHeading: string;
  ceremonyNote: string;
  rsvpByLabel: string;
};

/** ── EDIT ME ──────────────────────────────────────────────────────────── */
export const wedding: WeddingDetails = {
  partnerA: "Devin",
  partnerB: "Rebecca",
  weddingDateISO: "2027-07-17T16:00:00",
  weddingDateLabel: "July 17, 2027",
  dateStylized: "7 • 17 • 27",
  ceremonyTime: "Time to be announced",
  durationHours: 6,
  venueName: "The Penn Club",
  venueAddress: "30 West 44th Street, New York, NY 10036",
  city: "Manhattan, New York",
  proposalPlace: "Central Park, New York City",
  message:
    "After a sunlit morning in Central Park and a question with only one answer, we'd be honored to have you celebrate with us.",
  ceremonyHeading: "Ceremony details to come",
  ceremonyNote:
    "The finer details — ceremony time, schedule, and all that follows — are still coming together. We simply couldn't wait to share the date. Full details to follow.",
  rsvpByLabel: "Kindly respond by June 1, 2027",
};

/** All curated proposal photos (portrait, golden hour). */
export const galleryPhotos = [
  "/photos/IMG_6786.JPG",
  "/photos/IMG_6787.JPG",
  "/photos/IMG_6790.JPG",
  "/photos/IMG_6793.JPG",
  "/photos/IMG_6798.JPG",
  "/photos/IMG_6801.JPG",
  "/photos/IMG_6808.JPG",
  "/photos/IMG_6810.JPG",
  "/photos/IMG_6815.JPG",
  "/photos/IMG_6818.JPG",
  "/photos/IMG_6820.JPG",
  "/photos/IMG_6822.JPG",
  "/photos/IMG_6823.JPG",
];

/** Per-version hero + section ordering + feature flags. */
export type VersionConfig = {
  slug: string;
  name: string;
  tagline: string;
  hero: string;
  /** A second supporting image used in detail / split sections */
  accentImage: string;
  flags: SectionFlags;
};

export const versions: Record<"v1" | "v2" | "v3", VersionConfig> = {
  v1: {
    slug: "version-1",
    name: "Modern New York",
    tagline: "Sleek. City light. Unforgettable.",
    hero: "/photos/IMG_6786.JPG",
    accentImage: "/photos/IMG_6820.JPG",
    flags: { hero: true, countdown: true, gallery: true, ceremony: true, details: true, rsvp: true },
  },
  v2: {
    slug: "version-2",
    name: "Connecticut Backyard",
    tagline: "Warm light, open doors, feels like home.",
    hero: "/photos/IMG_6798.JPG",
    accentImage: "/photos/IMG_6822.JPG",
    flags: { hero: true, countdown: true, gallery: true, ceremony: true, details: true, rsvp: true },
  },
  v3: {
    slug: "version-3",
    name: "New England Floral",
    tagline: "Simple, elegant, in full bloom.",
    hero: "/photos/IMG_6815.JPG",
    accentImage: "/photos/IMG_6787.JPG",
    flags: { hero: true, countdown: true, gallery: true, ceremony: true, details: true, rsvp: true },
  },
};
