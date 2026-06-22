-- ============================================================
-- Run this ONCE in Supabase → SQL Editor → New query → RUN.
--
-- Your tables exist, but Supabase's API layer (PostgREST) has a
-- stale "schema cache" and can't see them for reads/writes yet.
-- This single command forces it to reload. Takes ~2 seconds.
-- ============================================================
notify pgrst, 'reload schema';