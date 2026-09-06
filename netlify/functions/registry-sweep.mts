/**
 * Daily registry sweep (Netlify scheduled function).
 *
 * Netlify can only schedule its own functions, not Next.js route handlers, so
 * this is a thin trigger: it calls /api/cron/registry — where the actual work
 * lives, alongside the Supabase client and email templates — and passes the
 * shared secret. Netlify does not add an Authorization header of its own, so we
 * set it here from CRON_SECRET; the route rejects anything else.
 *
 * Scheduled functions aren't publicly reachable over HTTP, so the only way in
 * from outside is the Next route, which stays secret-gated.
 *
 * Runs well inside the execution limit: the sweep sends at most a handful of
 * reminders (one per unconfirmed claim in its 24h window) per day.
 *
 * Schedule is UTC. "0 9 * * *" — daily at 09:00 UTC.
 */

export default async () => {
  const secret = process.env.CRON_SECRET;
  const base = (process.env.SITE_URL || process.env.URL || "").replace(/\/+$/, "");

  if (!secret) {
    console.error("registry-sweep: CRON_SECRET is not set — skipping.");
    return new Response("CRON_SECRET is not set", { status: 503 });
  }
  if (!base) {
    console.error("registry-sweep: no SITE_URL or URL to call — skipping.");
    return new Response("No site URL available", { status: 503 });
  }

  const res = await fetch(`${base}/api/cron/registry`, {
    headers: { authorization: `Bearer ${secret}` },
  });
  const body = await res.text();

  // Surfaces in the Netlify function log, so a failing sweep is visible.
  console.log(`registry-sweep: ${res.status} ${body}`);

  return new Response(body, {
    status: res.status,
    headers: { "content-type": "application/json" },
  });
};

export const config = { schedule: "0 9 * * *" };
