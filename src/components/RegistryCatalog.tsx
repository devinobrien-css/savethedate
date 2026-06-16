"use client";

import { useMemo, useState } from "react";
import RegistryCard, { type RegistryCardItem } from "@/components/RegistryCard";

/**
 * Public registry catalog: a sort toggle over the gift list, grouped into
 * collapsible price bands. Sorting reorders items *within* each band; the
 * bands themselves always run cheapest → priciest, with unpriced gifts last.
 */

type SortKey = "featured" | "most-wanted" | "price-asc" | "price-desc";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "most-wanted", label: "Most wanted" },
  { key: "price-asc", label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
];

const PRICE_BANDS: { key: string; label: string; match: (cents: number | null) => boolean }[] = [
  { key: "under-100", label: "Under $100", match: (c) => c != null && c < 10000 },
  { key: "100-500", label: "$100 – $500", match: (c) => c != null && c >= 10000 && c <= 50000 },
  { key: "over-500", label: "$500 & up", match: (c) => c != null && c > 50000 },
  { key: "other", label: "Other gifts", match: (c) => c == null },
];

export default function RegistryCatalog({ items }: { items: RegistryCardItem[] }) {
  const [sort, setSort] = useState<SortKey>("price-asc");
  const [query, setQuery] = useState("");
  const [hideClaimed, setHideClaimed] = useState(false);

  // Progress summary always reflects the whole gift list, not the filtered view.
  const total = items.length;
  const claimed = useMemo(() => items.filter((it) => it.claimed).length, [items]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = items.filter((it) => {
      if (hideClaimed && it.claimed) return false;
      if (!q) return true;
      return [it.title, it.description, it.storeName]
        .some((field) => field?.toLowerCase().includes(q));
    });
    const sorted = sortItems(filtered, sort);
    return PRICE_BANDS.map((band) => ({
      ...band,
      items: sorted.filter((it) => band.match(it.priceCents)),
    })).filter((band) => band.items.length > 0);
  }, [items, sort, query, hideClaimed]);

  const noMatches = groups.length === 0;

  return (
    <div>
      <p className="mb-6 text-center text-[11px] uppercase tracking-widest2 text-v1-denim/70">
        {claimed} of {total} {total === 1 ? "gift" : "gifts"} claimed
      </p>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search gifts…"
          className="w-full border border-v1-ink/15 bg-white px-3 py-2 text-sm text-v1-ink outline-none transition-colors duration-300 focus:border-v1-blush sm:max-w-xs"
        />

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <label className="flex items-center gap-2 text-[11px] uppercase tracking-widest2 text-v1-denim">
            <input
              type="checkbox"
              checked={hideClaimed}
              onChange={(e) => setHideClaimed(e.target.checked)}
              className="h-3.5 w-3.5 accent-v1-blush"
            />
            Available only
          </label>

          <div className="flex items-center gap-3">
            <label
              htmlFor="registry-sort"
              className="text-[11px] uppercase tracking-widest2 text-v1-denim/60"
            >
              Sort by
            </label>
            <select
              id="registry-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="border border-v1-ink/15 bg-white px-3 py-1.5 text-[11px] uppercase tracking-widest2 text-v1-denim outline-none transition-colors duration-300 hover:border-v1-blush/70 focus:border-v1-blush"
            >
              {SORTS.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {noMatches ? (
        <p className="py-10 text-center text-sm text-v1-denim/80">
          No gifts match your search.
        </p>
      ) : (
      <div className="space-y-3">
        {groups.map((group) => (
          <details key={group.key} open className="group border-b border-v1-ink/10">
            <summary className="flex cursor-pointer list-none items-center justify-between py-4 [&::-webkit-details-marker]:hidden">
              <span className="text-[11px] uppercase tracking-widest2 text-v1-denim">
                {group.label} <span className="text-v1-denim/50">({group.items.length})</span>
              </span>
              <span
                aria-hidden
                className="text-v1-denim transition-transform duration-300 group-open:rotate-180"
              >
                ↓
              </span>
            </summary>
            <div className="grid gap-6 pb-8 pt-2 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((item) => (
                <RegistryCard key={item.id} item={item} />
              ))}
            </div>
          </details>
        ))}
      </div>
      )}
    </div>
  );
}

/** Sort a copy of the list; unpriced items sink to the end for price sorts. */
function sortItems(items: RegistryCardItem[], sort: SortKey): RegistryCardItem[] {
  if (sort === "featured") return items;
  const copy = [...items];
  if (sort === "most-wanted") {
    // Most-wanted first; otherwise keep the curated order.
    copy.sort((a, b) => Number(b.mostWanted) - Number(a.mostWanted));
    return copy;
  }
  copy.sort((a, b) => {
    const ap = a.priceCents;
    const bp = b.priceCents;
    if (ap == null && bp == null) return 0;
    if (ap == null) return 1;
    if (bp == null) return -1;
    return sort === "price-asc" ? ap - bp : bp - ap;
  });
  return copy;
}
