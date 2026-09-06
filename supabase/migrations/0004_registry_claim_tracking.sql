-- ─────────────────────────────────────────────────────────────────────────
--  Migration 0004 — let gifters optionally share a tracking number/link.
--
--  Adds registry_claims.tracking. Because gifts ship to the couple's apartment
--  (where delivery pings go to the gifter's account, not theirs), the confirm
--  page invites the gifter to drop a tracking link so the couple can grab the
--  package before it wanders off. Optional — null when not provided.
--
--  Idempotent: add column if not exists.
-- ─────────────────────────────────────────────────────────────────────────

alter table public.registry_claims add column if not exists tracking text;
