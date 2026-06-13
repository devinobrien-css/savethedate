-- ─────────────────────────────────────────────────────────────────────────
--  RSVP storage — run this once in the Supabase SQL editor.
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists public.rsvps (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  first_name  text    not null,
  last_name   text    not null,
  email       text    not null,
  attending   boolean not null,
  party_size  integer not null default 0,
  note        text
);

-- Enable Row Level Security and add NO public policies. The app reaches the
-- table only from the server using the service-role key, which bypasses RLS.
-- This keeps the data unreadable/unwritable by the public anon key.
alter table public.rsvps enable row level security;

create index if not exists rsvps_created_at_idx on public.rsvps (created_at desc);

-- One response per email. Emails are stored normalized (lowercased) by the app,
-- so a repeat submission upserts (updates) the guest's existing row instead of
-- creating a duplicate. Doubles as the ON CONFLICT target for that upsert.
create unique index if not exists rsvps_email_unique on public.rsvps (email);
