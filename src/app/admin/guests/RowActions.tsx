"use client";

import { useState } from "react";
import { deleteParty, deleteGuest, moveGuest, unlinkRsvp } from "./actions";

/** Up/down arrow to reorder a person within their party. */
export function MoveGuestButton({
  id,
  dir,
  disabled,
}: {
  id: string;
  dir: "up" | "down";
  disabled: boolean;
}) {
  return (
    <form action={moveGuest}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="dir" value={dir} />
      <button
        type="submit"
        disabled={disabled}
        className="rounded-md border border-neutral-700 px-2 py-0.5 text-xs leading-none text-neutral-400 transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-30"
        aria-label={dir === "up" ? "Move up" : "Move down"}
      >
        {dir === "up" ? "↑" : "↓"}
      </button>
    </form>
  );
}

/** Delete a whole party — household + everyone in it (their RSVPs are kept). */
export function DeletePartyButton({ id, label }: { id: string; label: string }) {
  const [pending, setPending] = useState(false);
  return (
    <form
      action={deleteParty}
      onSubmit={(e) => {
        if (
          !confirm(
            `Delete ${label} and everyone in it? Any RSVPs are kept and return to the unlinked list.`
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
        aria-label={`Delete ${label}`}
      >
        {pending ? "Removing…" : "Delete party"}
      </button>
    </form>
  );
}

/** Remove a single person from their party (their RSVP, if any, is kept). */
export function RemovePersonButton({ id, name }: { id: string; name: string }) {
  const [pending, setPending] = useState(false);
  return (
    <form
      action={deleteGuest}
      onSubmit={(e) => {
        if (
          !confirm(
            `Remove ${name} from this party? Their RSVP (if any) is kept and returns to the unlinked list.`
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
        className="rounded-md border border-neutral-700 px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-neutral-400 transition-colors hover:bg-neutral-800 disabled:opacity-50"
        aria-label={`Remove ${name} from this party`}
      >
        {pending ? "…" : "Remove"}
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
