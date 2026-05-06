# SchoolTrack — Changelog

> Append new entries at the **top**. Never edit existing entries.

---

## v2.1.1 — 2026-05-01

### Fixed — RLS violation on WhatsApp send
- Sending absence notifications as a **principal** failed with
  `new row violates row-level security policy for table "schools"`.
  The page was inserting message rows (allowed by
  `messages_principal_write`) and then UPDATEing `schools.credits`
  client-side; the `schools` table only allows writes for super admins.
- Fix: new migration **`supabase/migrations/0002_messages_decrement_credits.sql`**
  registers a `BEFORE INSERT` trigger on `messages` that runs
  `SECURITY DEFINER`, takes a row lock on the school, refuses the insert
  when `credits < 1` (raises `check_violation`), then decrements credits
  by 1. The client no longer touches the schools table at all.
- `pages/messages.vue` re-fetches `schools.credits` via SELECT (RLS-allowed
  by `schools_tenant_select`) after the insert so the topbar chip and
  page header show the new balance immediately.
- Concurrency safe: per-row `for update` lock + per-row trigger means
  batch sends to a school with `credits < N` abort the whole transaction —
  no partial sends, no negative balances.

## v2.1.0 — 2026-05-01

### Added — drill-down detail pages
- `pages/schools/[id].vue` — single-school view (super admin):
  KPIs, classes list, teachers list, top-up dialog, enable/disable.
- `pages/students/[id].vue` — single-student view (principal):
  profile, attendance history (paginated), exam results with quick links to
  the printable report card.
- `pages/teachers/[id].vue` — single-teacher view (principal):
  contact, assigned-class roster (clickable through to student detail),
  reassign-class dialog, today's attendance + 30-day rate KPI.
- Tables on the listing pages now navigate to the detail page on row click;
  per-row Action buttons stop propagation.

### Fixed — UI / UX
- **Icon overlap inside `<IconField>` inputs.** Tailwind's `preflight` set
  `padding: 0` on every `<input>` from the default `@layer base`, which
  beat PrimeVue's `.p-iconfield .p-inputtext { padding-inline-start: ... }`.
  `assets/css/main.css` now wraps `@tailwind base` in
  `@layer tailwind-base` and `@tailwind utilities` in
  `@layer tailwind-utilities`, matching the layer order declared in
  `nuxt.config.ts → primevue.options.theme.options.cssLayer`.
- Removed dead Search input + Notifications bell from top nav (no behaviour
  was wired).
- Replaced `confirm()` with PrimeVue `ConfirmDialog` for student & holiday
  removal; consistent destructive-action styling and works in headless
  environments.
- Dashboard guards the principal `schoolStats` against a missing/RLS-hidden
  school row, plus an explicit empty state for "no school assigned" and
  "no class linked" so the page never renders blank.
- WhatsApp message preview now renders the first selected absentee's name
  and class so admins see the real outgoing message, not generic
  `[Student]/[Class]` tokens.

### Security / hardening
- Centralised role-gate in **`middleware/auth.global.ts`** + a client-side
  watch in `plugins/role-guard.client.ts` that re-checks on every route +
  auth-state change. Per-page middleware (`super-admin-only`,
  `principal-only`, `teacher-only`) is kept for client navigations but is
  no longer load-bearing on hydration.
- `stores/auth.ts → refresh()` now:
  - dedups concurrent callers via a module-level inflight promise to avoid
    deadlocking supabase-js when route middleware and the
    `onAuthStateChange` listener both fire in the same tick;
  - reads role + tenant scope from the JWT's `app_metadata`
    (admin-writable only) instead of waiting on a `.from('profiles')` query
    that can stall on full-page hydration when the auth lock from the
    previous navigation context is still held; the DB profile is reconciled
    in the background.
- `layouts/default.vue` wraps the page slot, sidebar, top-nav and toast in
  `<ClientOnly>` because the auth store is hydrated client-side; this
  eliminates SSR/CSR hydration mismatch warnings and the intermittent
  `insertBefore` `NotFoundError`.
- Schools generate IDs with `Date.now().toString(36).toUpperCase()` instead
  of `length+1` (which collided after deletes).
- `today` everywhere now goes through `composables/useDate.ts → todayLocal()`
  so attendance recorded near IST midnight stays on the correct local day.

### Infrastructure
- `scripts/verify-role-guards.mjs` — Puppeteer test that asserts every
  cross-role URL bounces to `/dashboard`.
- `tailwind.config.js` defines the missing `accentGlow` colour referenced by
  the marks-entry roster selection.

---

## v2.0.0 — 2026-05-01

### Migrated
- React 18 + Vite → **Nuxt 3 + TypeScript** (file-based router, auto-imports)
- Inline-CSS UI → **PrimeVue v4 + Tailwind v3** (Aura preset via `@primeuix/themes`)
- `useState` seed → **Pinia stores** (`stores/auth.ts`, `stores/db.ts`)
- Client-side mock auth → **Supabase Auth** (`signInWithPassword`)
- In-memory seed → **Supabase Postgres** with RLS policies enforcing
  per-tenant `school_id` isolation and per-class teacher writes.

### Added
- `subjects`, `exams`, `marks` tables → **Report Card** module
  - Principal: Exam Setup with status lifecycle (`upcoming → open → closed`)
  - Teacher: Marks Entry (theory + practical, auto-grade)
  - Both: Dashboard with grade distribution + subject averages
  - Printable A4 view (`pages/report-cards/[examId]/[studentId].vue`)
- Sticky top nav with page title, search, credits badge, user menu
- `scripts/seed-users.mjs` to provision demo `auth.users` via service-role API
- `server/api/health.get.ts` smoke endpoint
- Vercel deployment preset (`nitro.preset: 'vercel'`)

### Removed
- Root React entry (`src/main.jsx`, `index.html`, `vite.config.js`) — moved
  to `TEMPLATE/SchoolTrack.jsx` for reference only.

---

## v1.0.0 — 2026-03-23

### Added
- Multi-tenant SaaS with 3 roles: Super Admin, Principal, Teacher
- Login screen with role picker and demo account hints
- Super Admin: Dashboard, Schools CRUD, Credits, Analytics
- Principal: Dashboard, Attendance viewer, Teachers, Students, Holidays, WhatsApp Messages, Reports
- Teacher: Dashboard, Mark Attendance (with camera photo proof), My Class
- Credit-based WhatsApp messaging system
- Holiday management blocking attendance
- Seed data for 3 schools, 3 classes, 3 teachers, 11 students
- Dark-mode-only design with DM Sans + Space Grotesk
- Vite + React 18 project scaffold
