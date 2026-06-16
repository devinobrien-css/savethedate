-- ─────────────────────────────────────────────────────────────────────────
--  Migration 0002 — link RSVPs to a PARTY instead of an individual guest.
--
--  Before: rsvps.guest_id pointed at one person.
--  After:  rsvps.party_id points at the household. One person replies for the
--          whole party (party_size is the headcount), so the response belongs
--          to the group.
--
--  Run after 0001_parties.sql. Idempotent: re-running once guest_id is gone is
--  a no-op (the guarded backfill block skips).
-- ─────────────────────────────────────────────────────────────────────────

-- 1. New link column.
alter table public.rsvps add column if not exists party_id uuid
  references public.parties(id) on delete set null;
create index if not exists rsvps_party_id_idx on public.rsvps (party_id);

-- 2. Backfill from the old guest link, then drop it — only while guest_id still
--    exists (the first time this migration runs).
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'rsvps'
      and column_name = 'guest_id'
  ) then
    -- Carry each linked RSVP up to its guest's party.
    execute $mig$
      update public.rsvps r
      set party_id = g.party_id
      from public.guests g
      where r.guest_id = g.id
        and r.party_id is null
        and g.party_id is not null
    $mig$;

    alter table public.rsvps drop column if exists guest_id;
  end if;
end $$;
