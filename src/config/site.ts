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
  /** Dress code — short label + a one-line descriptor */
  dressCode: string;
  dressCodeNote: string;
};

/** ── EDIT ME ──────────────────────────────────────────────────────────── */
export const wedding: WeddingDetails = {
  partnerA: "Devin",
  partnerB: "Rebecca",
  weddingDateISO: "2027-07-17T16:00:00",
  weddingDateLabel: "July 17, 2027",
  dateStylized: "7.17.27",
  ceremonyTime: "Time to be announced",
  durationHours: 6,
  venueName: "The Penn Club",
  venueAddress: "30 West 44th Street, New York, NY 10036",
  city: "Manhattan, New York",
  proposalPlace: "Central Park, New York City",
  message:
    "After a sunlit afternoon in Central Park and a question with only one answer, we'd be honored to have you celebrate with us.",
  ceremonyHeading: "Ceremony details to come",
  ceremonyNote:
    "The finer details — ceremony time, schedule, and all that follows — are still coming together. We simply couldn't wait to share the date. Full details to follow.",
  rsvpByLabel: "Kindly respond by June 1, 2027",
  dressCode: "Cocktail",
  dressCodeNote: "City-chic, evening elegant",
};

/**
 * The order of events on the wedding day — drives the timeline on the
 * Location & Time page. Kept here so the whole schedule edits in one place.
 */
import type { ScheduleIconName } from "@/components/ScheduleIcon";

export type ScheduleStop = {
  /** Time label, e.g. "3:00 PM". Empty string if not yet set. */
  time: string;
  /** What's happening, e.g. "Ceremony". */
  title: string;
  /** Where / supporting line. Empty string to omit. */
  detail: string;
  /** Which line-art icon to draw on the rail. */
  icon: ScheduleIconName;
  /** Travel legs (shuttles) render lighter, as connectors rather than stops. */
  transit?: boolean;
  /** Renders a "day break" divider above this stop (e.g. "The Next Morning"). */
  dayLabel?: string;
};

export const daySchedule: ScheduleStop[] = [
  {
    time: "Time TBA",
    title: "Gather at The Penn Club",
    detail: "30 West 44th Street — where the day begins.",
    icon: "toast",
  },
  {
    time: "",
    title: "Shuttle to the ceremony",
    detail: "Buses take us from The Penn Club to the church.",
    icon: "bus",
    transit: true,
  },
  {
    time: "3:00 PM",
    title: "Ceremony",
    detail: "At the church — location to be announced.",
    icon: "rings",
  },
  {
    time: "",
    title: "Shuttle back to The Penn Club",
    detail: "Buses return us for the reception.",
    icon: "bus",
    transit: true,
  },
  {
    time: "6:00 PM",
    title: "Cocktail Hour",
    detail: "The Penn Club.",
    icon: "martini",
  },
  {
    time: "7:00 PM",
    title: "Dinner",
    detail: "The Penn Club.",
    icon: "utensils",
  },
  {
    time: "After dinner",
    title: "Music & Dancing",
    detail: "Stay late and celebrate with us.",
    icon: "music",
  },
  {
    time: "Time TBA",
    title: "Farewell Brunch",
    detail: "A relaxed send-off before you head home — details to come.",
    icon: "coffee",
    dayLabel: "The Next Morning",
  },
];

/**
 * One-line summary shown under the date on the Location & Time page — the
 * essentials in a single scan. The timeline below is the full detail.
 */
export const locationSummary =
  "Ceremony 3 PM · Reception at The Penn Club · shuttles provided";

/**
 * Pins for the map on the Location & Time page. The church is a placeholder
 * until the venue is confirmed — update its lat/lng (or set show:false) then.
 */
export type MapPinKind = "venue" | "tentative" | "landmark";

export type MapPin = {
  lat: number;
  lng: number;
  label: string;
  /** Optional second line in the marker label. */
  sublabel?: string;
  kind: MapPinKind;
  /** Which side the label chip sits on. Defaults to "right". */
  labelDir?: "left" | "right";
  /**
   * Search string used when the pin is tapped to open a maps app. Set this to
   * make the pin clickable; omit (e.g. tentative church) to leave it inert.
   * Falls back to the pin's lat/lng inside that handler if needed.
   */
  mapsQuery?: string;
  /** Set false to hide the pin (e.g. church not yet known). */
  show?: boolean;
};

export const mapPins: MapPin[] = [
  {
    lat: 40.75565,
    lng: -73.9803,
    label: "The Penn Club",
    sublabel: "30 West 44th Street",
    kind: "venue",
    labelDir: "left", // sits close to Grand Central — push label the other way
    mapsQuery: "The Penn Club, 30 West 44th Street, New York, NY",
  },
  {
    // Placeholder in the East 80s (Upper East Side) — replace with the real
    // church when confirmed. Around East 81st St & Park Ave.
    lat: 40.7768,
    lng: -73.9575,
    label: "Ceremony",
    sublabel: "Church · East 80s, TBA",
    kind: "tentative",
  },
  {
    lat: 40.75273,
    lng: -73.97715,
    label: "Grand Central Terminal",
    sublabel: "≈ 5 min walk away",
    kind: "landmark",
    mapsQuery: "Grand Central Terminal, New York, NY",
  },
];

/**
 * Travel & lodging recommendations shown at the bottom of the Location & Time
 * page. App links live here so they're easy to update.
 */
export const recommendationsIntro = "Arrive early, stay late!";

export type Recommendation = {
  icon: ScheduleIconName;
  title: string;
  body: string;
  /** Optional app / website callout link. */
  linkLabel?: string;
  linkHref?: string;
  /** Optional emphasized practical note. */
  note?: string;
};

export const travelRecs: Recommendation[] = [
  {
    icon: "train",
    title: "Take the train — our top pick",
    body: "The Penn Club is about a five-minute walk from Grand Central Terminal, so the train is by far the easiest way in and out of the city.",
    linkLabel: "MTA TrainTime app",
    linkHref: "https://new.mta.info",
    note: "Check schedules and buy tickets right in the app. After 11 PM, trains generally run on the hour, every hour.",
  },
  {
    icon: "car",
    title: "Braving the drive?",
    body: "You have our blessing — just plan for city traffic and limited parking.",
    linkLabel: "SpotAngels app",
    linkHref: "https://www.spotangels.com",
    note: "Handy for finding garages and parking near The Penn Club.",
  },
];

/**
 * Overnight stay note. Hidden unless RECOMMEND_LODGING="true" — often shown
 * to family only. The page reads that env flag.
 */
export const lodgingRec: Recommendation = {
  icon: "moon",
  title: "Staying overnight",
  body: "Overnight accommodations at The Penn Club may be available by request. Reach out to us and we'll help arrange it.",
};

/**
 * Directory links shown on the home page (/). Each is toggled by an env flag
 * (shown unless the flag is set to "false"); the page resolves flag/href.
 */
export type NavLink = {
  label: string;
  caption: string;
  href: string;
  /** Env var that toggles visibility — defaults to shown unless "false". */
  flag: string;
  /** Optional env var holding an external URL that overrides href when set. */
  hrefEnv?: string;
  /** Short label for the compact bottom nav bar. Falls back to `label`. */
  short?: string;
  /** Icon key used by the bottom nav bar (see BottomNav). */
  icon?: "calendar" | "map" | "attire" | "rsvp" | "gift";
};

export const navLinks: NavLink[] = [
  {
    label: "Save the Date",
    caption: "Our date & story",
    href: "/save-the-date",
    flag: "NAV_SAVE_THE_DATE",
    short: "Date",
    icon: "calendar",
  },
  {
    label: "Location & Time",
    caption: "Where & when we'll celebrate",
    href: "/location",
    flag: "NAV_LOCATION_TIME",
    short: "Location",
    icon: "map",
  },
  {
    label: "Dress Code",
    caption: "What to wear",
    href: "/dress-code",
    flag: "NAV_DRESS_CODE",
    short: "Attire",
    icon: "attire",
  },
  {
    label: "RSVP",
    caption: "Let us know you're coming",
    href: "/rsvp",
    flag: "NAV_RSVP",
    short: "RSVP",
    icon: "rsvp",
  },
  {
    label: "Registry & Gifts",
    caption: "Your presence is the present",
    href: "/registry",
    flag: "NAV_REGISTRY",
    short: "Gifts",
    icon: "gift",
    // If REGISTRY_URL is set it overrides the in-app /registry page (e.g. to
    // point at an external registry instead). Leave unset to use our own page.
    hrefEnv: "REGISTRY_URL",
  },
];

/**
 * Server-only nav resolution shared by the home directory (/) and the bottom
 * nav bar. A link is shown unless its flag env var is exactly "false"; an
 * optional hrefEnv overrides the href when set. Reads process.env, so call
 * this from server components only.
 */
export function enabledNavLinks(): NavLink[] {
  return navLinks
    .filter((l) => process.env[l.flag] !== "false")
    .map((l) => ({
      ...l,
      href: l.hrefEnv && process.env[l.hrefEnv] ? (process.env[l.hrefEnv] as string) : l.href,
    }));
}

/**
 * Cash-gift options shown as a section on the registry page. No payment is
 * processed on-site — these are simply the ways guests can give directly.
 */
export type GiftOptions = {
  /** Master toggle for the whole "prefer to give a gift" section. */
  show: boolean;
  heading: string;
  note: string;
  /** Venmo username without the leading "@" (e.g. "devin-obrien"). */
  venmoHandle?: string;
  /** A short line about check / cash (e.g. "Find us at the reception"). */
  checkCashNote?: string;
};

export const gifts: GiftOptions = {
  show: true,
  heading: "Prefer to give a gift?",
  note: "Your presence is the greatest gift — but if you'd like to give something toward our next chapter, we're grateful for any of the below.",
  venmoHandle: "",
  checkCashNote: "Checks or cash are warmly welcomed — find us at the reception, or reach out and we'll share a mailing address.",
};

/** venmo.com profile link for the configured handle, or null if unset. */
export function venmoUrl(): string | null {
  return gifts.venmoHandle ? `https://venmo.com/u/${gifts.venmoHandle}` : null;
}

/**
 * Shipping address for physical gifts, read from the SHIPPING_ADDRESS env var
 * so a home address never lives in this public repo. Separate lines with "|",
 * e.g. SHIPPING_ADDRESS="Devin & Rebecca|306 Example St|City, ST 00000".
 * Returns the trimmed lines, or null if unset — callers fall back to the
 * "reach out and we'll share a mailing address" note. Server-only (reads
 * process.env), and only ever surfaced after a guest confirms a gift.
 */
export function shippingAddressLines(): string[] | null {
  const raw = process.env.SHIPPING_ADDRESS?.trim();
  if (!raw) return null;
  const lines = raw.split("|").map((l) => l.trim()).filter(Boolean);
  return lines.length ? lines : null;
}

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
    hero: "/photos/IMG_6817.JPG",
    accentImage: "/photos/IMG_6788.JPG",
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
