-- SchoolTrack — attendance classroom photos (secure / private storage).
-- Apply with: psql "$POSTGRES_URL_NON_POOLING" -f supabase/migrations/0007_attendance_photos.sql
-- Additive + idempotent.
--
-- Photos of children are sensitive, so the bucket is PRIVATE: files are served
-- only through short-lived signed URLs, and both the table and the storage
-- objects are RLS-scoped to the owning school.

set search_path = public;

-- ─── One classroom photo per class per day ───────────────────────────────────
create table if not exists public.attendance_photos (
  id          uuid primary key default gen_random_uuid(),
  school_id   text not null references public.schools(id) on delete cascade,
  class_id    text not null references public.classes(id) on delete cascade,
  date        date not null,
  path        text not null,                 -- object path inside the private bucket
  teacher_id  text references public.teachers(id) on delete set null,
  created_at  timestamptz not null default now(),
  unique (class_id, date)
);
create index if not exists attendance_photos_school_idx on public.attendance_photos(school_id, date desc);

alter table public.attendance_photos enable row level security;

drop policy if exists "att_ph_super_all" on public.attendance_photos;
create policy "att_ph_super_all" on public.attendance_photos
  for all using ((select public.is_super_admin())) with check ((select public.is_super_admin()));
drop policy if exists "att_ph_tenant_select" on public.attendance_photos;
create policy "att_ph_tenant_select" on public.attendance_photos
  for select using (school_id = (select public.current_school_id()));
drop policy if exists "att_ph_principal_write" on public.attendance_photos;
create policy "att_ph_principal_write" on public.attendance_photos
  for all using (school_id = (select public.current_school_id()) and (select public.current_role()) = 'schooladmin')
          with check (school_id = (select public.current_school_id()) and (select public.current_role()) = 'schooladmin');
drop policy if exists "att_ph_teacher_write" on public.attendance_photos;
create policy "att_ph_teacher_write" on public.attendance_photos
  for all using (school_id = (select public.current_school_id())
                 and (select public.current_role()) = 'teacher'
                 and class_id = (select public.current_class_id()))
          with check (school_id = (select public.current_school_id())
                      and (select public.current_role()) = 'teacher'
                      and class_id = (select public.current_class_id()));

-- ─── Private storage bucket + RLS (signed-URL access only) ───────────────────
insert into storage.buckets (id, name, public)
values ('attendance-photos', 'attendance-photos', false)
on conflict (id) do update set public = false;

-- Read: any staff of the owning school (path = {schoolId}/...) or super admin.
drop policy if exists "att_photos_read" on storage.objects;
create policy "att_photos_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'attendance-photos' and (
    (select public.is_super_admin())
    or (storage.foldername(name))[1] = (select public.current_school_id())
  ));
-- Write: staff of the owning school.
drop policy if exists "att_photos_write" on storage.objects;
create policy "att_photos_write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'attendance-photos' and (
    (select public.is_super_admin())
    or (storage.foldername(name))[1] = (select public.current_school_id())
  ));
drop policy if exists "att_photos_update" on storage.objects;
create policy "att_photos_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'attendance-photos' and (
    (select public.is_super_admin())
    or (storage.foldername(name))[1] = (select public.current_school_id())
  ));

-- ─── Done ────────────────────────────────────────────────────────────────────
