import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  getAdminRegistry,
  formatPrice,
  type AdminRegistryItem,
} from "@/lib/registry";
import AdminHeader from "../AdminHeader";
import ItemForm from "./ItemForm";
import { DeleteItemButton, ReleaseClaimButton } from "./RowActions";

export const metadata: Metadata = {
  title: "Registry Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 font-sans">
      {children}
    </main>
  );
}

export default async function RegistryAdminPage() {
  // Reuse the RSVP dashboard's login: unauthenticated admins go there to sign in.
  if (!(await isAuthed())) {
    redirect("/admin");
  }

  if (!isSupabaseConfigured()) {
    return (
      <Shell>
        <div className="mx-auto max-w-5xl px-6 py-12">
          <AdminHeader active="registry" />
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
            Supabase isn&apos;t configured. Set <code>SUPABASE_URL</code> and{" "}
            <code>SUPABASE_SERVICE_ROLE_KEY</code>, then run{" "}
            <code>supabase/schema.sql</code> to create the registry tables.
          </p>
        </div>
      </Shell>
    );
  }

  let items: AdminRegistryItem[] = [];
  let loadError: string | null = null;
  try {
    items = await getAdminRegistry();
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Failed to load registry.";
  }

  const covered = items.filter((i) => i.claim).length;
  const open = items.filter((i) => i.is_active && !i.claim).length;

  return (
    <Shell>
      <div className="mx-auto max-w-5xl px-6 py-12">
        <AdminHeader active="registry" />

        <h1 className="mb-8 font-serif text-2xl">Registry</h1>

        {loadError && (
          <p className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            Couldn&apos;t load the registry: {loadError}
          </p>
        )}

        <section className="mb-10 grid grid-cols-3 gap-4">
          <Stat label="Gifts" value={items.length} />
          <Stat label="Covered" value={covered} />
          <Stat label="Open" value={open} />
        </section>

        {/* Add a gift */}
        <details className="mb-10 rounded-lg border border-neutral-800 bg-neutral-900/60">
          <summary className="cursor-pointer list-none px-5 py-4 text-sm font-medium uppercase tracking-[0.2em] text-neutral-300 marker:hidden">
            + Add a gift
          </summary>
          <div className="border-t border-neutral-800 p-5">
            <ItemForm mode="create" />
          </div>
        </details>

        {items.length === 0 ? (
          <p className="rounded-lg border border-neutral-800 bg-neutral-900 p-8 text-center text-sm text-neutral-400">
            No gifts yet. Use “Add a gift” above to build the registry.
          </p>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <ItemRow key={item.id} item={item} />
            ))}
          </ul>
        )}
      </div>
    </Shell>
  );
}

function ItemRow({ item }: { item: AdminRegistryItem }) {
  const price = formatPrice(item.price_cents);
  const claim = item.claim;
  const status = claim
    ? claim.status === "confirmed"
      ? { label: "Purchased", cls: "bg-emerald-500/15 text-emerald-300" }
      : { label: "Reserved", cls: "bg-amber-500/15 text-amber-300" }
    : item.is_active
      ? { label: "Open", cls: "bg-neutral-700/40 text-neutral-300" }
      : { label: "Hidden", cls: "bg-neutral-800 text-neutral-500" };

  return (
    <li className="rounded-lg border border-neutral-800 bg-neutral-900">
      <div className="flex flex-wrap items-center gap-4 p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image_url || "/photos/IMG_6786.JPG"}
          alt=""
          className="h-14 w-14 flex-none rounded-md object-cover opacity-90"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium text-neutral-100">{item.title}</span>
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${status.cls}`}>
              {status.label}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-neutral-500">
            {[item.store_name, price].filter(Boolean).join(" · ") || "—"}
          </p>
          {claim && (
            <p className="mt-1 text-xs text-neutral-400">
              {claim.status === "confirmed" ? "Claimed by" : "Pending from"}{" "}
              <span className="text-neutral-200">{claim.claimer_name}</span>{" "}
              <span className="text-neutral-500">({claim.claimer_email})</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {claim && <ReleaseClaimButton claimId={claim.id} itemTitle={item.title} />}
          <DeleteItemButton id={item.id} title={item.title} />
        </div>
      </div>

      {/* Edit disclosure */}
      <details className="border-t border-neutral-800">
        <summary className="cursor-pointer list-none px-4 py-2.5 text-[11px] uppercase tracking-[0.2em] text-neutral-500 transition-colors hover:text-neutral-300 marker:hidden">
          Edit
        </summary>
        <div className="border-t border-neutral-800 p-4">
          <ItemForm mode="edit" item={item} />
        </div>
      </details>
    </li>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5">
      <p className="text-3xl font-semibold text-neutral-100">{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-neutral-500">{label}</p>
    </div>
  );
}
