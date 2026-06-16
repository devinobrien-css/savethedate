import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  getAddressBook,
  formatAddress,
  guestLabel,
  hasAddress,
  type AddressBook,
  type GuestWithRsvps,
} from "@/lib/guests";
import AdminHeader from "../AdminHeader";
import GuestForm from "./GuestForm";
import LinkControls, { type GuestOption } from "./LinkControls";
import { DeleteGuestButton, UnlinkRsvpButton } from "./RowActions";

export const metadata: Metadata = {
  title: "Guests Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 font-sans">
      {children}
    </main>
  );
}

export default async function GuestsAdminPage() {
  // Reuse the RSVP dashboard's login: unauthenticated admins go there to sign in.
  if (!(await isAuthed())) {
    redirect("/admin");
  }

  if (!isSupabaseConfigured()) {
    return (
      <Shell>
        <div className="mx-auto max-w-5xl px-6 py-12">
          <AdminHeader active="guests" />
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
            Supabase isn&apos;t configured. Set <code>SUPABASE_URL</code> and{" "}
            <code>SUPABASE_SERVICE_ROLE_KEY</code>, then run{" "}
            <code>supabase/schema.sql</code> to create the <code>guests</code> table.
          </p>
        </div>
      </Shell>
    );
  }

  let book: AddressBook = { guests: [], unlinked: [] };
  let loadError: string | null = null;
  try {
    book = await getAddressBook();
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Failed to load guests.";
  }

  const { guests, unlinked } = book;
  const withAddress = guests.filter(hasAddress).length;
  const linkedCount = guests.reduce((n, g) => n + g.rsvps.length, 0);

  // The full menu of guests offered for manual linking on unlinked RSVPs.
  const guestOptions: GuestOption[] = guests.map((g) => ({
    id: g.id,
    label: guestLabel(g),
  }));

  return (
    <Shell>
      <div className="mx-auto max-w-5xl px-6 py-12">
        <AdminHeader active="guests" />

        <h1 className="mb-8 font-serif text-2xl">Guests &amp; Addresses</h1>

        {loadError && (
          <p className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            Couldn&apos;t load the address book: {loadError}
          </p>
        )}

        <section className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Guests" value={guests.length} />
          <Stat label="With address" value={withAddress} />
          <Stat label="RSVPs linked" value={linkedCount} />
          <Stat label="Unlinked RSVPs" value={unlinked.length} />
        </section>

        {/* Add a guest */}
        <details className="mb-10 rounded-lg border border-neutral-800 bg-neutral-900/60">
          <summary className="cursor-pointer list-none px-5 py-4 text-sm font-medium uppercase tracking-[0.2em] text-neutral-300 marker:hidden">
            + Add a guest
          </summary>
          <div className="border-t border-neutral-800 p-5">
            <GuestForm mode="create" />
          </div>
        </details>

        {/* Unlinked RSVPs — responses not yet matched to an address */}
        {unlinked.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-3 text-[11px] uppercase tracking-[0.2em] text-amber-300/90">
              Unlinked RSVPs · {unlinked.length}
            </h2>
            <p className="mb-4 text-xs text-neutral-500">
              These responses aren&apos;t matched to an address book entry yet.
              A green button means we found a guest with the same email — one
              click to confirm. Otherwise pick a guest, or add them.
            </p>
            <ul className="space-y-2">
              {unlinked.map((r) => {
                const name = `${r.first_name} ${r.last_name}`.trim();
                const suggestion =
                  r.suggestedGuestId != null
                    ? guestOptions.find((g) => g.id === r.suggestedGuestId) ?? null
                    : null;
                return (
                  <li
                    key={r.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-neutral-100">{name}</span>
                        <AttendBadge attending={r.attending} party={r.party_size} />
                      </div>
                      <p className="mt-0.5 truncate text-xs text-neutral-500">
                        {r.email}
                      </p>
                    </div>
                    <LinkControls
                      rsvpId={r.id}
                      rsvpName={name}
                      suggestion={suggestion}
                      guests={guestOptions}
                    />
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* The address book */}
        <h2 className="mb-3 text-[11px] uppercase tracking-[0.2em] text-neutral-500">
          Address book · {guests.length}
        </h2>
        {guests.length === 0 ? (
          <p className="rounded-lg border border-neutral-800 bg-neutral-900 p-8 text-center text-sm text-neutral-400">
            No guests yet. Use “Add a guest” above, or “Add to address book” on an
            unlinked RSVP to start your mailing list.
          </p>
        ) : (
          <ul className="space-y-3">
            {guests.map((g) => (
              <GuestRow key={g.id} guest={g} />
            ))}
          </ul>
        )}
      </div>
    </Shell>
  );
}

function GuestRow({ guest }: { guest: GuestWithRsvps }) {
  const name = [guest.first_name, guest.last_name].filter(Boolean).join(" ");
  const addressLines = formatAddress(guest);
  const onFile = hasAddress(guest);

  return (
    <li className="rounded-lg border border-neutral-800 bg-neutral-900">
      <div className="flex flex-wrap items-start gap-4 p-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-neutral-100">{name}</span>
            {guest.household_label && guest.household_label !== name && (
              <span className="text-xs text-neutral-500">
                {guest.household_label}
              </span>
            )}
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                onFile
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "bg-amber-500/15 text-amber-300"
              }`}
            >
              {onFile ? "Address on file" : "No address"}
            </span>
          </div>

          {guest.email && (
            <p className="mt-0.5 truncate text-xs text-neutral-500">{guest.email}</p>
          )}

          {onFile && (
            <address className="mt-2 text-sm not-italic leading-snug text-neutral-300">
              {addressLines.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </address>
          )}

          {guest.notes && (
            <p className="mt-2 text-xs italic text-neutral-500">{guest.notes}</p>
          )}

          {/* Linked RSVPs */}
          {guest.rsvps.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-600">
                RSVP
              </span>
              {guest.rsvps.map((r) => {
                const rName = `${r.first_name} ${r.last_name}`.trim();
                return (
                  <span
                    key={r.id}
                    className="inline-flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-950 px-2 py-1"
                  >
                    <AttendBadge attending={r.attending} party={r.party_size} />
                    <span className="text-xs text-neutral-400">{rName}</span>
                    <UnlinkRsvpButton rsvpId={r.id} name={rName} />
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <DeleteGuestButton id={guest.id} name={name} />
      </div>

      {/* Edit disclosure */}
      <details className="border-t border-neutral-800">
        <summary className="cursor-pointer list-none px-4 py-2.5 text-[11px] uppercase tracking-[0.2em] text-neutral-500 transition-colors hover:text-neutral-300 marker:hidden">
          Edit
        </summary>
        <div className="border-t border-neutral-800 p-4">
          <GuestForm mode="edit" guest={guest} />
        </div>
      </details>
    </li>
  );
}

function AttendBadge({ attending, party }: { attending: boolean; party: number }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
        attending
          ? "bg-emerald-500/15 text-emerald-300"
          : "bg-neutral-700/40 text-neutral-300"
      }`}
    >
      {attending ? `Accepts${party ? ` · ${party}` : ""}` : "Declines"}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5">
      <p className="text-3xl font-semibold text-neutral-100">{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-neutral-500">
        {label}
      </p>
    </div>
  );
}
