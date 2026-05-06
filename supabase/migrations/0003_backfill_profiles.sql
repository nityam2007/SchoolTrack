-- Backfill / re-sync public.profiles from auth.users.
--
-- RLS policies on every tenant table call current_role() / current_school_id(),
-- which read from public.profiles keyed by auth.uid(). If a user's profile row
-- is missing or stale (older than the latest seed-users.mjs run), those
-- functions return NULL and EVERY write fails with:
--   "new row violates row-level security policy for table '<x>'"
--
-- This migration is idempotent — safe to run any number of times.

set search_path = public;

insert into public.profiles (id, email, full_name, role, school_id, teacher_id, class_id)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'full_name', ''),
  coalesce((u.raw_app_meta_data->>'role')::public.user_role, 'teacher'),
  nullif(u.raw_app_meta_data->>'school_id',  ''),
  nullif(u.raw_app_meta_data->>'teacher_id', ''),
  nullif(u.raw_app_meta_data->>'class_id',   '')
from auth.users u
on conflict (id) do update set
  email      = excluded.email,
  full_name  = excluded.full_name,
  role       = excluded.role,
  school_id  = excluded.school_id,
  teacher_id = excluded.teacher_id,
  class_id   = excluded.class_id;
