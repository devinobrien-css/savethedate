"use client";

import type { Guest } from "@/lib/guests";
import { addGuest, updateGuest } from "./actions";
import { ActionForm, Field, input, SubmitButton } from "./formFields";

/**
 * Person (guest) form. Two modes:
 *  - mode="add"  → adds a new person to a party (needs party_id).
 *  - mode="edit" → edits an existing person (needs the guest's id).
 * A person carries only name / email / note; the address lives on the party.
 */
export default function PersonForm({
  mode,
  partyId,
  guest,
  compact = false,
}: {
  mode: "add" | "edit";
  partyId?: string;
  guest?: Guest;
  compact?: boolean;
}) {
  const action = mode === "add" ? addGuest : updateGuest;

  return (
    <ActionForm
      action={action}
      resetOnSuccess={mode === "add"}
      className="grid gap-3 sm:grid-cols-2"
    >
      {mode === "add" && <input type="hidden" name="party_id" value={partyId} />}
      {mode === "edit" && <input type="hidden" name="id" value={guest!.id} />}

      <Field label="First name *">
        <input name="first_name" required defaultValue={guest?.first_name ?? ""} className={input} placeholder="Jane" />
      </Field>

      <Field label="Last name">
        <input name="last_name" defaultValue={guest?.last_name ?? ""} className={input} placeholder="Smith" />
      </Field>

      <Field label="Email">
        <input name="email" type="email" defaultValue={guest?.email ?? ""} className={input} placeholder="jane@example.com" />
      </Field>

      <Field label="Note (dietary, plus-one…)">
        <input name="notes" defaultValue={guest?.notes ?? ""} className={input} placeholder="Vegetarian" />
      </Field>

      <div className="sm:col-span-2">
        <SubmitButton
          idle={mode === "add" ? "Add person" : "Save changes"}
          busy="Saving…"
          className={
            compact
              ? "rounded-lg border border-neutral-700 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-200 transition-colors hover:bg-neutral-800 disabled:opacity-50"
              : "rounded-lg bg-neutral-100 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.2em] text-neutral-900 transition-colors hover:bg-white disabled:opacity-50"
          }
        />
      </div>
    </ActionForm>
  );
}
