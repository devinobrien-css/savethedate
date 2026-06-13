"use client";

import { useState } from "react";
import { deleteRsvp } from "./actions";

export default function DeleteRsvpButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const [pending, setPending] = useState(false);

  return (
    <form
      action={deleteRsvp}
      onSubmit={(e) => {
        if (!confirm(`Delete the RSVP from ${name}? This can't be undone.`)) {
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
        aria-label={`Delete RSVP from ${name}`}
      >
        {pending ? "Deleting…" : "Delete"}
      </button>
    </form>
  );
}
