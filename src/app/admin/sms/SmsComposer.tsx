"use client";

import { useActionState, useMemo, useState } from "react";
import { sendBroadcast, type SendState } from "./actions";
import { toE164, formatPhone } from "@/lib/phone";

export type Guest = { id: string; name: string; phone: string };

/**
 * Composer for the local SMS sender. Pick which opted-in guests to text (all
 * selected by default), optionally add extra ad-hoc numbers, and broadcast.
 * Checked guest checkboxes submit as `guestId`, resolved to phones server-side.
 */
export default function SmsComposer({ guests }: { guests: Guest[] }) {
  const [state, action, pending] = useActionState<SendState, FormData>(
    sendBroadcast,
    {}
  );
  const [body, setBody] = useState("");
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(guests.map((g) => g.id))
  );
  const [extras, setExtras] = useState<string[]>([]);
  const [extraInput, setExtraInput] = useState("");
  const [extraError, setExtraError] = useState("");

  const chars = body.length;
  const segments = chars === 0 ? 0 : chars <= 160 ? 1 : Math.ceil(chars / 153);
  const recipientCount = useMemo(
    () => selected.size + extras.length,
    [selected, extras]
  );

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const addExtra = () => {
    const e164 = toE164(extraInput);
    if (!e164) {
      setExtraError("Enter a valid US mobile number.");
      return;
    }
    if (extras.includes(e164)) {
      setExtraError("That number is already on the list.");
      return;
    }
    setExtras((prev) => [...prev, e164]);
    setExtraInput("");
    setExtraError("");
  };

  const removeExtra = (n: string) =>
    setExtras((prev) => prev.filter((x) => x !== n));

  return (
    <form action={action} className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-5">
      <label className="block text-[11px] uppercase tracking-[0.2em] text-neutral-400">
        Message
      </label>
      <textarea
        name="body"
        rows={4}
        required
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Hi! A quick reminder — the wedding website has updated directions and the weekend schedule: https://…"
        className="mt-2 w-full resize-none rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2.5 text-sm text-neutral-100 outline-none focus:border-neutral-500"
      />
      <p className="mt-1.5 text-xs text-neutral-500">
        {chars} characters
        {segments > 1 && (
          <span className="text-amber-400/80"> · ~{segments} SMS segments</span>
        )}
        {" · "}
        sent one-by-one from your number
      </p>

      {/* Recipient picker */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <label className="text-[11px] uppercase tracking-[0.2em] text-neutral-400">
            Recipients ({selected.size}/{guests.length} guests)
          </label>
          {guests.length > 0 && (
            <div className="flex gap-3 text-[11px] uppercase tracking-[0.15em]">
              <button
                type="button"
                onClick={() => setSelected(new Set(guests.map((g) => g.id)))}
                className="text-neutral-400 transition-colors hover:text-neutral-100"
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                className="text-neutral-400 transition-colors hover:text-neutral-100"
              >
                None
              </button>
            </div>
          )}
        </div>

        {guests.length === 0 ? (
          <p className="mt-2 rounded-md border border-neutral-800 bg-neutral-950 p-3 text-xs text-neutral-500">
            No opted-in guests yet. You can still text ad-hoc numbers below.
          </p>
        ) : (
          <div className="mt-2 max-h-56 overflow-y-auto rounded-md border border-neutral-800 bg-neutral-950">
            {guests.map((g) => (
              <label
                key={g.id}
                className="flex cursor-pointer items-center gap-3 border-b border-neutral-800/70 px-3 py-2 text-sm last:border-b-0 hover:bg-neutral-900/60"
              >
                <input
                  type="checkbox"
                  name="guestId"
                  value={g.id}
                  checked={selected.has(g.id)}
                  onChange={() => toggle(g.id)}
                  className="h-4 w-4 flex-none accent-neutral-200"
                />
                <span className="flex-1 text-neutral-200">{g.name}</span>
                <span className="text-xs text-neutral-500">{g.phone}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Extra ad-hoc numbers — added one at a time, removable */}
      <div className="mt-5">
        <label className="block text-[11px] uppercase tracking-[0.2em] text-neutral-400">
          Add other numbers (optional)
        </label>
        {/* Submitted to the action as a comma-joined list. */}
        <input type="hidden" name="extraNumbers" value={extras.join(",")} />
        <div className="mt-2 flex gap-2">
          <input
            type="tel"
            value={extraInput}
            onChange={(e) => {
              setExtraInput(e.target.value);
              if (extraError) setExtraError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addExtra();
              }
            }}
            placeholder="(555) 123-4567"
            className="flex-1 rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-500"
          />
          <button
            type="button"
            onClick={addExtra}
            disabled={extraInput.trim() === ""}
            className="rounded-md border border-neutral-700 px-4 py-2 text-xs uppercase tracking-[0.2em] text-neutral-200 transition-colors hover:bg-neutral-800 disabled:opacity-40"
          >
            Add
          </button>
        </div>
        {extraError && (
          <p className="mt-1.5 text-xs text-red-400/90">{extraError}</p>
        )}
        {extras.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {extras.map((n) => (
              <li
                key={n}
                className="flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-950 py-1 pl-3 pr-1.5 text-xs text-neutral-200"
              >
                {formatPhone(n)}
                <button
                  type="button"
                  onClick={() => removeExtra(n)}
                  aria-label={`Remove ${formatPhone(n)}`}
                  className="flex h-4 w-4 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-neutral-200"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-end gap-4">
        <button
          type="submit"
          name="mode"
          value="all"
          disabled={pending || recipientCount === 0}
          onClick={(e) => {
            if (
              !confirm(
                `Send this message to ${recipientCount} recipient${recipientCount === 1 ? "" : "s"}? They'll go out one at a time from your number — keep this tab open until it finishes.`
              )
            ) {
              e.preventDefault();
            }
          }}
          className="rounded-lg bg-neutral-100 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-neutral-900 transition-colors hover:bg-white disabled:opacity-40"
        >
          {pending ? "Sending…" : `Send to ${recipientCount}`}
        </button>
      </div>

      {state.error && (
        <p className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {state.error}
        </p>
      )}
      {state.message && (
        <p
          className={`mt-4 rounded-md border p-3 text-sm ${
            state.ok
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-amber-500/30 bg-amber-500/10 text-amber-200"
          }`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
