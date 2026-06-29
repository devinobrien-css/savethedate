"use client";

import type { PartyWithGuests } from "@/lib/guests";
import { createParty, updateParty } from "./actions";
import { ActionForm, Field, input, SubmitButton } from "./formFields";

/**
 * Party (envelope) form. Two modes:
 *  - mode="create" → blank form that creates a party AND its first guest
 *    (a party must contain at least one person). Shows person fields up top.
 *  - mode="edit"   → edits just the household label + mailing address of an
 *    existing party (its people are managed separately on the row).
 */
export default function PartyForm({
  mode,
  party,
}: {
  mode: "create" | "edit";
  party?: PartyWithGuests;
}) {
  const action = mode === "create" ? createParty : updateParty;

  return (
    <ActionForm
      action={action}
      resetOnSuccess={mode === "create"}
      className="grid gap-4 sm:grid-cols-2"
    >
      {mode === "edit" && <input type="hidden" name="id" value={party!.id} />}

      {mode === "create" && (
        <>
          <p className="sm:col-span-2 text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            First guest
          </p>
          <Field label="First name *">
            <input name="first_name" required className={input} placeholder="Jane" />
          </Field>
          <Field label="Last name">
            <input name="last_name" className={input} placeholder="Smith" />
          </Field>
          <Field label="Email">
            <input name="email" type="email" className={input} placeholder="jane@example.com" />
          </Field>
          <div className="hidden sm:block" />
          <p className="sm:col-span-2 mt-2 text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            Household &amp; address
          </p>
        </>
      )}

      <Field className="sm:col-span-2" label="Mailing name (household)">
        <input
          name="household_label"
          defaultValue={party?.household_label ?? ""}
          className={input}
          placeholder="The Smith Family"
        />
      </Field>

      <Field className="sm:col-span-2" label="Address line 1">
        <input name="address_line1" defaultValue={party?.address_line1 ?? ""} className={input} placeholder="123 Main St" />
      </Field>

      <Field className="sm:col-span-2" label="Address line 2">
        <input name="address_line2" defaultValue={party?.address_line2 ?? ""} className={input} placeholder="Apt 4B" />
      </Field>

      <Field label="City">
        <input name="city" defaultValue={party?.city ?? ""} className={input} placeholder="New York" />
      </Field>

      <Field label="State / region">
        <input name="state" defaultValue={party?.state ?? ""} className={input} placeholder="NY" />
      </Field>

      <Field label="Postal code">
        <input name="postal_code" defaultValue={party?.postal_code ?? ""} className={input} placeholder="10036" />
      </Field>

      <Field label="Country">
        <input name="country" defaultValue={party?.country ?? "USA"} className={input} placeholder="USA" />
      </Field>

      <Field className="sm:col-span-2" label="Household note">
        <textarea
          name="notes"
          rows={2}
          defaultValue={party?.notes ?? ""}
          className={`${input} resize-none`}
          placeholder="Anything about this household (e.g. “RSVP'd by phone”) — optional"
        />
      </Field>

      <div className="sm:col-span-2">
        <SubmitButton
          idle={mode === "create" ? "Add party" : "Save address"}
          busy="Saving…"
          className="rounded-lg bg-neutral-100 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.2em] text-neutral-900 transition-colors hover:bg-white disabled:opacity-50"
        />
      </div>
    </ActionForm>
  );
}
