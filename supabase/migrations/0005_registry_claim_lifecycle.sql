-- ─────────────────────────────────────────────────────────────────────────
--  Migration 0005 — pending-claim lifecycle.
--
--  A claim that is never confirmed used to hold its gift forever (a typo'd
--  email locked the item until an admin released it by hand). Pending claims
--  now expire after 72h, with one reminder emailed at ~48h.
--
--  Adds:
--    released_reason   — why a claim left the active set, so the confirm page
--                        can tell "you released this" from "this timed out".
--                        'guest' | 'admin' | 'expired' | 'unsent' | null
--    reminder_sent_at  — when the one-and-only nudge went out. Doubles as the
--                        idempotency guard: a re-run can't send twice.
--
--  Idempotent: add columns if not exists.
-- ─────────────────────────────────────────────────────────────────────────

alter table public.registry_claims add column if not exists released_reason  text;
alter table public.registry_claims add column if not exists reminder_sent_at timestamptz;

-- The cron sweep looks up pending claims by age; the partial index keeps that
-- scan off the confirmed/released rows, which are the bulk of the table.
create index if not exists registry_claims_pending_age_idx
  on public.registry_claims (created_at)
  where status = 'pending';
