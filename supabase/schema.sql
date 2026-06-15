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

-- Optional phone + SMS consent. A guest only gets a stored phone if they tick the
-- "text me updates" box on the RSVP form (sms_opt_in). sms_opted_out is set if they
-- later reply STOP; the admin SMS sender excludes anyone opted out. Phone is E.164.
alter table public.rsvps add column if not exists phone         text;
alter table public.rsvps add column if not exists sms_opt_in    boolean not null default false;
alter table public.rsvps add column if not exists sms_opted_out boolean not null default false;


-- ─────────────────────────────────────────────────────────────────────────
--  REGISTRY — the gift catalog (managed from /admin/registry) and the
--  email-verified "mark as purchased" claims guests leave on /registry.
-- ─────────────────────────────────────────────────────────────────────────

-- The catalog. Edited via the admin dashboard; rendered on /registry.
create table if not exists public.registry_items (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  title        text    not null,
  description  text,
  price_cents  integer,             -- optional; display only, no payment here
  store_name   text,                -- e.g. "Crate & Barrel"
  product_url  text,                -- external "buy it here" link
  image_url    text,                -- a URL (store image or a file in /public)
  sort_order   integer not null default 0,
  is_active    boolean not null default true
);

-- Mark-as-purchased claims. A claim is created `pending` and becomes
-- `confirmed` once the guest clicks the verification link we email them;
-- `released` frees the item again (guest changed their mind, or admin reset).
create table if not exists public.registry_claims (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  item_id       uuid not null references public.registry_items(id) on delete cascade,
  claimer_name  text not null,
  claimer_email text not null,
  status        text not null default 'pending',  -- pending | confirmed | released
  confirmed_at  timestamptz,
  released_at   timestamptz
);

-- Same posture as rsvps: RLS on, no public policies. All access is server-side
-- via the service-role key, so the public anon key can neither read nor write.
alter table public.registry_items  enable row level security;
alter table public.registry_claims enable row level security;

create index if not exists registry_items_sort_idx
  on public.registry_items (sort_order, created_at);
create index if not exists registry_claims_item_idx
  on public.registry_claims (item_id);

-- At most ONE active (non-released) claim per item. This is the lock that makes
-- the qty=1 model safe: two guests submitting at the same moment can't both
-- reserve the same gift — the second insert hits this index and is rejected.
create unique index if not exists registry_one_active_claim
  on public.registry_claims (item_id)
  where status <> 'released';


-- ─────────────────────────────────────────────────────────────────────────
--  EMAIL LOG — an audit trail of every transactional email the app attempts
--  to send (RSVP confirmations, registry claim verifications, …). Viewed from
--  /admin/emails. Writes are best-effort: a logging failure never blocks mail.
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists public.email_log (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  type         text not null,         -- 'rsvp_confirmation' | 'registry_claim' | …
  recipient    text not null,
  subject      text,
  status       text not null,         -- 'sent' | 'failed' | 'skipped'
  provider_id  text,                  -- Resend message id, when sent
  error        text                   -- failure reason, when status = 'failed'
);

-- Same posture as the other tables: RLS on, no public policies. All access is
-- server-side via the service-role key.
alter table public.email_log enable row level security;

create index if not exists email_log_created_at_idx
  on public.email_log (created_at desc);


-- ─────────────────────────────────────────────────────────────────────────
--  SMS LOG — an audit trail of texts sent from the local admin SMS sender
--  (/admin/sms, which drives the Mac's Messages app). Rows are grouped by
--  broadcast_id so one "send" shows as a batch with per-recipient outcomes.
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists public.sms_log (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  recipient     text not null,          -- E.164
  body          text not null,
  status        text not null,          -- 'sent' | 'failed' | 'skipped'
  error         text,                   -- failure reason, when status = 'failed'
  broadcast_id  uuid                    -- groups the messages of one send
);

-- Same posture as the other tables: RLS on, no public policies. All access is
-- server-side via the service-role key.
alter table public.sms_log enable row level security;

create index if not exists sms_log_created_at_idx
  on public.sms_log (created_at desc);
create index if not exists sms_log_broadcast_idx
  on public.sms_log (broadcast_id);
