"use client";

import { useState } from "react";
import { deleteItem, releaseClaim } from "./actions";

/** Delete a registry item (and its claims) after a confirm prompt. */
export function DeleteItemButton({ id, title }: { id: string; title: string }) {
  const [pending, setPending] = useState(false);
  return (
    <form
      action={deleteItem}
      onSubmit={(e) => {
        if (!confirm(`Delete "${title}"? This also removes any claim on it and can't be undone.`)) {
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
      >
        {pending ? "Deleting…" : "Delete"}
      </button>
    </form>
  );
}

/** Release the active claim on an item, freeing it for someone else. */
export function ReleaseClaimButton({
  claimId,
  itemTitle,
}: {
  claimId: string;
  itemTitle: string;
}) {
  const [pending, setPending] = useState(false);
  return (
    <form
      action={releaseClaim}
      onSubmit={(e) => {
        if (!confirm(`Release the claim on "${itemTitle}"? It'll be available to claim again.`)) {
          e.preventDefault();
          return;
        }
        setPending(true);
      }}
    >
      <input type="hidden" name="claim_id" value={claimId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-amber-500/30 px-2.5 py-1 text-[11px] uppercase tracking-[0.15em] text-amber-300 transition-colors hover:bg-amber-500/10 disabled:opacity-50"
      >
        {pending ? "Releasing…" : "Release"}
      </button>
    </form>
  );
}
