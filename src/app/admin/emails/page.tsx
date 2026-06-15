import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  getEmailLog,
  EMAIL_TYPE_LABELS,
  type EmailLogEntry,
  type EmailType,
} from "@/lib/emailLog";
import AdminHeader from "../AdminHeader";

export const metadata: Metadata = {
  title: "Email Log",
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

export default async function EmailLogPage() {
  // Reuse the RSVP dashboard's login: unauthenticated admins go there to sign in.
  if (!(await isAuthed())) {
    redirect("/admin");
  }

  if (!isSupabaseConfigured()) {
    return (
      <Shell>
        <div className="mx-auto max-w-5xl px-6 py-12">
          <AdminHeader active="emails" />
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
            Supabase isn&apos;t configured. Set <code>SUPABASE_URL</code> and{" "}
            <code>SUPABASE_SERVICE_ROLE_KEY</code>, then run{" "}
            <code>supabase/schema.sql</code> to create the <code>email_log</code> table.
          </p>
        </div>
      </Shell>
    );
  }

  let emails: EmailLogEntry[] = [];
  let loadError: string | null = null;
  try {
    emails = await getEmailLog();
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Failed to load the email log.";
  }

  const sent = emails.filter((e) => e.status === "sent").length;
  const failed = emails.filter((e) => e.status === "failed").length;
  const skipped = emails.filter((e) => e.status === "skipped").length;

  return (
    <Shell>
      <div className="mx-auto max-w-5xl px-6 py-12">
        <AdminHeader active="emails" />

        <h1 className="mb-8 font-serif text-2xl">Email Log</h1>

        {loadError && (
          <p className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            Couldn&apos;t load the email log: {loadError}
          </p>
        )}

        <section className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Total" value={emails.length} />
          <Stat label="Sent" value={sent} />
          <Stat label="Failed" value={failed} />
          <Stat label="Skipped" value={skipped} />
        </section>

        {emails.length === 0 ? (
          <p className="rounded-lg border border-neutral-800 bg-neutral-900 p-8 text-center text-sm text-neutral-400">
            No emails sent yet. RSVP confirmations and registry claim
            verifications will appear here as they go out.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-neutral-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-900 text-[11px] uppercase tracking-wider text-neutral-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Recipient</th>
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Sent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {emails.map((e) => (
                  <tr key={e.id} className="align-top hover:bg-neutral-900/60">
                    <td className="whitespace-nowrap px-4 py-3 text-neutral-300">
                      {EMAIL_TYPE_LABELS[e.type as EmailType] ?? e.type}
                    </td>
                    <td className="px-4 py-3 text-neutral-400">{e.recipient}</td>
                    <td className="max-w-xs px-4 py-3 text-neutral-400">
                      <span className="block truncate">{e.subject || "—"}</span>
                      {e.status === "failed" && e.error && (
                        <span className="mt-1 block text-xs text-red-400/80">
                          {e.error}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={e.status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-neutral-500">
                      {new Date(e.created_at).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
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

function StatusBadge({ status }: { status: EmailLogEntry["status"] }) {
  const cls =
    status === "sent"
      ? "bg-emerald-500/15 text-emerald-300"
      : status === "failed"
        ? "bg-red-500/15 text-red-300"
        : "bg-neutral-700/40 text-neutral-300";
  const label =
    status === "sent" ? "Sent" : status === "failed" ? "Failed" : "Skipped";
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${cls}`}
    >
      {label}
    </span>
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
