-- SchoolTrack — auto-decrement school credits on WhatsApp message insert.
--
-- Why this exists:
--   The `schools` table is locked down to super admins via the
--   `schools_super_all` policy. Principals only have SELECT access through
--   `schools_tenant_select`. Previously the messages page tried to update
--   `schools.credits` from the client after inserting messages; that throws
--     "new row violates row-level security policy for table 'schools'"
--   for every principal trying to send absence notifications.
--
-- Fix:
--   1) Move the credit accounting server-side as a BEFORE-INSERT trigger on
--      `messages`. Running with SECURITY DEFINER (table owner = postgres)
--      bypasses RLS for the schools UPDATE while keeping the principal's
--      authorization checked by `messages_principal_write` on the insert.
--   2) Take a row lock on the school so concurrent inserts serialize and we
--      can never go below zero.
--   3) Refuse the insert if the school is out of credits — the per-row check
--      means a batch insert of N rows for a school with K < N credits aborts
--      the whole transaction (no partial sends, no negative balance).

set search_path = public;

create or replace function public.decrement_school_credits_on_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_credits integer;
begin
  -- Lock the schools row so concurrent message inserts don't race the
  -- balance check below.
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

  return new;
end;
$$;

drop trigger if exists on_message_insert_decrement_credits on public.messages;
create trigger on_message_insert_decrement_credits
  before insert on public.messages
  for each row execute function public.decrement_school_credits_on_message();

comment on function public.decrement_school_credits_on_message is
  'BEFORE-INSERT trigger on messages: locks the school row, refuses the insert when credits<1, otherwise decrements credits by 1. Runs SECURITY DEFINER so principals do not need write access to schools.';
