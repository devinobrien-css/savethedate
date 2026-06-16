import "server-only";
import { getSupabase, RSVP_TABLE, type RSVP } from "@/lib/supabase";

/**
 * Address book data access. Mirrors the RSVP/registry setup: every read/write
 * goes through the server-side service-role client, so callers must already
 * have checked isSupabaseConfigured().
 *
 *  parties         — one envelope: a household label + a single address
 *  guests          — the named people; each belongs to one party (party_id)
 *  rsvps.party_id  — nullable FK linking a submitted RSVP to a party (household)
 *
 * One person replies for the whole party (party_size is the headcount), so an
 * RSVP attaches to the group rather than an individual; a party can have a few
 * RSVPs (e.g. partners who each submitted the form separately). A party owns
 * the address; a guest owns only person-level fields.
 */

export const PARTIES_TABLE = "parties";
export const GUESTS_TABLE = "guests";

/** A party = one envelope (household label + a single mailing address). */
export type Party = {
  id: string;
  created_at: string;
  updated_at: string;
  household_label: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  notes: string | null;
};

/** A named person belonging to a party. */
export type Guest = {
  id: string;
  created_at: string;
  updated_at: string;
  party_id: string | null;
  first_name: string;
  last_name: string | null;
  email: string | null;
  notes: string | null;
};

/** A party plus the people in it and the RSVPs linked to the household. */
export type PartyWithGuests = Party & { guests: Guest[]; rsvps: RSVP[] };

/** An unlinked RSVP, with a best-guess party match (by email) for one-click linking. */
export type UnlinkedRsvp = RSVP & { suggestedPartyId: string | null };

export type AddressBook = {
  parties: PartyWithGuests[];
  unlinked: UnlinkedRsvp[];
};

const normEmail = (v: string | null | undefined): string =>
  (v ?? "").trim().toLowerCase();

/** "First Last" for a single person. */
export function guestName(
  g: Pick<Guest, "first_name" | "last_name">,
): string {
  return [g.first_name, g.last_name].filter(Boolean).join(" ");
}

/** True when the party has at least a street + city to mail something to. */
export function hasAddress(p: Party): boolean {
  return Boolean(p.address_line1 && p.city);
}

/**
 * A party's mailing recipient line: the explicit household label, or failing
 * that the names of everyone in the party joined together.
 */
export function partyLabel(p: PartyWithGuests): string {
  const label = p.household_label?.trim();
  if (label) return label;
  const names = p.guests.map(guestName).filter(Boolean);
  if (names.length === 0) return "Unnamed party";
  if (names.length === 1) return names[0];
  if (names.length === 2) return names.join(" & ");
  return `${names[0]} + ${names.length - 1} more`;
}

/** The party's mailing address as display lines (recipient name first). */
export function formatAddress(p: PartyWithGuests): string[] {
  const cityLine = [
    [p.city, p.state].filter(Boolean).join(", "),
    p.postal_code,
  ]
    .filter(Boolean)
    .join(" ");
  return [
    partyLabel(p),
    p.address_line1,
    p.address_line2,
    cityLine,
    p.country && p.country.toLowerCase() !== "usa" ? p.country : null,
  ]
    .map((l) => (l ?? "").trim())
    .filter(Boolean);
}

/**
 * Short label for a party in the link menu — the household name, or the names
 * of the people in it when there's no explicit label.
 */
export function partyOptionLabel(p: PartyWithGuests): string {
  return partyLabel(p);
}

/**
 * Load the whole address book in one pass: every party with the people in it
 * and the RSVPs linked to the household, plus the RSVPs that aren't linked yet
 * (each annotated with a suggested party match by email so the admin can link
 * with one click).
 */
export async function getAddressBook(): Promise<AddressBook> {
  const supabase = getSupabase();

  const [partiesRes, guestsRes, rsvpsRes] = await Promise.all([
    supabase
      .from(PARTIES_TABLE)
      .select("*")
      .order("household_label", { ascending: true }),
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

  if (partiesRes.error) throw new Error(partiesRes.error.message);
  if (guestsRes.error) throw new Error(guestsRes.error.message);
  if (rsvpsRes.error) throw new Error(rsvpsRes.error.message);

  const parties = (partiesRes.data ?? []) as Party[];
  const guests = (guestsRes.data ?? []) as Guest[];
  const rsvps = (rsvpsRes.data ?? []) as RSVP[];

  // Group linked RSVPs onto their party.
  const rsvpsByParty = new Map<string, RSVP[]>();
  for (const r of rsvps) {
    if (!r.party_id) continue;
    const list = rsvpsByParty.get(r.party_id) ?? [];
    list.push(r);
    rsvpsByParty.set(r.party_id, list);
  }

  // Group guests onto their party.
  const guestsByParty = new Map<string, Guest[]>();
  for (const g of guests) {
    if (!g.party_id) continue;
    const list = guestsByParty.get(g.party_id) ?? [];
    list.push(g);
    guestsByParty.set(g.party_id, list);
  }

  const partiesWithGuests: PartyWithGuests[] = parties.map((p) => ({
    ...p,
    guests: guestsByParty.get(p.id) ?? [],
    rsvps: rsvpsByParty.get(p.id) ?? [],
  }));

  // Index parties by guest email for suggesting matches on the unlinked RSVPs:
  // a response from jane@… is suggested to whichever party Jane belongs to.
  const partyByEmail = new Map<string, string>();
  for (const g of guests) {
    const e = normEmail(g.email);
    if (e && g.party_id && !partyByEmail.has(e)) partyByEmail.set(e, g.party_id);
  }

  const unlinked: UnlinkedRsvp[] = rsvps
    .filter((r) => !r.party_id)
    .map((r) => ({
      ...r,
      suggestedPartyId: partyByEmail.get(normEmail(r.email)) ?? null,
    }));

  return { parties: partiesWithGuests, unlinked };
}
