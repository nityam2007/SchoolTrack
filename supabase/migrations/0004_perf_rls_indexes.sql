-- SchoolTrack — performance migration (RLS InitPlan + indexes)
-- Apply with: psql "$POSTGRES_URL_NON_POOLING" -f supabase/migrations/0004_perf_rls_indexes.sql
-- Safe + idempotent: only recreates policies and adds indexes. No data changes.
--
-- WHY: the policies in 0001 call security-definer helpers
-- (current_role / current_school_id / current_class_id / is_super_admin) WITHOUT
-- a subselect wrapper. Postgres therefore re-evaluates each helper FOR EVERY ROW
-- the query touches. On large tables (attendance, marks, messages) and for the
-- superadmin (who sees every tenant's rows) this dominates query time.
--
-- Wrapping each call as `(select public.fn())` turns it into an InitPlan that
-- Postgres caches once per statement. Same security semantics, far fewer calls.
-- Ref: Supabase "RLS performance" guide.

set search_path = public;

-- ─── Missing indexes for RLS tenant filters / hot list queries ───────────────
-- marks tenant_select filters by school_id (only an (exam_id, student_id) index
-- existed). messages list page orders a school's log by date.
create index if not exists marks_school_id_idx     on public.marks(school_id);
create index if not exists messages_school_date_idx on public.messages(school_id, date desc);

-- ─── Recreate every policy with InitPlan-wrapped helper calls ────────────────

-- profiles
drop policy if exists "profiles_self_or_super_select" on public.profiles;
create policy "profiles_self_or_super_select" on public.profiles
  for select using (auth.uid() = id or (select public.is_super_admin()));

-- schools
drop policy if exists "schools_super_all" on public.schools;
create policy "schools_super_all" on public.schools
  for all using ((select public.is_super_admin())) with check ((select public.is_super_admin()));
drop policy if exists "schools_tenant_select" on public.schools;
create policy "schools_tenant_select" on public.schools
  for select using (id = (select public.current_school_id()));

-- classes
drop policy if exists "classes_super_all" on public.classes;
create policy "classes_super_all" on public.classes
  for all using ((select public.is_super_admin())) with check ((select public.is_super_admin()));
drop policy if exists "classes_tenant_select" on public.classes;
create policy "classes_tenant_select" on public.classes
  for select using (school_id = (select public.current_school_id()));
drop policy if exists "classes_principal_write" on public.classes;
create policy "classes_principal_write" on public.classes
  for all using (school_id = (select public.current_school_id()) and (select public.current_role()) = 'schooladmin')
          with check (school_id = (select public.current_school_id()) and (select public.current_role()) = 'schooladmin');

-- teachers
drop policy if exists "teachers_super_all" on public.teachers;
create policy "teachers_super_all" on public.teachers
  for all using ((select public.is_super_admin())) with check ((select public.is_super_admin()));
drop policy if exists "teachers_tenant_select" on public.teachers;
create policy "teachers_tenant_select" on public.teachers
  for select using (school_id = (select public.current_school_id()));
drop policy if exists "teachers_principal_write" on public.teachers;
create policy "teachers_principal_write" on public.teachers
  for all using (school_id = (select public.current_school_id()) and (select public.current_role()) = 'schooladmin')
          with check (school_id = (select public.current_school_id()) and (select public.current_role()) = 'schooladmin');

-- students
drop policy if exists "students_super_all" on public.students;
create policy "students_super_all" on public.students
  for all using ((select public.is_super_admin())) with check ((select public.is_super_admin()));
drop policy if exists "students_tenant_select" on public.students;
create policy "students_tenant_select" on public.students
  for select using (school_id = (select public.current_school_id()));
drop policy if exists "students_principal_write" on public.students;
create policy "students_principal_write" on public.students
  for all using (school_id = (select public.current_school_id()) and (select public.current_role()) = 'schooladmin')
          with check (school_id = (select public.current_school_id()) and (select public.current_role()) = 'schooladmin');

-- attendance
drop policy if exists "attendance_super_all" on public.attendance;
create policy "attendance_super_all" on public.attendance
  for all using ((select public.is_super_admin())) with check ((select public.is_super_admin()));
drop policy if exists "attendance_tenant_select" on public.attendance;
create policy "attendance_tenant_select" on public.attendance
  for select using (school_id = (select public.current_school_id()));
drop policy if exists "attendance_principal_write" on public.attendance;
create policy "attendance_principal_write" on public.attendance
  for all using (school_id = (select public.current_school_id()) and (select public.current_role()) = 'schooladmin')
          with check (school_id = (select public.current_school_id()) and (select public.current_role()) = 'schooladmin');
drop policy if exists "attendance_teacher_write" on public.attendance;
create policy "attendance_teacher_write" on public.attendance
  for all using (school_id = (select public.current_school_id())
                 and (select public.current_role()) = 'teacher'
                 and class_id = (select public.current_class_id()))
          with check (school_id = (select public.current_school_id())
                      and (select public.current_role()) = 'teacher'
                      and class_id = (select public.current_class_id()));

-- holidays
drop policy if exists "holidays_super_all" on public.holidays;
create policy "holidays_super_all" on public.holidays
  for all using ((select public.is_super_admin())) with check ((select public.is_super_admin()));
drop policy if exists "holidays_tenant_select" on public.holidays;
create policy "holidays_tenant_select" on public.holidays
  for select using (school_id = (select public.current_school_id()));
drop policy if exists "holidays_principal_write" on public.holidays;
create policy "holidays_principal_write" on public.holidays
  for all using (school_id = (select public.current_school_id()) and (select public.current_role()) = 'schooladmin')
          with check (school_id = (select public.current_school_id()) and (select public.current_role()) = 'schooladmin');

-- messages
drop policy if exists "messages_super_all" on public.messages;
create policy "messages_super_all" on public.messages
  for all using ((select public.is_super_admin())) with check ((select public.is_super_admin()));
drop policy if exists "messages_tenant_select" on public.messages;
create policy "messages_tenant_select" on public.messages
  for select using (school_id = (select public.current_school_id()));
drop policy if exists "messages_principal_write" on public.messages;
create policy "messages_principal_write" on public.messages
  for all using (school_id = (select public.current_school_id()) and (select public.current_role()) = 'schooladmin')
          with check (school_id = (select public.current_school_id()) and (select public.current_role()) = 'schooladmin');

-- subjects
drop policy if exists "subjects_super_all" on public.subjects;
create policy "subjects_super_all" on public.subjects
  for all using ((select public.is_super_admin())) with check ((select public.is_super_admin()));
drop policy if exists "subjects_tenant_select" on public.subjects;
create policy "subjects_tenant_select" on public.subjects
  for select using (school_id = (select public.current_school_id()));
drop policy if exists "subjects_principal_write" on public.subjects;
create policy "subjects_principal_write" on public.subjects
  for all using (school_id = (select public.current_school_id()) and (select public.current_role()) = 'schooladmin')
          with check (school_id = (select public.current_school_id()) and (select public.current_role()) = 'schooladmin');

-- exams
drop policy if exists "exams_super_all" on public.exams;
create policy "exams_super_all" on public.exams
  for all using ((select public.is_super_admin())) with check ((select public.is_super_admin()));
drop policy if exists "exams_tenant_select" on public.exams;
create policy "exams_tenant_select" on public.exams
  for select using (school_id = (select public.current_school_id()));
drop policy if exists "exams_principal_write" on public.exams;
create policy "exams_principal_write" on public.exams
  for all using (school_id = (select public.current_school_id()) and (select public.current_role()) = 'schooladmin')
          with check (school_id = (select public.current_school_id()) and (select public.current_role()) = 'schooladmin');

-- marks
drop policy if exists "marks_super_all" on public.marks;
create policy "marks_super_all" on public.marks
  for all using ((select public.is_super_admin())) with check ((select public.is_super_admin()));
drop policy if exists "marks_tenant_select" on public.marks;
create policy "marks_tenant_select" on public.marks
  for select using (school_id = (select public.current_school_id()));
drop policy if exists "marks_principal_write" on public.marks;
create policy "marks_principal_write" on public.marks
  for all using (school_id = (select public.current_school_id()) and (select public.current_role()) = 'schooladmin')
          with check (school_id = (select public.current_school_id()) and (select public.current_role()) = 'schooladmin');
drop policy if exists "marks_teacher_write" on public.marks;
create policy "marks_teacher_write" on public.marks
  for all using (
        school_id = (select public.current_school_id())
        and (select public.current_role()) = 'teacher'
        and exists (
          select 1 from public.exams e
          where e.id = exam_id and e.class_id = (select public.current_class_id())
        ))
       with check (
        school_id = (select public.current_school_id())
        and (select public.current_role()) = 'teacher'
        and exists (
          select 1 from public.exams e
          where e.id = exam_id and e.class_id = (select public.current_class_id())
        ));

-- ─── Done ────────────────────────────────────────────────────────────────────
