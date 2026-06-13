"use client";

import { useEffect, useState } from "react";

type Variant = "v1" | "v2" | "v3";

// Remembers a guest's submitted RSVP across page refreshes (client-only).
const STORAGE_KEY = "std_rsvp";
type SavedRsvp = { firstName: string; attending: "yes" | "no" };

function loadSaved(): SavedRsvp | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedRsvp>;
    if (parsed.attending !== "yes" && parsed.attending !== "no") return null;
    return { firstName: parsed.firstName || "", attending: parsed.attending };
  } catch {
    return null;
  }
}

const themes: Record<
  Variant,
  {
    field: string;
    label: string;
    button: string;
    radioActive: string;
    radioIdle: string;
    success: string;
  }
> = {
  v1: {
    field:
      "border border-v1-mist bg-white/70 focus:border-v1-denim focus:ring-v1-denim/30 rounded-none text-v1-ink placeholder:text-v1-sky/70",
    label: "text-v1-denim uppercase tracking-widest2 text-xs font-sans",
    button:
      "bg-v1-ink text-v1-paper hover:bg-v1-navy tracking-widest2 uppercase text-sm rounded-none",
    radioActive: "bg-v1-ink text-white border-v1-ink",
    radioIdle: "border-v1-mist text-v1-denim hover:border-v1-denim",
    success: "text-v1-navy",
  },
  v2: {
    field:
      "border border-v2-taupe bg-v2-linen focus:border-v2-caramel focus:ring-v2-caramel/30 rounded-lg text-v2-espresso placeholder:text-v2-walnut/50",
    label: "text-v2-walnut uppercase tracking-[0.22em] text-xs font-sans",
    button:
      "bg-v2-walnut text-v2-linen hover:bg-v2-espresso tracking-[0.18em] uppercase text-sm rounded-lg",
    radioActive: "bg-v2-walnut text-v2-linen border-v2-walnut",
    radioIdle: "border-v2-taupe text-v2-walnut hover:border-v2-caramel",
    success: "text-v2-walnut",
  },
  v3: {
    field:
      "border-0 border-b border-v3-powder bg-transparent focus:border-v3-delft focus:ring-0 rounded-none text-v3-ink placeholder:text-v3-periwinkle/60 px-0",
    label: "text-v3-delft uppercase tracking-[0.28em] text-xs font-sans",
    button:
      "bg-v3-delft text-white hover:bg-v3-ink tracking-[0.22em] uppercase text-sm rounded-full",
    radioActive: "bg-v3-delft text-white border-v3-delft",
    radioIdle: "border-v3-powder text-v3-delft hover:border-v3-delft",
    success: "text-v3-delft",
  },
};

type Status = "idle" | "submitting" | "success" | "error";

export default function RSVPForm({ variant }: { variant: Variant }) {
  const t = themes[variant];
  const [attending, setAttending] = useState<"yes" | "no" | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [guests, setGuests] = useState("1");
  const [savedName, setSavedName] = useState("");
  // Gate first paint on the localStorage check so returning guests don't see
  // the empty form flash before their saved confirmation appears.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = loadSaved();
    if (saved) {
      setAttending(saved.attending);
      setSavedName(saved.firstName);
      setStatus("success");
    }
    setReady(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (attending === null || status === "submitting") return;

    const data = new FormData(e.currentTarget);
    data.set("attending", attending);
    data.set("guests", attending === "yes" ? guests : "0");
    data.set("variant", variant);

    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/rsvp", { method: "POST", body: data });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Something went wrong. Please try again.");
      }
      const firstName = String(data.get("firstName") || "");
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ firstName, attending } satisfies SavedRsvp)
        );
      } catch {
        /* storage may be unavailable (private mode) — non-fatal */
      }
      setSavedName(firstName);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  const updateResponse = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* non-fatal */
    }
    setStatus("idle");
    setAttending(null);
    setErrorMsg("");
  };

  const submitted = status === "success";

  const inputBase =
    "w-full px-4 py-3 font-sans text-sm outline-none focus:ring-2 transition-colors";

  // Avoid rendering form vs. confirmation until we've read localStorage.
  // Matches the server-rendered output (ready=false) so there's no hydration mismatch.
  if (!ready) {
    return <div className="py-10" aria-hidden="true" />;
  }

  if (submitted) {
    return (
      <div className="text-center py-10 animate-fade-up">
        <p className={`font-display text-2xl sm:text-3xl ${t.success}`}>
          {attending === "no"
            ? `We'll miss you${savedName ? `, ${savedName}` : ""} — thank you for letting us know.`
            : `Wonderful${savedName ? `, ${savedName}` : ""} — we can't wait to celebrate with you!`}
        </p>
        <p className="mt-3 font-sans text-sm opacity-70">
          Your response has been noted.
        </p>
        <button
          type="button"
          onClick={updateResponse}
          className={`mt-6 font-sans text-xs underline underline-offset-4 opacity-60 transition-opacity hover:opacity-100 ${t.success}`}
        >
          Need to update your response?
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto text-left">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={`block mb-2 ${t.label}`}>First Name</label>
          <input
            required
            name="firstName"
            type="text"
            placeholder="First name"
            className={`${inputBase} ${t.field}`}
          />
        </div>
        <div>
          <label className={`block mb-2 ${t.label}`}>Last Name</label>
          <input
            required
            name="lastName"
            type="text"
            placeholder="Last name"
            className={`${inputBase} ${t.field}`}
          />
        </div>
      </div>

      <div>
        <label className={`block mb-2 ${t.label}`}>Email</label>
        <input
          required
          name="email"
          type="email"
          placeholder="you@example.com"
          className={`${inputBase} ${t.field}`}
        />
      </div>

      <div>
        <label className={`block mb-3 ${t.label}`}>Will you join us?</label>
        <div className="flex gap-3">
          {(["yes", "no"] as const).map((opt) => (
            <button
              type="button"
              key={opt}
              onClick={() => setAttending(opt)}
              className={`flex-1 py-3 border font-sans text-sm tracking-wide transition-colors ${
                attending === opt ? t.radioActive : t.radioIdle
              } ${variant === "v2" ? "rounded-lg" : variant === "v3" ? "rounded-full" : "rounded-none"}`}
            >
              {opt === "yes" ? "Joyfully accepts" : "Regretfully declines"}
            </button>
          ))}
        </div>
      </div>

      {attending === "yes" && (
        <div className="animate-fade-up">
          <label className={`block mb-2 ${t.label}`}>Number in your party</label>
          <select
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className={`${inputBase} ${t.field}`}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className={`block mb-2 ${t.label}`}>A note for the couple (optional)</label>
        <textarea
          name="note"
          rows={3}
          placeholder="Share your excitement, song requests, or well wishes…"
          className={`${inputBase} ${t.field} resize-none`}
        />
      </div>

      {status === "error" && (
        <p className="text-sm font-sans text-red-600/90 text-center" role="alert">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={attending === null || status === "submitting"}
        className={`w-full py-4 font-sans transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${t.button}`}
      >
        {status === "submitting" ? "Sending…" : "Send Response"}
      </button>
    </form>
  );
}
