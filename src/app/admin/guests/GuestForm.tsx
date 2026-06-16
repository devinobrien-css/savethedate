"use client";

import { useState } from "react";
import type { Guest } from "@/lib/guests";
import { createGuest, updateGuest } from "./actions";

/**
 * Add / edit form for an address book guest. Used in two places:
 *  - mode="create" → blank form (the "Add a guest" disclosure)
 *  - mode="edit"   → prefilled from `guest` (inside each row's edit disclosure)
 * Both submit to the matching server action.
 */
export default function GuestForm({
  mode,
  guest,
}: {
  mode: "create" | "edit";
  guest?: Guest;
}) {
  const [pending, setPending] = useState(false);
  const action = mode === "create" ? createGuest : updateGuest;

  return (
    <form
      action={action}
      onSubmit={() => setPending(true)}
      className="grid gap-4 sm:grid-cols-2"
    >
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

      <Field label="Mailing name (household)">
        <input name="household_label" defaultValue={guest?.household_label ?? ""} className={input} placeholder="The Smith Family" />
      </Field>

      <Field className="sm:col-span-2" label="Address line 1">
        <input name="address_line1" defaultValue={guest?.address_line1 ?? ""} className={input} placeholder="123 Main St" />
      </Field>

      <Field className="sm:col-span-2" label="Address line 2">
        <input name="address_line2" defaultValue={guest?.address_line2 ?? ""} className={input} placeholder="Apt 4B" />
      </Field>

      <Field label="City">
        <input name="city" defaultValue={guest?.city ?? ""} className={input} placeholder="New York" />
      </Field>

      <Field label="State / region">
        <input name="state" defaultValue={guest?.state ?? ""} className={input} placeholder="NY" />
      </Field>

      <Field label="Postal code">
        <input name="postal_code" defaultValue={guest?.postal_code ?? ""} className={input} placeholder="10036" />
      </Field>

      <Field label="Country">
        <input name="country" defaultValue={guest?.country ?? "USA"} className={input} placeholder="USA" />
      </Field>

      <Field className="sm:col-span-2" label="Notes">
        <textarea
          name="notes"
          rows={2}
          defaultValue={guest?.notes ?? ""}
          className={`${input} resize-none`}
          placeholder="Anything to remember (dietary, plus-ones, etc.) — optional"
        />
      </Field>

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-neutral-100 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.2em] text-neutral-900 transition-colors hover:bg-white disabled:opacity-50"
        >
          {pending ? "Saving…" : mode === "create" ? "Add guest" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

const input =
  "w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-400";

function Field({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[11px] uppercase tracking-[0.2em] text-neutral-400">
        {label}
      </span>
      {children}
    </label>
  );
}
