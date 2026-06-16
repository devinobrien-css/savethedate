"use client";

import { useRef, useState } from "react";
import type { RegistryItem } from "@/lib/registry";
import { createItem, updateItem } from "./actions";

/**
 * Add / edit form for a registry item. Used in two places:
 *  - mode="create" → blank form (the "Add a gift" disclosure)
 *  - mode="edit"   → prefilled from `item` (inside each row's edit disclosure)
 * Both submit to the matching server action.
 */
export default function ItemForm({
  mode,
  item,
}: {
  mode: "create" | "edit";
  item?: RegistryItem;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const action = mode === "create" ? createItem : updateItem;

  const priceValue =
    item?.price_cents != null ? (item.price_cents / 100).toFixed(2) : "";

  // Wrap the server action so we can clear the "Saving…" state once it
  // resolves, surface any save error, and reset the fields after a successful
  // create so the next gift starts from a blank form without a page refresh.
  async function handleAction(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      const result = await action(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (mode === "create") formRef.current?.reset();
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      ref={formRef}
      action={handleAction}
      className="grid gap-4 sm:grid-cols-2"
    >
      {mode === "edit" && <input type="hidden" name="id" value={item!.id} />}

      <Field label="Type">
        <select name="kind" defaultValue={item?.kind ?? "gift"} className={input}>
          <option value="gift">Gift (claimable)</option>
          <option value="fund">Contribute cash toward</option>
        </select>
      </Field>

      <label className="flex items-end gap-2 pb-2 text-sm text-neutral-300">
        <input
          type="checkbox"
          name="is_most_wanted"
          defaultChecked={item?.is_most_wanted ?? false}
          className="h-4 w-4 rounded border-neutral-600 bg-neutral-800"
        />
        Most wanted (♥ badge)
      </label>

      <Field className="sm:col-span-2" label="Title *">
        <input name="title" required defaultValue={item?.title ?? ""} className={input} placeholder="Stand mixer" />
      </Field>

      <Field className="sm:col-span-2" label="Description">
        <textarea
          name="description"
          rows={2}
          defaultValue={item?.description ?? ""}
          className={`${input} resize-none`}
          placeholder="A short note about the gift (optional)"
        />
      </Field>

      <Field label="Store">
        <input name="store_name" defaultValue={item?.store_name ?? ""} className={input} placeholder="Crate & Barrel" />
      </Field>

      <Field label="Price (USD)">
        <input name="price" inputMode="decimal" defaultValue={priceValue} className={input} placeholder="129.00" />
      </Field>

      <Field className="sm:col-span-2" label="Product URL (where to buy)">
        <input name="product_url" type="url" defaultValue={item?.product_url ?? ""} className={input} placeholder="https://…" />
      </Field>

      <Field className="sm:col-span-2" label="Image URL">
        <input name="image_url" type="url" defaultValue={item?.image_url ?? ""} className={input} placeholder="https://… (store image, or a file in /public)" />
      </Field>

      <Field label="Sort order">
        <input name="sort_order" type="number" defaultValue={item?.sort_order ?? 0} className={input} />
      </Field>

      <label className="flex items-end gap-2 pb-2 text-sm text-neutral-300">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={item ? item.is_active : true}
          className="h-4 w-4 rounded border-neutral-600 bg-neutral-800"
        />
        Active (shown on the registry)
      </label>

      <div className="sm:col-span-2 flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-neutral-100 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.2em] text-neutral-900 transition-colors hover:bg-white disabled:opacity-50"
        >
          {pending ? "Saving…" : mode === "create" ? "Add gift" : "Save changes"}
        </button>
        {error && (
          <p className="text-sm text-red-400" role="alert">
            Couldn&apos;t save: {error}
          </p>
        )}
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
