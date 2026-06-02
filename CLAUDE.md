# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Working agreements (read first)

- **Never create standalone scripts** (e.g. files in `scripts/`, one-off `.mjs`/`.sh` helpers, puppeteer smoke tests, debug/repro scripts) **unless the user explicitly asks for one.** Prefer fixing the source directly and verifying by other means. Do not add new files to `scripts/` on your own initiative.

## Project

**SchoolTrack** — multi-tenant SaaS for K-12 attendance and report cards. Stack: Nuxt 3 + PrimeVue v4 (custom Aura "SchoolTrack" preset) + Tailwind v3 + Pinia + `@nuxtjs/supabase`. Deployed to Vercel (`nitro.preset = 'vercel'`).

Tenant boundary is `school_id`. There are three roles: `superadmin`, `schooladmin` (principal), `teacher`.

## Commands

```bash
npm run dev         # nuxt dev --dotenv .env.local --host
npm run build       # nuxt build --dotenv .env.local
npm run typecheck   # nuxt typecheck (vue-tsc)
npm run preview     # local prod preview
```

All scripts pass `--dotenv .env.local` — env lives in `.env.local`, not `.env`. Required keys: `SUPABASE_URL`, `SUPABASE_ANON_KEY` (client) and `SUPABASE_SERVICE_ROLE_KEY` (server-only, used by `/api/admin/*`).

### Database / seed

Migrations live in `supabase/migrations/` and are applied via plain `psql` against `POSTGRES_URL_NON_POOLING` (not the Supabase CLI). Always run in order:

```bash
psql "$POSTGRES_URL_NON_POOLING" -f supabase/migrations/0001_init.sql
psql "$POSTGRES_URL_NON_POOLING" -f supabase/migrations/0002_messages_decrement_credits.sql
psql "$POSTGRES_URL_NON_POOLING" -f supabase/migrations/0003_backfill_profiles.sql
psql "$POSTGRES_URL_NON_POOLING" -f supabase/migrations/0004_perf_rls_indexes.sql
node scripts/seed-users.mjs   # demo auth users (see SETUP.md for credentials)
```

`0004_perf_rls_indexes.sql` is a safe, idempotent perf migration — it recreates every RLS policy with InitPlan-wrapped helper calls (`(select public.fn())`, evaluated once per statement instead of per row) and adds `marks(school_id)` / `messages(school_id, date desc)` indexes. No data changes; re-runnable.

`0001_init.sql` does a destructive drop/rebuild of `public`. Don't run it against a database you care about without confirming first.

### Smoke tests (puppeteer-core, hits the running dev server)

```bash
node scripts/verify-ui-full.mjs        # login + nav as all 3 roles
node scripts/verify-detail-pages.mjs   # /schools/:id, /students/:id, /teachers/:id
node scripts/verify-role-guards.mjs    # cross-role access bounces to /dashboard
node scripts/verify-send-messages.mjs  # principal → WhatsApp send → credit decrement
node scripts/repro-all-writes.mjs      # RLS write sanity across roles (no UI)
node scripts/diagnose-rls.mjs          # check profiles row exists for every auth user
```

All puppeteer scripts hardcode `/usr/bin/google-chrome` and use `URL` env var to override target (defaults to `http://localhost:3000`).

## Architecture

### Auth — JWT-first, profile reconciled in background

`stores/auth.ts::refresh()` builds the in-memory user from **`app_metadata`** on the JWT (role, school_id, teacher_id, class_id), then kicks off a non-awaited `profiles` read to upgrade `full_name` etc. Reason: calling `.from('profiles')` synchronously during hydration deadlocks `supabase-js`, and the route middleware needs role data immediately. Don't change `refresh()` to await the DB read on the hot path.

A singleton `inflightRefresh` promise dedupes overlapping callers (route middleware fires `refresh()` at the same time the `onAuthStateChange` listener does on first load) — they share one in-flight refresh.

**Authorization data lives in `app_metadata`, not `user_metadata`.** `user_metadata` is user-writable via `auth.updateUser({ data })` and must never be trusted for role/scope. Only `full_name` (display) flows through it. The `handle_new_user` and `sync_profile_from_app_metadata` triggers in `0001_init.sql` enforce this.

### Three-tier role guard

Routes are gated by `ROLE_RULES` in `utils/role.ts` (single source of truth, keyed by path prefix). Three enforcement points:

1. `middleware/auth.global.ts` — navigation-time check. Runs client-only because the Supabase session is in cookies; SSR would unconditionally bounce to `/login`. During hydration it fires `refresh()` without awaiting (mutating reactive state mid-hydration causes mismatch errors) — the plugin guard catches up.
2. `plugins/role-guard.client.ts` — reactive watcher on `(route.path, auth.user, auth.initialized)`. Catches the case where SSR served a page before auth resolved.
3. `middleware/{super-admin,principal,teacher}-only.ts` — per-page belt-and-braces via `requireRole(...)`. Use these on new gated pages.

When adding a role-gated route, update **both** `ROLE_RULES` and (if you want defense in depth on hard-reload) the page's `definePageMeta({ middleware: '…-only' })`.

### Pinia stores

- `stores/auth.ts` — login/logout, JWT-based user shape, plus **real superadmin impersonation**: `/api/admin/impersonate` issues a magic-link `hashed_token` which the client verifies via `auth.verifyOtp` to swap the browser's session to the target. The SA's original refresh token is stashed in `sessionStorage` under `st:impersonate` so `exitImpersonation()` can restore it. RLS treats the impersonator as the target — there is no client-side bypass.
- `stores/db.ts` — **phased loader** (perf-critical, do not collapse back into one eager pull). After sign-in, `plugins/db-loader.client.ts` calls `loadAll()`, which loads in two phases plus one lazy table:
  1. **Phase 1 (awaited)** — core tables bounded by school structure: `schools`, `classes`, `teachers`, `students`, `subjects`, `exams`, `holidays`. Flips `loaded` so the shell + dashboards paint immediately.
  2. **Phase 2 (`loadActivity()`, background, non-blocking)** — daily-growth tables: `attendance`, `messages`. Pages read them reactively as they arrive (`activityLoaded`).
  3. **`marks` is lazy** — the largest table, used only by report cards / student exam history. It is never part of the eager load; pages that need it call `db.ensureMarks()` in `onMounted` (`marksLoaded`).
  `db.reload()` forces a full re-fetch (used by the "Reload data" menu). RLS does the row filtering — the same query returns different rows per role. Mutations call `useSb().from(...).insert/update/delete()` then patch local state. **Why phased:** the old single eager pull shipped every attendance row, mark, and message to the browser on login — unbounded, and for a superadmin it was the whole platform. Phasing keeps first paint fast as data grows.
- `activeSchoolId` getter — for principal-scoped pages, returns the user's `school_id` for principals, or `selectedSchoolId` (persisted in `localStorage`) for superadmins. Use this, not raw `auth.schoolId`, when fetching school-scoped data — it keeps the SA "view as school" switcher working.

### `useSb()` — typed Supabase client

`composables/useSb.ts` returns `useSupabaseClient() as SupabaseClient` (untyped). Hand-written interfaces in `types/database.ts` are the source of truth for table shapes — we do **not** generate the `Database<T>` types from Supabase. Always go through `useSb()` so we have one place to flip if we ever generate types.

### Server routes and the admin client

`server/utils/admin.ts::getAdminClient()` is a singleton service-role client. Use only from server routes that have first called `requireSuperadmin(event)`. Never import it from client code; never expose `SUPABASE_SERVICE_ROLE_KEY` to the bundle. The runtime config in `nuxt.config.ts` deliberately keeps it out of `public`.

### RLS model

Every tenant table has four policies in `0001_init.sql`:

- `*_super_all` — superadmin full access via `is_super_admin()`.
- `*_tenant_select` — anyone in the school can read.
- `*_principal_write` — `schooladmin` can write within their school.
- `attendance_teacher_write`, `marks_teacher_write` — teachers can only write rows scoped to their own `class_id`.

All four helper functions (`current_role`, `current_school_id`, `current_class_id`, `is_super_admin`) are `security definer` and read from `public.profiles`. **If a `profiles` row is missing or stale, every write silently 403s with "new row violates RLS"** — `0003_backfill_profiles.sql` exists to repair this and is safe to re-run. `scripts/diagnose-rls.mjs` is the first thing to run when a user reports writes failing.

### Credit decrement is a DB trigger, not client code

Principals can't update `schools` (write-locked to SA). Instead, `0002_messages_decrement_credits.sql` defines a `BEFORE INSERT` trigger on `messages` that locks the school row, refuses the insert when `credits < 1`, and decrements atomically. The trigger is `security definer` so it bypasses RLS on `schools` while the original `messages` insert is still authorized by `messages_principal_write`. Don't reintroduce client-side credit updates.

### PrimeVue + Tailwind layer ordering

`nuxt.config.ts` configures PrimeVue's `cssLayer` order as `tailwind-base, primevue, tailwind-utilities`. `assets/css/main.css` **must mirror this**:

```css
@layer tailwind-base, primevue, tailwind-utilities;
@layer tailwind-base { @tailwind base; }
@tailwind components;
@layer tailwind-utilities { @tailwind utilities; }
```

Without this, Tailwind preflight `input { padding: 0 }` clobbers PrimeVue `IconField` padding and leading icons overlap input text. If you touch `main.css` and inputs look broken, check the layer order first.

The custom PrimeVue preset is in `theme/preset.ts` (Aura tinted with the "Alytics" brand blue `#126dfb`). The app is **light mode** — there is no `app-dark` class on `<html>`, so PrimeVue uses its light colorScheme. The Tailwind design tokens in `tailwind.config.js` (`bg`/`surface`/`card`/`line`/`ink`/`muted`/`accent` …) hold the light palette; `assets/css/main.css` sets the periwinkle page background and `layouts/default.vue` renders the framed white app shell. Fonts: `Geist` (UI) + `Host Grotesk` (display), loaded in `nuxt.config.ts`.

### Dates

Use `todayLocal()` from `composables/useDate.ts`, never `new Date().toISOString().slice(0,10)`. The latter rolls over at UTC midnight, which is 5:30 AM IST — attendance marked after 18:30 IST would land on the wrong day.

### Layout / `<ClientOnly>` discipline

Pages render auth-conditional UI, but auth is hydrated only on the client. `layouts/default.vue` wraps the sidebar, top nav, and the `<slot />` itself in `<ClientOnly>` with a skeleton fallback. Add new top-level chrome that depends on `auth` inside the same `<ClientOnly>` pattern or you'll get hydration mismatch warnings.

## Reference docs

`AIPROMPT/` contains the product spec (per-role module breakdowns under `superadmin/`, `principal/`, `teacher/`, plus `core/rules.md` for RBAC and `features/supabase.md` for the schema runbook). Treat these as the source-of-truth for *what each screen should do*; the code is the source of truth for *how it does it*. `SETUP.md` has demo login credentials and a layout overview.
