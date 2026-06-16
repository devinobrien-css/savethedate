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
--  PARTIES & GUESTS / ADDRESS BOOK — the mailing list the couple curates by
--  hand, managed from /admin/guests. The mailing unit is the *party* (one
--  envelope: a household label + a single address). Each party contains one or
--  more *guests* (the named people). Submitted RSVPs are linked back to an
--  individual guest via rsvps.guest_id so a response can be matched to a person
--  and, through them, to the address it came from.
--
--  NOTE: a party owns the address; a guest owns only person-level fields. If
--  you have an existing database from before this split (guests carried their
--  own address columns), run supabase/migrations/0001_parties.sql to migrate.
-- ─────────────────────────────────────────────────────────────────────────

-- A party = one envelope. The household label + address that a save-the-date
-- or invitation is mailed to.
create table if not exists public.parties (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  household_label text,                  -- e.g. "The Smith Family" (mailing name)
  address_line1   text,
  address_line2   text,
  city            text,
  state           text,
  postal_code     text,
  country         text not null default 'USA',
  notes           text                   -- household-level note (e.g. "RSVP'd by phone")
);

-- The named people. Each belongs to exactly one party; deleting a party
-- removes its guests (their RSVPs survive — see rsvps.guest_id below).
create table if not exists public.guests (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  party_id        uuid references public.parties(id) on delete cascade,
  first_name      text not null,
  last_name       text,
  email           text,                 -- used to auto-suggest RSVP matches
  notes           text                  -- person-level note (e.g. dietary, plus-one)
);

-- Same posture as the other tables: RLS on, no public policies. All access is
-- server-side via the service-role key.
alter table public.parties enable row level security;
alter table public.guests  enable row level security;

create index if not exists guests_name_idx     on public.guests (last_name, first_name);
create index if not exists guests_email_idx    on public.guests (email);
create index if not exists guests_party_id_idx  on public.guests (party_id);
create index if not exists parties_name_idx     on public.parties (household_label);

-- Link a submitted RSVP to a party (the household it belongs to). One person
-- replies for the whole party — party_size carries the headcount — so the
-- response attaches to the group, not an individual. ON DELETE SET NULL so
-- deleting a party simply unlinks its RSVPs (it never deletes a guest's actual
-- response). The RSVP upsert (by email) doesn't touch this column, so a guest
-- editing their reply keeps their link.
alter table public.rsvps add column if not exists party_id uuid
  references public.parties(id) on delete set null;
create index if not exists rsvps_party_id_idx on public.rsvps (party_id);


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

-- `gift`  → a normal registry item (price band + email-verified claim flow).
-- `fund`  → a "contribute cash toward" card: a sweet description of something
--           guests can put cash/check toward. No price, no claim — purely a
--           prompt for what a money gift goes to. `is_most_wanted` surfaces a
--           ❤ badge and an optional sort on the public page.
alter table public.registry_items add column if not exists kind text not null default 'gift';
alter table public.registry_items add column if not exists is_most_wanted boolean not null default false;

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

-- Optional note the gifter leaves with their claim (e.g. "Can't wait to
-- celebrate!"). Shown to the couple in the admin registry view.
alter table public.registry_claims add column if not exists note text;

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
