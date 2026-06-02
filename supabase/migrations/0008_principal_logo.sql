-- SchoolTrack — allow principals to upload their own school's logo.
-- Apply with: psql "$POSTGRES_URL_NON_POOLING" -f supabase/migrations/0008_principal_logo.sql
-- Additive + idempotent.
--
-- The schools.logo_url column stays SA-write under RLS; principals set it via
-- the /api/school-logo server route (service role, authorised server-side).
-- These policies let a principal write the image into their own school folder.

set search_path = public;

drop policy if exists "school_logos_principal_insert" on storage.objects;
create policy "school_logos_principal_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'school-logos'
    and (storage.foldername(name))[1] = (select public.current_school_id())
    and (select public.current_role()) = 'schooladmin'
  );

drop policy if exists "school_logos_principal_update" on storage.objects;
create policy "school_logos_principal_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'school-logos'
    and (storage.foldername(name))[1] = (select public.current_school_id())
    and (select public.current_role()) = 'schooladmin'
  );
