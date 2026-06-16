-- ─────────────────────────────────────────────────────────────────────────
--  Migration 0001 — split the address book into PARTIES + GUESTS.
--
--  Before: each `guests` row carried its own address columns + household_label,
--          so a couple stored the same address twice.
--  After:  a `parties` row owns the address + household_label (one envelope);
--          each `guests` row belongs to a party via guests.party_id and keeps
--          only person-level fields (name, email, notes).
--
--  Safe to run once against an existing database. Idempotent: re-running after
--  a successful migration is a no-op (the old columns are already gone, so the
--  guarded backfill block simply skips).
-- ─────────────────────────────────────────────────────────────────────────

-- 1. The new mailing unit.
create table if not exists public.parties (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  household_label text,
  address_line1   text,
  address_line2   text,
  city            text,
  state           text,
  postal_code     text,
  country         text not null default 'USA',
  notes           text
);
alter table public.parties enable row level security;
create index if not exists parties_name_idx on public.parties (household_label);

-- 2. Link guests to a party.
alter table public.guests add column if not exists party_id uuid
  references public.parties(id) on delete cascade;
create index if not exists guests_party_id_idx on public.guests (party_id);

-- 3. Backfill — only runs while the old address columns still exist on guests
--    (i.e. the first time this migration is applied). Guests that already share
--    a non-empty household label + street are merged into a single party;
--    everyone else gets their own one-person party.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'guests'
      and column_name = 'address_line1'
  ) then
    -- A transient key on parties lets us map each created party back to the
    -- guests it came from, then assign party_id. Dropped at the end.
    alter table public.parties add column if not exists migration_key text;

    -- One party per distinct household. The group key merges guests that share
    -- a household label + street; guests without a label stay solo (keyed by id).
    execute $mig$
      insert into public.parties
        (household_label, address_line1, address_line2, city, state, postal_code, country, notes, migration_key)
      -- party.notes is left null; existing per-guest notes stay on the guest.
      select
        max(household_label),
        max(address_line1), max(address_line2), max(city),
        max(state), max(postal_code), coalesce(max(country), 'USA'),
        null::text,
        grp.key
      from (
        select g.*,
          case
            when nullif(btrim(coalesce(g.household_label, '')), '') is not null
                 and nullif(btrim(coalesce(g.address_line1, '')), '') is not null
            then 'hh:' || lower(btrim(g.household_label)) || '|' || lower(btrim(g.address_line1))
            else 'guest:' || g.id::text
          end as key
        from public.guests g
        where g.party_id is null
      ) grp
      group by grp.key
    $mig$;

    -- Attach each guest to its party via the shared key.
    execute $mig$
      update public.guests g
      set party_id = p.id
      from public.parties p
      where p.migration_key = case
        when nullif(btrim(coalesce(g.household_label, '')), '') is not null
             and nullif(btrim(coalesce(g.address_line1, '')), '') is not null
        then 'hh:' || lower(btrim(g.household_label)) || '|' || lower(btrim(g.address_line1))
        else 'guest:' || g.id::text
      end
      and g.party_id is null
    $mig$;

    alter table public.parties drop column if exists migration_key;

    -- 4. Address now lives on the party — drop the moved columns from guests.
    alter table public.guests drop column if exists household_label;
    alter table public.guests drop column if exists address_line1;
    alter table public.guests drop column if exists address_line2;
    alter table public.guests drop column if exists city;
    alter table public.guests drop column if exists state;
    alter table public.guests drop column if exists postal_code;
    alter table public.guests drop column if exists country;
  end if;
end $$;
