-- SchoolTrack — platform features: audit logs, credit requests, staff messages,
-- custom message fields, student promotion history, attachment storage.
-- Apply with: psql "$POSTGRES_URL_NON_POOLING" -f supabase/migrations/0006_platform_features.sql
-- Additive + idempotent.

set search_path = public;

-- ─── Audit logs (everything: data changes, logins, page views) ───────────────
create table if not exists public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid,
  actor_email text not null default '',
  role        text not null default '',
  action      text not null,            -- create|update|delete|login|logout|page_view|message|export|import|promote
  entity      text not null default '',
  entity_id   text,
  school_id   text,
  path        text,
  ip          text,
  detail      jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists audit_logs_created_idx on public.audit_logs(created_at desc);
create index if not exists audit_logs_school_idx  on public.audit_logs(school_id, created_at desc);
create index if not exists audit_logs_actor_idx   on public.audit_logs(actor_id, created_at desc);

alter table public.audit_logs enable row level security;
drop policy if exists "audit_insert_self" on public.audit_logs;
create policy "audit_insert_self" on public.audit_logs
  for insert to authenticated with check (actor_id = auth.uid());
drop policy if exists "audit_super_select" on public.audit_logs;
create policy "audit_super_select" on public.audit_logs
  for select using ((select public.is_super_admin()));
drop policy if exists "audit_principal_select" on public.audit_logs;
create policy "audit_principal_select" on public.audit_logs
  for select using (school_id = (select public.current_school_id()) and (select public.current_role()) = 'schooladmin');
drop policy if exists "audit_teacher_select" on public.audit_logs;
create policy "audit_teacher_select" on public.audit_logs
  for select using (actor_id = auth.uid());

-- ─── Credit requests (principal "ask for more") ──────────────────────────────
create table if not exists public.credit_requests (
  id           uuid primary key default gen_random_uuid(),
  school_id    text not null references public.schools(id) on delete cascade,
  amount       integer not null check (amount > 0),
  note         text not null default '',
  status       text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_by text not null default '',
  resolved_by  text,
  created_at   timestamptz not null default now(),
  resolved_at  timestamptz
);
create index if not exists credit_requests_school_idx on public.credit_requests(school_id, created_at desc);
create index if not exists credit_requests_status_idx on public.credit_requests(status, created_at desc);

alter table public.credit_requests enable row level security;
drop policy if exists "credit_req_super_all" on public.credit_requests;
create policy "credit_req_super_all" on public.credit_requests
  for all using ((select public.is_super_admin())) with check ((select public.is_super_admin()));
drop policy if exists "credit_req_tenant_select" on public.credit_requests;
create policy "credit_req_tenant_select" on public.credit_requests
  for select using (school_id = (select public.current_school_id()));
drop policy if exists "credit_req_principal_insert" on public.credit_requests;
create policy "credit_req_principal_insert" on public.credit_requests
  for insert to authenticated
  with check (school_id = (select public.current_school_id()) and (select public.current_role()) = 'schooladmin');

-- ─── Staff messages (principal → teacher notices) ────────────────────────────
create table if not exists public.staff_messages (
  id            uuid primary key default gen_random_uuid(),
  school_id     text not null references public.schools(id) on delete cascade,
  from_email    text not null default '',
  to_teacher_id text references public.teachers(id) on delete cascade,   -- null = all teachers
  subject       text not null default '',
  body          text not null default '',
  created_at    timestamptz not null default now()
);
create index if not exists staff_messages_school_idx on public.staff_messages(school_id, created_at desc);

alter table public.staff_messages enable row level security;
drop policy if exists "staff_msg_super_all" on public.staff_messages;
create policy "staff_msg_super_all" on public.staff_messages
  for all using ((select public.is_super_admin())) with check ((select public.is_super_admin()));
drop policy if exists "staff_msg_tenant_select" on public.staff_messages;
create policy "staff_msg_tenant_select" on public.staff_messages
  for select using (school_id = (select public.current_school_id()));
drop policy if exists "staff_msg_principal_write" on public.staff_messages;
create policy "staff_msg_principal_write" on public.staff_messages
  for all using (school_id = (select public.current_school_id()) and (select public.current_role()) = 'schooladmin')
          with check (school_id = (select public.current_school_id()) and (select public.current_role()) = 'schooladmin');

-- ─── Custom message fields (body + attachment + recipient type) ──────────────
alter table public.messages add column if not exists body           text not null default '';
alter table public.messages add column if not exists attachment_url text;
alter table public.messages add column if not exists recipient_type text not null default 'student';

-- ─── Student promotion: remember the previous class ──────────────────────────
alter table public.students add column if not exists previous_class_id text references public.classes(id) on delete set null;

-- ─── Message attachment storage (PDF / binary) ───────────────────────────────
insert into storage.buckets (id, name, public)
values ('message-attachments', 'message-attachments', true)
on conflict (id) do nothing;

drop policy if exists "msg_attach_read" on storage.objects;
create policy "msg_attach_read" on storage.objects
  for select using (bucket_id = 'message-attachments');
drop policy if exists "msg_attach_write" on storage.objects;
create policy "msg_attach_write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'message-attachments' and (
    (select public.is_super_admin())
    or (storage.foldername(name))[1] = (select public.current_school_id())
  ));

-- ─── Done ────────────────────────────────────────────────────────────────────
