import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import { getSupabase, isSupabaseConfigured, RSVP_TABLE } from "@/lib/supabase";
import { isLocalSmsAvailable } from "@/lib/localSms";
import { getSmsLog, type SmsLogEntry } from "@/lib/smsLog";
import AdminHeader from "../AdminHeader";
import SmsComposer from "./SmsComposer";

export const metadata: Metadata = {
  title: "Devin & Rebecca's Wedding",
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

// One row per send, folded together from the per-recipient log rows.
type Broadcast = {
  id: string;
  body: string;
  at: string;
  sent: number;
  failed: number;
};

function groupBroadcasts(rows: SmsLogEntry[]): Broadcast[] {
  const map = new Map<string, Broadcast>();
  for (const r of rows) {
    const key = r.broadcast_id ?? r.id;
    const b = map.get(key) ?? { id: key, body: r.body, at: r.created_at, sent: 0, failed: 0 };
    if (r.status === "sent") b.sent++;
    else if (r.status === "failed") b.failed++;
    // rows arrive newest-first; keep the most recent timestamp as the send time.
    if (r.created_at > b.at) b.at = r.created_at;
    map.set(key, b);
  }
  return [...map.values()].sort((a, b) => (a.at < b.at ? 1 : -1));
}

export default async function SmsPage() {
  if (!(await isAuthed())) {
    redirect("/admin");
  }

  if (!isSupabaseConfigured()) {
    return (
      <Shell>
        <div className="mx-auto max-w-5xl px-6 py-12">
          <AdminHeader active="sms" />
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
            Supabase isn&apos;t configured. Set <code>SUPABASE_URL</code> and{" "}
            <code>SUPABASE_SERVICE_ROLE_KEY</code>, then run{" "}
            <code>supabase/schema.sql</code> to create the <code>sms_log</code> table
            and the phone columns.
          </p>
        </div>
      </Shell>
    );
  }

  const local = isLocalSmsAvailable();
  const supabase = getSupabase();

  const [{ data: guestRows }, { count: optedOut }, log] = await Promise.all([
    supabase
      .from(RSVP_TABLE)
      .select("id, first_name, last_name, phone")
      .eq("sms_opt_in", true)
      .eq("sms_opted_out", false)
      .not("phone", "is", null)
      .order("first_name", { ascending: true }),
    supabase
      .from(RSVP_TABLE)
      .select("*", { count: "exact", head: true })
      .eq("sms_opted_out", true),
    getSmsLog().catch(() => [] as SmsLogEntry[]),
  ]);

  const guests = (guestRows ?? []).map((r) => ({
    id: r.id as string,
    name: `${r.first_name} ${r.last_name}`.trim(),
    phone: r.phone as string,
  }));
  const reachableCount = guests.length;
  const broadcasts = groupBroadcasts(log);

  return (
    <Shell>
      <div className="mx-auto max-w-5xl px-6 py-12">
        <AdminHeader active="sms" />

        <h1 className="mb-8 font-serif text-2xl">SMS</h1>

        <section className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Stat label="Reachable" value={reachableCount} />
          <Stat label="Opted out" value={optedOut ?? 0} />
          <Stat label="Sends" value={broadcasts.length} />
        </section>

        {local ? (
          <div className="mb-10">
            <SmsComposer guests={guests} />
          </div>
        ) : (
          <div className="mb-10 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
            <p className="font-medium">Sending is available only when you run this admin locally on your Mac.</p>
            <p className="mt-2 text-amber-200/80">
              Texts go out through the Messages app on your Mac, which the deployed
              host can&apos;t reach. To send: pull this repo, run{" "}
              <code>npm run dev</code> on the Mac signed into Messages (with{" "}
              <em>Text Message Forwarding</em> enabled for SMS), and open{" "}
              <code>localhost:3000/admin/sms</code>. The history below stays
              viewable here.
            </p>
          </div>
        )}

        <h2 className="mb-4 text-[11px] uppercase tracking-[0.25em] text-neutral-500">
          Send history
        </h2>

        {broadcasts.length === 0 ? (
          <p className="rounded-lg border border-neutral-800 bg-neutral-900 p-8 text-center text-sm text-neutral-400">
            No texts sent yet. Sends will appear here grouped by message.
          </p>
        ) : (
          <ul className="space-y-3">
            {broadcasts.map((b) => (
              <li
                key={b.id}
                className="rounded-lg border border-neutral-800 bg-neutral-900 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p className="min-w-0 flex-1 text-sm text-neutral-200">{b.body}</p>
                  <span className="whitespace-nowrap text-xs text-neutral-500">
                    {new Date(b.at).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="mt-2 flex gap-2 text-[11px]">
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 font-medium text-emerald-300">
                    {b.sent} sent
                  </span>
                  {b.failed > 0 && (
                    <span className="rounded-full bg-red-500/15 px-2.5 py-0.5 font-medium text-red-300">
                      {b.failed} failed
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
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
