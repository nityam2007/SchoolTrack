# SchoolTrack — Nuxt 3 Setup

Multi-tenant SaaS attendance management. Migrated from React/Vite (`TEMPLATE/SchoolTrack.jsx`) to **Nuxt 3 + PrimeVue v4 (Aura) + Tailwind v3 + Pinia + @nuxtjs/supabase**.

## Install & Run

The repo previously had a React + Vite scaffold. The old `node_modules/` is React-only — wipe it before installing:

```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

Open http://localhost:3000

## Demo Logins

| Role | Email | Password |
|---|---|---|
| Super Admin | `admin@schooltrack.in` | `admin123` |
| Principal — Greenwood | `principal@greenwood.edu` | `school123` |
| Principal — Sunrise | `principal@sunrise.edu` | `sunrise123` |
| Principal — Blue Ridge | `principal@blueridge.edu` | `blueridge123` |
| Teacher — Ms. Priya | `priya@greenwood.edu` | `teacher123` |
| Teacher — Mr. Rahul | `rahul@greenwood.edu` | `rahul123` |
| Teacher — Ms. Anita | `anita@greenwood.edu` | `anita123` |

The login page has a "Demo Accounts — click to fill" panel that auto-populates.

## Project Layout

```
ROHAN/
├── app.vue                     # Root component
├── error.vue                   # Error boundary
├── nuxt.config.ts              # Modules, PrimeVue Aura preset, Vercel preset
├── tailwind.config.js          # Dark-mode SchoolTrack tokens + tailwindcss-primeui
├── postcss.config.js
├── tsconfig.json
├── package.json
├── .env.example                # Supabase credentials template
├── assets/css/main.css         # Tailwind + design-token utilities (.st-card, .st-input…)
├── components/
│   ├── AppSidebar.vue          # 220px fixed sidebar, role-driven menu
│   ├── AppTopNav.vue           # Top bar: page title, search, credits, user menu
│   └── StatCard.vue            # Reusable KPI card
├── composables/
│   └── useNav.ts               # Role → menu items mapping
├── layouts/
│   ├── default.vue             # Sidebar + topnav + slot
│   └── auth.vue                # Centered slot for /login
├── middleware/
│   └── auth.global.ts          # Route guard
├── pages/                      # File-based router
│   ├── index.vue               # Redirects to /dashboard
│   ├── login.vue
│   ├── dashboard.vue           # Renders different content per role
│   ├── schools.vue             # superadmin
│   ├── credits.vue             # superadmin
│   ├── analytics.vue           # superadmin
│   ├── attendance.vue          # principal
│   ├── teachers.vue            # principal
│   ├── students.vue            # principal
│   ├── holidays.vue            # principal
│   ├── messages.vue            # principal
│   ├── reports.vue             # principal
│   ├── mark-attendance.vue     # teacher
│   └── my-class.vue            # teacher
├── stores/
│   ├── auth.ts                 # Login/logout, current user
│   └── db.ts                   # Schools/classes/teachers/students/attendance/holidays/messages
├── types/
│   └── database.ts             # TypeScript interfaces for all entities
└── server/api/
    └── health.get.ts           # Health endpoint + Supabase smoke test
```

## Supabase

Copy `.env.example` to `.env` and fill in your project URL + anon key:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-public-key
```

The `@nuxtjs/supabase` module auto-imports `useSupabaseClient()` (client-side) and `serverSupabaseClient(event)` (server-side). Auth redirect is disabled (`redirect: false`) because we currently use a client-side mock auth via Pinia (`stores/auth.ts`); swap to Supabase auth when the backend tables exist.

The Pinia `db` store is currently seeded in-memory (mirrors `TEMPLATE/SchoolTrack.jsx`). Replace each action with Supabase calls when the schema is provisioned. Suggested table mapping is in [types/database.ts](./types/database.ts).

## Vercel Deployment

`nuxt.config.ts` already sets `nitro.preset: 'vercel'`. After pushing to GitHub:

1. Import the repo in Vercel
2. Set `SUPABASE_URL` and `SUPABASE_KEY` in project env vars
3. Build command auto-detected (`nuxt build`)

## Cleanup of Old React Files

These leftovers from the React/Vite scaffold are now unused — safe to delete:

```
src/                  # main.jsx
index.html            # superseded by app.vue
vite.config.js        # superseded by nuxt.config.ts
```

## What's Next

- Wire `stores/db.ts` actions to Supabase tables.
- Replace the client-side `stores/auth.ts` with Supabase Auth (the module supports it).
- Port the rest of `TEMPLATE/SchoolTrack.jsx` modal flows (Add School, Add Student/Teacher) into PrimeVue `Dialog` components — the data layer is already wired in `db.ts`.
- Port `TEMPLATE/SchoolTrack_ReportCard.jsx` as a printable per-student route (`pages/report-card/[id].vue`).
