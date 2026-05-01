# SchoolTrack — README

## What Is It?

SchoolTrack is a **multi-tenant SaaS** platform for K-12 schools covering:

- Daily attendance with classroom photo proof
- WhatsApp absence notifications (credit-based)
- **Academic report cards** (subjects, exams, marks, grading scale, A4 print view)
- Multi-school administration

## Roles

| Role | Scope | Count |
|---|---|---|
| **Super Admin** | Entire platform | Multiple |
| **Principal (School Admin)** | One school | 1 per school |
| **Teacher** | One class | Many per school |

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Nuxt 3 (TypeScript) |
| UI | PrimeVue v4 + Tailwind v3 (Aura preset, dark-only) |
| State | Pinia |
| Auth & DB | Supabase (Postgres + Auth + RLS) |
| Hosting | Vercel (`nitro.preset: 'vercel'`) |

## Getting Started

```bash
cp .env.example .env.local                 # or run `vercel pull`
npm install
npm run dev                                # http://localhost:3000
```

To rebuild the database (drop + rebuild + seed):

```bash
psql "$POSTGRES_URL_NON_POOLING" -f supabase/migrations/0001_init.sql
psql "$POSTGRES_URL_NON_POOLING" -f supabase/seed.sql
node scripts/seed-users.mjs                # creates demo auth users
```

## Demo Logins

| Role | Email | Password |
|---|---|---|
| Super Admin | `admin@schooltrack.in` | `admin123` |
| Principal — Greenwood | `principal@greenwood.edu` | `school123` |
| Principal — Sunrise | `principal@sunrise.edu` | `sunrise123` |
| Principal — Blue Ridge | `principal@blueridge.edu` | `blueridge123` |
| Teacher — Ms. Priya (5A) | `priya@greenwood.edu` | `teacher123` |
| Teacher — Mr. Rahul (5B) | `rahul@greenwood.edu` | `rahul123` |
| Teacher — Ms. Anita (6A) | `anita@greenwood.edu` | `anita123` |
