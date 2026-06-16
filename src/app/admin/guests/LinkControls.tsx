"use client";

import { useState } from "react";
import { linkRsvp, createGuestFromRsvp } from "./actions";

export type GuestOption = { id: string; label: string };

/**
 * The link controls shown on each unlinked RSVP:
 *  1. one-click "Link to <suggested>" when an email match was found,
 *  2. a "Link to…" dropdown over the whole address book (submits on change),
 *  3. "Add to address book" — create a guest from this RSVP and link it.
 */
export default function LinkControls({
  rsvpId,
  rsvpName,
  suggestion,
  guests,
}: {
  rsvpId: string;
  rsvpName: string;
  suggestion: GuestOption | null;
  guests: GuestOption[];
}) {
  const [pending, setPending] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {suggestion && (
        <form action={linkRsvp} onSubmit={() => setPending(true)}>
          <input type="hidden" name="rsvp_id" value={rsvpId} />
          <input type="hidden" name="guest_id" value={suggestion.id} />
          <button
            type="submit"
            disabled={pending}
            className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-emerald-300 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
          >
            Link to {suggestion.label}
          </button>
        </form>
      )}

      {guests.length > 0 && (
        <form action={linkRsvp} onSubmit={() => setPending(true)}>
          <input type="hidden" name="rsvp_id" value={rsvpId} />
          <select
            name="guest_id"
            defaultValue=""
            required
            disabled={pending}
            onChange={(e) => e.currentTarget.form?.requestSubmit()}
            className="rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-[11px] text-neutral-200 outline-none focus:border-neutral-400 disabled:opacity-50"
            aria-label={`Link ${rsvpName}'s RSVP to a guest`}
          >
            <option value="" disabled>
              Link to…
            </option>
            {guests.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
        </form>
      )}

      <form action={createGuestFromRsvp} onSubmit={() => setPending(true)}>
        <input type="hidden" name="rsvp_id" value={rsvpId} />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-neutral-700 px-2.5 py-1 text-[11px] uppercase tracking-[0.15em] text-neutral-200 transition-colors hover:bg-neutral-800 disabled:opacity-50"
        >
          + Add to address book
        </button>
      </form>
    </div>
  );
}
