"use client";

import { useState } from "react";

export type RegistryCardItem = {
  id: string;
  title: string;
  description: string | null;
  priceLabel: string | null;
  storeName: string | null;
  productUrl: string | null;
  imageUrl: string | null;
  claimed: boolean;
};

type Status = "idle" | "form" | "submitting" | "success" | "error";

/**
 * A single gift on the public registry. Covered items show a quiet badge;
 * open items expand an inline name/email form that POSTs to the claim API.
 * On success we tell the guest to check their email — the claim stays pending
 * until they click the verification link.
 */
export default function RegistryCard({ item }: { item: RegistryCardItem }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    data.set("itemId", item.id);
    setStatus("submitting");
    setError("");
    try {
      const res = await fetch("/api/registry/claim", { method: "POST", body: data });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Something went wrong. Please try again.");
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const covered = item.claimed;

  return (
    <div className="flex flex-col border border-v1-ink/15 bg-white">
      {item.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.imageUrl}
          alt=""
          className={`aspect-[4/3] w-full object-cover ${covered ? "opacity-50 grayscale" : ""}`}
        />
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl leading-snug text-v1-ink">{item.title}</h3>
          {item.priceLabel && (
            <span className="mt-1 shrink-0 text-sm text-v1-denim">{item.priceLabel}</span>
          )}
        </div>

        {item.storeName && (
          <p className="mt-1 text-[10px] uppercase tracking-widest2 text-v1-denim">
            {item.storeName}
          </p>
        )}
        {item.description && (
          <p className="mt-3 text-sm leading-relaxed text-v1-denim/80">{item.description}</p>
        )}

        <div className="mt-5 flex-1" />

        {/* Buy link */}
        {item.productUrl && (
          <a
            href={item.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-3 text-[11px] uppercase tracking-widest2 text-v1-blush underline underline-offset-4 transition-opacity hover:opacity-70"
          >
            View it →
          </a>
        )}

        {/* Claim area */}
        {covered ? (
          <p className="border-t border-v1-ink/10 pt-3 text-[11px] uppercase tracking-widest2 text-v1-denim/70">
            ✓ Already covered
          </p>
        ) : status === "success" ? (
          <p className="border-t border-v1-ink/10 pt-3 text-sm text-v1-navy">
            Almost there — check your email to confirm your gift.
          </p>
        ) : status === "idle" ? (
          <button
            type="button"
            onClick={() => setStatus("form")}
            className="border border-v1-blush/70 bg-transparent px-5 py-2.5 text-[11px] uppercase tracking-widest2 text-v1-blush transition-colors duration-300 hover:bg-v1-blush hover:text-v1-ink"
          >
            I&apos;ll get this
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 border-t border-v1-ink/10 pt-4">
            {/* Honeypot — hidden from people, tempting to bots. */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
            />
            <input
              required
              name="name"
              type="text"
              placeholder="Your name"
              className="w-full border border-v1-mist bg-white px-3 py-2.5 text-sm text-v1-ink outline-none focus:border-v1-denim"
            />
            <input
              required
              name="email"
              type="email"
              placeholder="you@example.com"
              className="w-full border border-v1-mist bg-white px-3 py-2.5 text-sm text-v1-ink outline-none focus:border-v1-denim"
            />
            {status === "error" && (
              <p className="text-sm text-red-600/90" role="alert">
                {error}
              </p>
            )}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={status === "submitting"}
                className="bg-v1-blush px-5 py-2.5 text-[11px] uppercase tracking-widest2 text-v1-ink transition-colors duration-300 hover:bg-v1-ink hover:text-v1-blush disabled:opacity-50"
              >
                {status === "submitting" ? "Sending…" : "Confirm by email"}
              </button>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="text-[11px] uppercase tracking-widest2 text-v1-denim transition-colors hover:text-v1-ink"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
