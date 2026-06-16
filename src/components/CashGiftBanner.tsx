"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "cashGiftBannerDismissed";

/**
 * A quiet, dismissible notice at the top of the registry that points guests to
 * the "Contribute toward" cash-gift section further down the page. Smooth-
 * scrolls to that section on click; stays dismissed for the rest of the
 * browser session so it isn't nagging.
 */
export default function CashGiftBanner() {
  const [show, setShow] = useState(false);

  // Read dismissal after mount to avoid a hydration mismatch.
  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY) !== "1") setShow(true);
  }, []);

  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setShow(false);
  }

  function jump() {
    document
      .getElementById("contribute-toward")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    dismiss();
  }

  if (!show) return null;

  return (
    <div className="mx-auto mt-8 flex max-w-xl items-center justify-between gap-4 border border-v1-blush/50 bg-white/70 px-5 py-3.5">
      <button
        type="button"
        onClick={jump}
        className="text-left text-[11px] uppercase tracking-widest2 text-v1-denim transition-colors hover:text-v1-ink"
      >
        ♥ Prefer to give cash? See our ideas below ↓
      </button>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="shrink-0 text-v1-denim/60 transition-colors hover:text-v1-ink"
      >
        ✕
      </button>
    </div>
  );
}
