-- SchoolTrack — canonical schema (drop + rebuild)
-- Multi-tenant SaaS. Tenant boundary = `school_id`.
-- RLS reads role/school_id/class_id from `public.profiles`, which is keyed by auth.uid().
-- Apply with: psql "$POSTGRES_URL_NON_POOLING" -f supabase/migrations/0001_init.sql

set search_path = public;

-- ─── Drop everything in `public` we own (idempotent rebuild) ─────────────────
drop table if exists public.marks            cascade;
drop table if exists public.exams            cascade;
drop table if exists public.subjects         cascade;
drop table if exists public.messages         cascade;
drop table if exists public.holidays         cascade;
drop table if exists public.attendance       cascade;
drop table if exists public.students         cascade;
drop table if exists public.teachers         cascade;
drop table if exists public.classes          cascade;
drop table if exists public.schools          cascade;
drop table if exists public.profiles         cascade;

drop type if exists public.user_role         cascade;
drop type if exists public.attendance_status cascade;
drop type if exists public.message_status    cascade;
drop type if exists public.exam_status       cascade;

drop function if exists public.current_role()                    cascade;
drop function if exists public.current_school_id()               cascade;
drop function if exists public.current_class_id()                cascade;
drop function if exists public.is_super_admin()                  cascade;
drop function if exists public.handle_new_user()                 cascade;
drop function if exists public.sync_profile_from_app_metadata()  cascade;

-- ─── Enums ──────────────────────────────────────────────────────────────────
create type public.user_role         as enum ('superadmin', 'schooladmin', 'teacher');
create type public.attendance_status as enum ('present', 'absent');
create type public.message_status    as enum ('queued', 'delivered', 'failed');
create type public.exam_status       as enum ('upcoming', 'open', 'closed');

-- ─── Schools (tenants) ──────────────────────────────────────────────────────
create table public.schools (
  id          text primary key,
  name        text not null,
  city        text not null default '',
  credits     integer not null default 0 check (credits >= 0),
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ─── Classes ────────────────────────────────────────────────────────────────
create table public.classes (
  id          text primary key,
  school_id   text not null references public.schools(id) on delete cascade,
  name        text not null,
  section     text not null default '',
  grade       integer not null check (grade between 1 and 12),
  created_at  timestamptz not null default now()
);
create index classes_school_id_idx on public.classes(school_id);

-- ─── Teachers (operational record — auth identity is in auth.users/profiles)
create table public.teachers (
  id          text primary key,
  school_id   text not null references public.schools(id) on delete cascade,
  class_id    text references public.classes(id) on delete set null,
  name        text not null,
  email       text not null,
  phone       text not null default '',
  created_at  timestamptz not null default now(),
  unique (school_id, email)
);
create index teachers_school_id_idx on public.teachers(school_id);
create index teachers_class_id_idx  on public.teachers(class_id);

-- ─── Students ───────────────────────────────────────────────────────────────
create table public.students (
  id              text primary key,
  school_id       text not null references public.schools(id) on delete cascade,
  class_id        text not null references public.classes(id) on delete cascade,
  name            text not null,
  roll            text not null,
  parent_phone    text not null default '',
  dob             date,
  gender          text check (gender in ('Male', 'Female', 'Other')),
  father_name     text,
  mother_name     text,
  attendance_pct  integer default 0 check (attendance_pct between 0 and 100),
  created_at      timestamptz not null default now(),
  unique (class_id, roll)
);
create index students_school_id_idx on public.students(school_id);
create index students_class_id_idx  on public.students(class_id);

-- ─── Attendance ─────────────────────────────────────────────────────────────
create table public.attendance (
  id          text primary key,
  school_id   text not null references public.schools(id) on delete cascade,
  class_id    text not null references public.classes(id) on delete cascade,
  student_id  text not null references public.students(id) on delete cascade,
  date        date not null,
  status      public.attendance_status not null,
  teacher_id  text references public.teachers(id) on delete set null,
  photo       boolean not null default false,
  timestamp   timestamptz not null default now(),
  unique (student_id, date)
);
create index attendance_school_date_idx on public.attendance(school_id, date);
create index attendance_class_date_idx  on public.attendance(class_id, date);

-- ─── Holidays ───────────────────────────────────────────────────────────────
create table public.holidays (
  id          text primary key,
  school_id   text not null references public.schools(id) on delete cascade,
  date        date not null,
  title       text not null,
  unique (school_id, date)
);
create index holidays_school_id_idx on public.holidays(school_id);

-- ─── Messages (WhatsApp log) ────────────────────────────────────────────────
create table public.messages (
  id            text primary key,
  school_id     text not null references public.schools(id) on delete cascade,
  student_name  text not null,
  parent_phone  text not null,
  date          timestamptz not null default now(),
  status        public.message_status not null default 'queued'
);
create index messages_school_id_idx on public.messages(school_id);

-- ─── Subjects (per-school catalog) ──────────────────────────────────────────
create table public.subjects (
  id              text primary key,
  school_id       text not null references public.schools(id) on delete cascade,
  name            text not null,
  has_theory      boolean not null default true,
  has_practical   boolean not null default false,
  theory_max      integer not null default 80 check (theory_max >= 0),
  practical_max   integer not null default 0  check (practical_max >= 0),
  passing_marks   integer not null default 27 check (passing_marks >= 0),
  unique (school_id, name)
);
create index subjects_school_id_idx on public.subjects(school_id);

-- ─── Exams ──────────────────────────────────────────────────────────────────
create table public.exams (
  id          text primary key,
  school_id   text not null references public.schools(id) on delete cascade,
  class_id    text not null references public.classes(id) on delete cascade,
  name        text not null,
  date_label  text not null default '',         -- "July 2025" — display only
  session     text not null,                    -- "2025-26"
  max_marks   integer not null default 100,
  status      public.exam_status not null default 'upcoming'
);
create index exams_school_id_idx on public.exams(school_id);
create index exams_class_id_idx  on public.exams(class_id);

-- ─── Marks (per student per subject per exam) ───────────────────────────────
create table public.marks (
  id              uuid primary key default gen_random_uuid(),
  school_id       text not null references public.schools(id) on delete cascade,
  exam_id         text not null references public.exams(id) on delete cascade,
  student_id      text not null references public.students(id) on delete cascade,
  subject_id      text not null references public.subjects(id) on delete cascade,
  theory          integer not null default 0 check (theory >= 0),
  practical       integer not null default 0 check (practical >= 0),
  updated_at      timestamptz not null default now(),
  unique (exam_id, student_id, subject_id)
);
create index marks_exam_student_idx on public.marks(exam_id, student_id);

-- ─── Profiles (mirror of auth.users + role/scope) ───────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text not null default '',
  role        public.user_role not null,
  school_id   text references public.schools(id) on delete set null,
  teacher_id  text references public.teachers(id) on delete set null,
  class_id    text references public.classes(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index profiles_school_id_idx on public.profiles(school_id);

-- ─── Helper functions (security definer to read profiles in RLS) ─────────────
create or replace function public.current_role()
returns public.user_role
language sql stable security definer set search_path = public as
$$ select role from public.profiles where id = auth.uid() $$;

create or replace function public.current_school_id()
returns text
language sql stable security definer set search_path = public as
$$ select school_id from public.profiles where id = auth.uid() $$;

create or replace function public.current_class_id()
returns text
language sql stable security definer set search_path = public as
$$ select class_id from public.profiles where id = auth.uid() $$;

create or replace function public.is_super_admin()
returns boolean
language sql stable security definer set search_path = public as
$$ select coalesce((select role = 'superadmin' from public.profiles where id = auth.uid()), false) $$;

-- Trigger: auto-create a profile row when an auth user is created.
-- SECURITY: role/school_id/teacher_id/class_id are read from raw_app_meta_data
-- (app_metadata) which is ADMIN-ONLY writable. raw_user_meta_data is
-- user-writable via auth.updateUser({ data }) and must NEVER be trusted for
-- authorization claims. full_name comes from user_metadata (not security-
-- critical). The trigger fires on INSERT only — once the profile exists,
-- changes flow through the admin API + a separate sync_profile_app_metadata
-- trigger that only updates app_metadata-derived fields.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as
$$
begin
  insert into public.profiles (id, email, full_name, role, school_id, teacher_id, class_id)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_app_meta_data->>'role')::public.user_role, 'teacher'),
    nullif(new.raw_app_meta_data->>'school_id', ''),
    nullif(new.raw_app_meta_data->>'teacher_id', ''),
    nullif(new.raw_app_meta_data->>'class_id', '')
  )
  on conflict (id) do nothing;  -- never overwrite an existing profile from this path
  return new;
end;
$$;

-- Separate trigger to sync ONLY when raw_app_meta_data changes (admin path).
-- raw_user_meta_data updates are intentionally NOT a sync source — that field
-- is user-controllable and would otherwise be a privilege-escalation vector.
create or replace function public.sync_profile_from_app_metadata()
returns trigger language plpgsql security definer set search_path = public as
$$
begin
  if new.raw_app_meta_data is distinct from old.raw_app_meta_data then
    update public.profiles set
      role       = coalesce((new.raw_app_meta_data->>'role')::public.user_role, role),
      school_id  = nullif(new.raw_app_meta_data->>'school_id', ''),
      teacher_id = nullif(new.raw_app_meta_data->>'teacher_id', ''),
      class_id   = nullif(new.raw_app_meta_data->>'class_id', '')
    where id = new.id;
  end if;
  -- email + full_name can sync from user_metadata safely (display only).
  if new.email is distinct from old.email
     or (new.raw_user_meta_data->>'full_name') is distinct from (old.raw_user_meta_data->>'full_name') then
    update public.profiles set
      email     = new.email,
      full_name = coalesce(new.raw_user_meta_data->>'full_name', full_name)
    where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update on auth.users
  for each row execute function public.sync_profile_from_app_metadata();

-- ─── RLS ─────────────────────────────────────────────────────────────────────
alter table public.profiles    enable row level security;
alter table public.schools     enable row level security;
alter table public.classes     enable row level security;
alter table public.teachers    enable row level security;
alter table public.students    enable row level security;
alter table public.attendance  enable row level security;
alter table public.holidays    enable row level security;
alter table public.messages    enable row level security;
alter table public.subjects    enable row level security;
alter table public.exams       enable row level security;
alter table public.marks       enable row level security;

-- profiles: a user reads their own profile; super admins read all.
-- No INSERT/UPDATE/DELETE policies are defined for `authenticated`, so direct
-- writes to profiles from the client are blocked. Profile rows are only
-- written by the security-definer triggers fired from auth.users.
create policy "profiles_self_or_super_select" on public.profiles
  for select using (auth.uid() = id or public.is_super_admin());

-- schools: super admin full; principals/teachers read own school only.
create policy "schools_super_all" on public.schools
  for all using (public.is_super_admin()) with check (public.is_super_admin());
create policy "schools_tenant_select" on public.schools
  for select using (id = public.current_school_id());

-- Generic per-table tenant policies generator pattern (inline for clarity).
-- classes
create policy "classes_super_all" on public.classes
  for all using (public.is_super_admin()) with check (public.is_super_admin());
create policy "classes_tenant_select" on public.classes
  for select using (school_id = public.current_school_id());
create policy "classes_principal_write" on public.classes
  for all using (school_id = public.current_school_id() and public.current_role() = 'schooladmin')
          with check (school_id = public.current_school_id() and public.current_role() = 'schooladmin');

-- teachers
create policy "teachers_super_all" on public.teachers
  for all using (public.is_super_admin()) with check (public.is_super_admin());
create policy "teachers_tenant_select" on public.teachers
  for select using (school_id = public.current_school_id());
create policy "teachers_principal_write" on public.teachers
  for all using (school_id = public.current_school_id() and public.current_role() = 'schooladmin')
          with check (school_id = public.current_school_id() and public.current_role() = 'schooladmin');

-- students
create policy "students_super_all" on public.students
  for all using (public.is_super_admin()) with check (public.is_super_admin());
create policy "students_tenant_select" on public.students
  for select using (school_id = public.current_school_id());
create policy "students_principal_write" on public.students
  for all using (school_id = public.current_school_id() and public.current_role() = 'schooladmin')
          with check (school_id = public.current_school_id() and public.current_role() = 'schooladmin');

-- attendance
create policy "attendance_super_all" on public.attendance
  for all using (public.is_super_admin()) with check (public.is_super_admin());
create policy "attendance_tenant_select" on public.attendance
  for select using (school_id = public.current_school_id());
-- principals can write any attendance in their school (e.g. corrections)
create policy "attendance_principal_write" on public.attendance
  for all using (school_id = public.current_school_id() and public.current_role() = 'schooladmin')
          with check (school_id = public.current_school_id() and public.current_role() = 'schooladmin');
-- teachers can write attendance only for their own class
create policy "attendance_teacher_write" on public.attendance
  for all using (school_id = public.current_school_id()
                 and public.current_role() = 'teacher'
                 and class_id = public.current_class_id())
          with check (school_id = public.current_school_id()
                      and public.current_role() = 'teacher'
                      and class_id = public.current_class_id());

-- holidays
create policy "holidays_super_all" on public.holidays
  for all using (public.is_super_admin()) with check (public.is_super_admin());
create policy "holidays_tenant_select" on public.holidays
  for select using (school_id = public.current_school_id());
create policy "holidays_principal_write" on public.holidays
  for all using (school_id = public.current_school_id() and public.current_role() = 'schooladmin')
          with check (school_id = public.current_school_id() and public.current_role() = 'schooladmin');

-- messages
create policy "messages_super_all" on public.messages
  for all using (public.is_super_admin()) with check (public.is_super_admin());
create policy "messages_tenant_select" on public.messages
  for select using (school_id = public.current_school_id());
create policy "messages_principal_write" on public.messages
  for all using (school_id = public.current_school_id() and public.current_role() = 'schooladmin')
          with check (school_id = public.current_school_id() and public.current_role() = 'schooladmin');

-- subjects
create policy "subjects_super_all" on public.subjects
  for all using (public.is_super_admin()) with check (public.is_super_admin());
create policy "subjects_tenant_select" on public.subjects
  for select using (school_id = public.current_school_id());
create policy "subjects_principal_write" on public.subjects
  for all using (school_id = public.current_school_id() and public.current_role() = 'schooladmin')
          with check (school_id = public.current_school_id() and public.current_role() = 'schooladmin');

-- exams
create policy "exams_super_all" on public.exams
  for all using (public.is_super_admin()) with check (public.is_super_admin());
create policy "exams_tenant_select" on public.exams
  for select using (school_id = public.current_school_id());
create policy "exams_principal_write" on public.exams
  for all using (school_id = public.current_school_id() and public.current_role() = 'schooladmin')
          with check (school_id = public.current_school_id() and public.current_role() = 'schooladmin');

-- marks
create policy "marks_super_all" on public.marks
  for all using (public.is_super_admin()) with check (public.is_super_admin());
create policy "marks_tenant_select" on public.marks
  for select using (school_id = public.current_school_id());
-- principals can write any marks in their school
create policy "marks_principal_write" on public.marks
  for all using (school_id = public.current_school_id() and public.current_role() = 'schooladmin')
          with check (school_id = public.current_school_id() and public.current_role() = 'schooladmin');
-- teachers can only enter marks for their own class's exams
create policy "marks_teacher_write" on public.marks
  for all using (
        school_id = public.current_school_id()
        and public.current_role() = 'teacher'
        and exists (
          select 1 from public.exams e
          where e.id = exam_id and e.class_id = public.current_class_id()
        ))
       with check (
        school_id = public.current_school_id()
        and public.current_role() = 'teacher'
        and exists (
          select 1 from public.exams e
          where e.id = exam_id and e.class_id = public.current_class_id()
        ));

-- ─── Done ───────────────────────────────────────────────────────────────────
comment on schema public is 'SchoolTrack — multi-tenant attendance + report cards. Tenant key: school_id.';
