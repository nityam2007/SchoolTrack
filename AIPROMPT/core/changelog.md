# SchoolTrack — Changelog

> Append new entries at the **top**. Never edit existing entries.

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
