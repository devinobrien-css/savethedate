"use client";

import { useState, useTransition } from "react";
import type { RSVP } from "@/lib/supabase";
import { updateRsvp } from "./actions";
import { Field, input } from "./guests/formFields";
import DeleteRsvpButton from "./DeleteRsvpButton";

/**
 * One RSVP in the admin table, with an inline edit form that expands in a
 * full-width row beneath it. `received` is formatted on the server so the
 * date doesn't shift between server and browser time zones.
 */
export default function RsvpRow({ r, received }: { r: RSVP; received: string }) {
  const [editing, setEditing] = useState(false);
  const name = `${r.first_name} ${r.last_name}`;

  return (
    <>
      <tr className="hover:bg-neutral-900/60">
        <td className="px-4 py-3 font-medium text-neutral-100">{name}</td>
        <td className="px-4 py-3 text-neutral-400">{r.email}</td>
        <td className="px-4 py-3">
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
              r.attending
                ? "bg-emerald-500/15 text-emerald-300"
                : "bg-neutral-700/40 text-neutral-300"
            }`}
          >
            {r.attending ? "Accepts" : "Declines"}
          </span>
        </td>
        <td className="px-4 py-3 text-neutral-300">
          {r.attending ? r.party_size : "—"}
        </td>
        <td className="px-4 py-3 text-neutral-300">
          {r.attending && r.room_request ? "Requested" : "—"}
        </td>
        <td className="max-w-xs px-4 py-3 text-neutral-400">
          {r.attending && r.dietary ? r.dietary : "—"}
        </td>
        <td className="max-w-xs px-4 py-3 text-neutral-400">{r.note || "—"}</td>
        <td className="whitespace-nowrap px-4 py-3 text-neutral-500">{received}</td>
        <td className="px-4 py-3">
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              className="rounded-md border border-neutral-700 px-2.5 py-1 text-[11px] uppercase tracking-[0.15em] text-neutral-300 transition-colors hover:bg-neutral-800"
              aria-expanded={editing}
              aria-label={`Edit RSVP from ${name}`}
            >
              {editing ? "Close" : "Edit"}
            </button>
            <DeleteRsvpButton id={r.id} name={name} />
          </div>
        </td>
      </tr>
      {editing && (
        <tr className="bg-neutral-900/60">
          <td colSpan={9} className="px-4 py-5">
            <EditRsvpForm r={r} onDone={() => setEditing(false)} />
          </td>
        </tr>
      )}
    </>
  );
}

function EditRsvpForm({ r, onDone }: { r: RSVP; onDone: () => void }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [attending, setAttending] = useState(r.attending);

  return (
    <form
      className="grid max-w-3xl gap-4 sm:grid-cols-2"
      action={(formData) =>
        startTransition(async () => {
          const result = await updateRsvp(formData);
          if (result.error) {
            setError(result.error);
          } else {
            setError(null);
            onDone();
          }
        })
      }
    >
      <input type="hidden" name="id" value={r.id} />

      <Field label="First name *">
        <input name="first_name" required defaultValue={r.first_name} className={input} />
      </Field>
      <Field label="Last name *">
        <input name="last_name" required defaultValue={r.last_name} className={input} />
      </Field>

      <Field label="Email *">
        <input name="email" type="email" required defaultValue={r.email} className={input} />
      </Field>
      <Field label="Reply">
        <select
          name="attending"
          value={attending ? "yes" : "no"}
          onChange={(e) => setAttending(e.target.value === "yes")}
          className={input}
        >
          <option value="yes">Accepts</option>
          <option value="no">Declines</option>
        </select>
      </Field>

      {attending && (
        <>
          <Field label="Party size">
            <input
              name="party_size"
              type="number"
              min={1}
              max={20}
              defaultValue={Math.max(1, r.party_size)}
              className={input}
            />
          </Field>
          <label className="flex items-center gap-2 self-end pb-2 text-sm text-neutral-300">
            <input
              name="room_request"
              type="checkbox"
              defaultChecked={r.room_request}
              className="h-4 w-4 accent-neutral-200"
            />
            Room requested
          </label>

          <Field className="sm:col-span-2" label="Dietary">
            <input name="dietary" defaultValue={r.dietary ?? ""} className={input} />
          </Field>
        </>
      )}

      <Field className="sm:col-span-2" label="Note">
        <textarea
          name="note"
          rows={2}
          defaultValue={r.note ?? ""}
          className={`${input} resize-none`}
        />
      </Field>

      <div className="flex items-center gap-3 sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-neutral-100 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.2em] text-neutral-900 transition-colors hover:bg-white disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="px-3 py-2.5 text-xs uppercase tracking-[0.2em] text-neutral-400 transition-colors hover:text-neutral-200"
        >
          Cancel
        </button>
        {error && <p className="text-sm text-red-300">{error}</p>}
      </div>
    </form>
  );
}
