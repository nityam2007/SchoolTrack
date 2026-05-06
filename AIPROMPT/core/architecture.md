# SchoolTrack — Multi-Tenant SaaS Architecture

## Tenant Model

```
PLATFORM (SchoolTrack)
  Super Admin(s)  — manage all schools
  └── School A
      ├── Principal (1)
      ├── Teachers[]      (1 class each)
      └── Classes[] → Students[] → Attendance[]
                                  → Marks[]   ← linked to Exams[] × Subjects[]
```

## Data Model

The canonical schema lives in [`supabase/migrations/0001_init.sql`](../../supabase/migrations/0001_init.sql).
TypeScript mirrors are in [`types/database.ts`](../../types/database.ts).

| Table | Tenant Key | Notes |
|---|---|---|
| `schools`     | self          | id, name, city, credits, active |
| `classes`     | school_id     | id, name, section, grade |
| `teachers`    | school_id     | name, email, phone, class_id (assignment) |
| `students`    | school_id     | + class_id, roll, parent_phone, dob, gender, father/mother, attendance_pct |
| `attendance`  | school_id + class_id | (student_id, date) unique. status, photo, teacher_id |
| `holidays`    | school_id     | (school_id, date) unique |
| `messages`    | school_id     | WhatsApp log: student_name, parent_phone, status |
| `subjects`    | school_id     | name, has_theory, has_practical, theory_max, practical_max, passing_marks |
| `exams`       | school_id + class_id | name, date_label, session, status (upcoming/open/closed) |
| `marks`       | school_id     | (exam_id, student_id, subject_id) unique. theory + practical |
| `profiles`    | school_id (FK) | role, school_id, teacher_id, class_id — keyed by `auth.users.id` |

## Authentication

Supabase Auth (email + password) is the source of truth. On sign-up the
trigger `handle_new_user` inserts a row into `profiles` from
`raw_user_meta_data` so the app immediately knows the user's role and scope.

```
Login Screen (Nuxt)
  └── supabase.auth.signInWithPassword({ email, password })
        └── stores/auth.ts.refresh()
              └── select * from profiles where id = auth.uid()
                    → AuthUser { role, schoolId, teacherId?, classId? }
```

Demo accounts are seeded by [`scripts/seed-users.mjs`](../../scripts/seed-users.mjs)
using the service-role admin API.

## Row-Level Security

Every table has RLS enabled. Policies are defined at the bottom of
`0001_init.sql` and follow this pattern:

```sql
-- "tenant select" — anyone in this school can read
create policy "<table>_tenant_select" on public.<table>
  for select using (school_id = public.current_school_id());

-- "principal write" — only schooladmins of this school can write
create policy "<table>_principal_write" on public.<table>
  for all using (school_id = public.current_school_id() and current_role() = 'schooladmin')
       with check (school_id = public.current_school_id() and current_role() = 'schooladmin');

-- super admins always
create policy "<table>_super_all" on public.<table>
  for all using (is_super_admin()) with check (is_super_admin());
```

Special cases:
- `attendance` — teachers can write rows for their own `class_id` only.
- `marks` — teachers can write marks only for exams whose `class_id` matches their own.

## State Architecture

```
Nuxt App
├── stores/auth.ts          — Pinia: current AuthUser, login(), logout(), refresh()
│                            (refresh dedups via inflight promise; reads role
│                             from JWT app_metadata to avoid supabase-js auth
│                             lock deadlocks during full-page hydration)
├── stores/db.ts            — Pinia: schools/classes/.../marks (read from Supabase)
├── plugins/db-loader       — fetches db.loadAll() on auth change
├── plugins/role-guard      — reactive role gate; redirects on every route or
│                            auth change (covers SSR-rendered pages where
│                            middleware does not re-run on hydration)
├── middleware/auth.global  — auth + role gate on client navigations
├── middleware/super-admin-only / principal-only / teacher-only
│                          — per-page gates for client navigations
└── layouts/default.vue     — wraps page slot in <ClientOnly> so auth-driven
                              UI does not produce SSR/CSR hydration mismatches
```

### Route map

| Path                          | Role(s)              | File |
|---|---|---|
| `/login`                      | public               | `pages/login.vue` |
| `/dashboard`                  | any authenticated    | `pages/dashboard.vue` |
| `/schools` · `/schools/:id`   | superadmin           | `pages/schools/index.vue` · `pages/schools/[id].vue` |
| `/credits`                    | superadmin           | `pages/credits.vue` |
| `/analytics`                  | superadmin           | `pages/analytics.vue` |
| `/attendance`                 | schooladmin          | `pages/attendance.vue` |
| `/teachers` · `/teachers/:id` | schooladmin          | `pages/teachers/index.vue` · `pages/teachers/[id].vue` |
| `/students` · `/students/:id` | schooladmin          | `pages/students/index.vue` · `pages/students/[id].vue` |
| `/holidays`                   | schooladmin          | `pages/holidays.vue` |
| `/messages`                   | schooladmin          | `pages/messages.vue` |
| `/reports`                    | schooladmin          | `pages/reports.vue` |
| `/mark-attendance`            | teacher              | `pages/mark-attendance.vue` |
| `/my-class`                   | teacher              | `pages/my-class.vue` |
| `/report-cards/...`           | schooladmin, teacher | `pages/report-cards/**` |

## Vercel Deployment

`nuxt.config.ts` sets `nitro.preset: 'vercel'`. Env vars on Vercel:

| Var | Source |
|---|---|
| `SUPABASE_URL` | Supabase → Settings → API |
| `SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API (admin only — never client-side) |
| `POSTGRES_URL_NON_POOLING` | For one-off `psql` migrations |
