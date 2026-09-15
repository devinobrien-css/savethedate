-- ─────────────────────────────────────────────────────────────────────────
--  Migration 0006 — allergies / dietary restrictions + room-block request.
--
--  dietary       — free text from the "Allergies or dietary restrictions"
--                  field. Covers the whole party (one person replies for the
--                  household), so guests are asked to say who each restriction
--                  applies to. Null when blank.
--  room_request  — the guest ticked "reserve a room for me in the room block".
--                  A request, not a booking: we follow up by hand.
-- ─────────────────────────────────────────────────────────────────────────

alter table public.rsvps add column if not exists dietary      text;
alter table public.rsvps add column if not exists room_request boolean not null default false;
