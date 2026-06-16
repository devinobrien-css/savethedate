"use client";

import { useState } from "react";
import { deleteGuest, unlinkRsvp } from "./actions";

/** Delete an address book guest (its RSVPs are kept, just unlinked). */
export function DeleteGuestButton({ id, name }: { id: string; name: string }) {
  const [pending, setPending] = useState(false);
  return (
    <form
      action={deleteGuest}
      onSubmit={(e) => {
        if (
          !confirm(
            `Remove ${name} from the address book? Their RSVP (if any) is kept and returns to the unlinked list.`
          )
        ) {
          e.preventDefault();
          return;
        }
        setPending(true);
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-red-500/30 px-2.5 py-1 text-[11px] uppercase tracking-[0.15em] text-red-300 transition-colors hover:bg-red-500/10 disabled:opacity-50"
        aria-label={`Remove ${name} from the address book`}
      >
        {pending ? "Removing…" : "Delete"}
      </button>
    </form>
  );
}

/** Detach a single RSVP from its guest. */
export function UnlinkRsvpButton({ rsvpId, name }: { rsvpId: string; name: string }) {
  const [pending, setPending] = useState(false);
  return (
    <form action={unlinkRsvp} onSubmit={() => setPending(true)}>
      <input type="hidden" name="rsvp_id" value={rsvpId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-neutral-700 px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-neutral-400 transition-colors hover:bg-neutral-800 disabled:opacity-50"
        aria-label={`Unlink ${name}'s RSVP`}
      >
        {pending ? "…" : "Unlink"}
      </button>
    </form>
  );
}
