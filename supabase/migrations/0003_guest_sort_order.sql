-- ─────────────────────────────────────────────────────────────────────────
--  Migration 0003 — let guests be ordered within their party.
--
--  Adds guests.sort_order. Guests are listed by (sort_order, last_name,
--  first_name), so the couple can put the primary contact first, etc. Existing
--  rows default to 0 and fall back to name order until first reordered.
--
--  Idempotent: add column if not exists.
-- ─────────────────────────────────────────────────────────────────────────

alter table public.guests add column if not exists sort_order integer not null default 0;

-- Seed a stable starting order per party from the current name sort, so the
-- first up/down move has something sensible to nudge.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'guests'
      and column_name = 'sort_order'
  ) then
    execute $mig$
      update public.guests g
      set sort_order = ranked.rn
      from (
        select id,
               row_number() over (
                 partition by party_id
                 order by last_name nulls last, first_name nulls last, created_at
               ) - 1 as rn
        from public.guests
      ) ranked
      where ranked.id = g.id
        and g.sort_order = 0
    $mig$;
  end if;
end $$;
