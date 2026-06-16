import "server-only";
import { getSupabase, RSVP_TABLE, type RSVP } from "@/lib/supabase";

/**
 * Address book ("guests") data access. Mirrors the RSVP/registry setup: every
 * read/write goes through the server-side service-role client, so callers must
 * already have checked isSupabaseConfigured().
 *
 *  guests          — the mailing list the couple curates (name + address)
 *  rsvps.guest_id  — nullable FK linking a submitted RSVP to a guest record
 *
 * A guest can have several linked RSVPs (e.g. each partner of a household
 * responds separately); an RSVP links to at most one guest.
 */

export const GUESTS_TABLE = "guests";

export type Guest = {
  id: string;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  household_label: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  notes: string | null;
};

/** A guest plus every RSVP currently linked to them. */
export type GuestWithRsvps = Guest & { rsvps: RSVP[] };

/** An unlinked RSVP, with a best-guess guest match (by email) for one-click linking. */
export type UnlinkedRsvp = RSVP & { suggestedGuestId: string | null };

export type AddressBook = {
  guests: GuestWithRsvps[];
  unlinked: UnlinkedRsvp[];
};

const normEmail = (v: string | null | undefined): string =>
  (v ?? "").trim().toLowerCase();

/** True when the guest has at least a street + city to mail something to. */
export function hasAddress(g: Guest): boolean {
  return Boolean(g.address_line1 && g.city);
}

/** The guest's mailing address as display lines (recipient name first). */
export function formatAddress(g: Guest): string[] {
  const recipient =
    g.household_label?.trim() ||
    [g.first_name, g.last_name].filter(Boolean).join(" ");
  const cityLine = [
    [g.city, g.state].filter(Boolean).join(", "),
    g.postal_code,
  ]
    .filter(Boolean)
    .join(" ");
  return [
    recipient,
    g.address_line1,
    g.address_line2,
    cityLine,
    g.country && g.country.toLowerCase() !== "usa" ? g.country : null,
  ]
    .map((l) => (l ?? "").trim())
    .filter(Boolean);
}

/** Short "First Last" / household label for menus and badges. */
export function guestLabel(g: Pick<Guest, "first_name" | "last_name" | "household_label">): string {
  const name = [g.first_name, g.last_name].filter(Boolean).join(" ");
  if (g.household_label && g.household_label !== name) {
    return `${name} · ${g.household_label}`;
  }
  return name || g.household_label || "Unnamed guest";
}

/**
 * Load the whole address book in one pass: every guest with their linked
 * RSVPs, plus the RSVPs that aren't linked yet (each annotated with a suggested
 * guest match by email so the admin can link with one click).
 */
export async function getAddressBook(): Promise<AddressBook> {
  const supabase = getSupabase();

  const [guestsRes, rsvpsRes] = await Promise.all([
    supabase
      .from(GUESTS_TABLE)
      .select("*")
      .order("last_name", { ascending: true })
      .order("first_name", { ascending: true }),
    supabase
      .from(RSVP_TABLE)
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  if (guestsRes.error) throw new Error(guestsRes.error.message);
  if (rsvpsRes.error) throw new Error(rsvpsRes.error.message);

  const guests = (guestsRes.data ?? []) as Guest[];
  const rsvps = (rsvpsRes.data ?? []) as RSVP[];

  // Group linked RSVPs onto their guest.
  const byGuest = new Map<string, RSVP[]>();
  for (const r of rsvps) {
    if (!r.guest_id) continue;
    const list = byGuest.get(r.guest_id) ?? [];
    list.push(r);
    byGuest.set(r.guest_id, list);
  }

  // Index guests by email for suggesting matches on the unlinked ones.
  const guestByEmail = new Map<string, string>();
  for (const g of guests) {
    const e = normEmail(g.email);
    if (e && !guestByEmail.has(e)) guestByEmail.set(e, g.id);
  }

  const guestsWithRsvps: GuestWithRsvps[] = guests.map((g) => ({
    ...g,
    rsvps: byGuest.get(g.id) ?? [],
  }));

  const unlinked: UnlinkedRsvp[] = rsvps
    .filter((r) => !r.guest_id)
    .map((r) => ({
      ...r,
      suggestedGuestId: guestByEmail.get(normEmail(r.email)) ?? null,
    }));

  return { guests: guestsWithRsvps, unlinked };
}
