# Feature: Supabase Backend

## Files

```
supabase/
├── migrations/
│   └── 0001_init.sql       canonical drop+rebuild schema with RLS
└── seed.sql                reference data (schools, classes, students, …)
scripts/
└── seed-users.mjs          creates demo auth.users via service-role admin API
```

## One-time Setup

```bash
# 1. Pull env from Vercel
vercel pull --yes

# 2. Apply schema (DROPs + recreates all public tables — destructive)
psql "$POSTGRES_URL_NON_POOLING" -f supabase/migrations/0001_init.sql

# 3. Seed reference data
psql "$POSTGRES_URL_NON_POOLING" -f supabase/seed.sql

# 4. Seed demo auth users (Super Admin / Principals / Teachers)
node scripts/seed-users.mjs
```

`POSTGRES_URL_NON_POOLING` is provided by `vercel pull`.

## Auth

- Provider: Supabase Auth (email + password).
- Profiles: a row in `public.profiles` is auto-created by the
  `handle_new_user` trigger from `raw_user_meta_data`. Required keys:
  - `role` — `superadmin` | `schooladmin` | `teacher`
  - `school_id` — string FK (or empty for super admin)
  - `teacher_id` — string FK (teacher only)
  - `class_id` — string FK (teacher only)
  - `full_name` — display string

Setting `email_confirm: true` skips the confirmation email (needed for
local dev / seed users).

## RLS Helpers

```sql
public.current_role()       -- profiles.role for auth.uid()
public.current_school_id()  -- profiles.school_id
public.current_class_id()   -- profiles.class_id
public.is_super_admin()     -- bool
```

All four are `security definer` so they can read `profiles` from inside
RLS policies without recursion.

## Client Pattern

```ts
// composables/useSb.ts — typed wrapper
export const useSb = (): SupabaseClient => useSupabaseClient() as ...

// stores/db.ts
const supabase = useSb()
await supabase.from('students').select('*')   // RLS enforced
```

The browser **only** sees `SUPABASE_ANON_KEY`. The service-role key never
leaves the server (used only by `scripts/seed-users.mjs`).

## Vercel Environment

| Var | Where used |
|---|---|
| `SUPABASE_URL`              | client + server |
| `SUPABASE_ANON_KEY`         | client + server |
| `SUPABASE_SERVICE_ROLE_KEY` | scripts only — never client |
| `POSTGRES_URL_NON_POOLING`  | one-off `psql` migrations |

The Nuxt module is configured to read these in `nuxt.config.ts` →
`supabase: { url, key }`. Dev scripts pass `--dotenv .env.local` so
`vercel pull` output is loaded automatically.
