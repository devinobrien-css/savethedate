import type { Metadata } from "next";
import { isAuthed, isAdminPasswordConfigured } from "@/lib/auth";
import {
  getSupabase,
  isSupabaseConfigured,
  RSVP_TABLE,
  type RSVP,
} from "@/lib/supabase";
import { wedding } from "@/config/site";
import LoginForm from "./LoginForm";
import DeleteRsvpButton from "./DeleteRsvpButton";
import { logout } from "./actions";

export const metadata: Metadata = {
  title: "RSVP Admin",
  robots: { index: false, follow: false },
};

// Always render dynamically — depends on the auth cookie + live data.
export const dynamic = "force-dynamic";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 font-sans">
      {children}
    </main>
  );
}

export default async function AdminPage() {
  const authed = await isAuthed();

  if (!authed) {
    return (
      <Shell>
        <div className="flex min-h-screen flex-col items-center justify-center px-6">
          <p className="mb-2 text-[11px] uppercase tracking-[0.35em] text-neutral-500">
            {wedding.partnerA} &amp; {wedding.partnerB}
          </p>
          <h1 className="mb-8 font-serif text-3xl">RSVP Dashboard</h1>
          <LoginForm />
          {!isAdminPasswordConfigured() && (
            <p className="mt-6 max-w-sm text-center text-xs text-amber-400/80">
              Heads up: <code>ADMIN_PASSWORD</code> isn&apos;t set yet, so login
              will fail. Add it to your environment (see <code>.env.example</code>).
            </p>
          )}
        </div>
      </Shell>
    );
  }

  // ── Authed: load RSVPs ───────────────────────────────────────────────
  if (!isSupabaseConfigured()) {
    return (
      <Shell>
        <div className="mx-auto max-w-2xl px-6 py-20">
          <h1 className="mb-4 font-serif text-3xl">RSVP Dashboard</h1>
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
            Supabase isn&apos;t configured. Set <code>SUPABASE_URL</code> and{" "}
            <code>SUPABASE_SERVICE_ROLE_KEY</code> (see <code>.env.example</code>),
            then create the <code>rsvps</code> table from <code>supabase/schema.sql</code>.
          </p>
          <LogoutButton />
        </div>
      </Shell>
    );
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from(RSVP_TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  const rsvps = (data ?? []) as RSVP[];
  const attending = rsvps.filter((r) => r.attending);
  const declined = rsvps.filter((r) => !r.attending);
  const totalGuests = attending.reduce((sum, r) => sum + (r.party_size || 0), 0);

  return (
    <Shell>
      <div className="mx-auto max-w-5xl px-6 py-12">
        <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-neutral-500">
              {wedding.partnerA} &amp; {wedding.partnerB} · {wedding.weddingDateLabel}
            </p>
            <h1 className="mt-2 font-serif text-3xl">RSVP Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/api/admin/export"
              className="rounded-lg border border-neutral-700 px-4 py-2 text-xs uppercase tracking-[0.2em] text-neutral-200 transition-colors hover:bg-neutral-800"
            >
              Export CSV
            </a>
            <LogoutButton />
          </div>
        </header>

        {error && (
          <p className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            Couldn&apos;t load RSVPs: {error.message}
          </p>
        )}

        <section className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Responses" value={rsvps.length} />
          <Stat label="Accepting" value={attending.length} />
          <Stat label="Declining" value={declined.length} />
          <Stat label="Total guests" value={totalGuests} />
        </section>

        {rsvps.length === 0 ? (
          <p className="rounded-lg border border-neutral-800 bg-neutral-900 p-8 text-center text-sm text-neutral-400">
            No responses yet. Submissions from the RSVP form will appear here.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-neutral-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-900 text-[11px] uppercase tracking-wider text-neutral-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Reply</th>
                  <th className="px-4 py-3 font-medium">Party</th>
                  <th className="px-4 py-3 font-medium">Note</th>
                  <th className="px-4 py-3 font-medium">Received</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {rsvps.map((r) => (
                  <tr key={r.id} className="hover:bg-neutral-900/60">
                    <td className="px-4 py-3 font-medium text-neutral-100">
                      {r.first_name} {r.last_name}
                    </td>
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
                    <td className="max-w-xs px-4 py-3 text-neutral-400">
                      {r.note || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-neutral-500">
                      {new Date(r.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <DeleteRsvpButton
                          id={r.id}
                          name={`${r.first_name} ${r.last_name}`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Shell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5">
      <p className="text-3xl font-semibold text-neutral-100">{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-neutral-500">
        {label}
      </p>
    </div>
  );
}

function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="rounded-lg border border-neutral-700 px-4 py-2 text-xs uppercase tracking-[0.2em] text-neutral-200 transition-colors hover:bg-neutral-800"
      >
        Sign out
      </button>
    </form>
  );
}
