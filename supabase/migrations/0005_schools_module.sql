-- SchoolTrack — Schools module: logos + credit ledger.
-- Apply with: psql "$POSTGRES_URL_NON_POOLING" -f supabase/migrations/0005_schools_module.sql
-- Additive + idempotent. The only behavioural change is that the existing
-- message credit-decrement trigger now also writes a ledger row.

set search_path = public;

-- ─── School logo ─────────────────────────────────────────────────────────────
alter table public.schools add column if not exists logo_url text;

-- ─── Credit ledger (recharge + deduction history) ────────────────────────────
create table if not exists public.credit_transactions (
  id            uuid primary key default gen_random_uuid(),
  school_id     text not null references public.schools(id) on delete cascade,
  kind          text not null check (kind in ('recharge', 'deduction', 'adjustment')),
  amount        integer not null,           -- signed: +recharge, -deduction
  balance_after integer,
  note          text not null default '',
  actor_email   text not null default '',
  created_at    timestamptz not null default now()
);
create index if not exists credit_txns_school_idx
  on public.credit_transactions(school_id, created_at desc);

alter table public.credit_transactions enable row level security;

drop policy if exists "credit_txns_super_all" on public.credit_transactions;
create policy "credit_txns_super_all" on public.credit_transactions
  for all using ((select public.is_super_admin())) with check ((select public.is_super_admin()));

drop policy if exists "credit_txns_tenant_select" on public.credit_transactions;
create policy "credit_txns_tenant_select" on public.credit_transactions
  for select using (school_id = (select public.current_school_id()));

-- ─── Extend the message trigger to log each deduction ────────────────────────
create or replace function public.decrement_school_credits_on_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_credits integer;
begin
  select credits into current_credits
    from public.schools
   where id = new.school_id
   for update;

  if current_credits is null then
    raise exception 'school % does not exist', new.school_id
      using errcode = 'foreign_key_violation';
  end if;

  if current_credits < 1 then
    raise exception 'school % has insufficient credits', new.school_id
      using errcode = 'check_violation';
  end if;

  update public.schools
     set credits = current_credits - 1
   where id = new.school_id;

  insert into public.credit_transactions (school_id, kind, amount, balance_after, note)
  values (new.school_id, 'deduction', -1, current_credits - 1,
          'WhatsApp · ' || coalesce(new.student_name, ''));

  return new;
end;
$$;

-- ─── Logo storage bucket (public read; super admin writes) ───────────────────
insert into storage.buckets (id, name, public)
values ('school-logos', 'school-logos', true)
on conflict (id) do nothing;

drop policy if exists "school_logos_public_read" on storage.objects;
create policy "school_logos_public_read" on storage.objects
  for select using (bucket_id = 'school-logos');

drop policy if exists "school_logos_super_insert" on storage.objects;
create policy "school_logos_super_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'school-logos' and (select public.is_super_admin()));

drop policy if exists "school_logos_super_update" on storage.objects;
create policy "school_logos_super_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'school-logos' and (select public.is_super_admin()));

drop policy if exists "school_logos_super_delete" on storage.objects;
create policy "school_logos_super_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'school-logos' and (select public.is_super_admin()));

-- ─── Done ────────────────────────────────────────────────────────────────────
