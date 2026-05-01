# Module: Login & Authentication

> **Route:** `/login`
> **Page:** [`pages/login.vue`](../../pages/login.vue)
> **Layout:** [`layouts/auth.vue`](../../layouts/auth.vue)
> **Store:** [`stores/auth.ts`](../../stores/auth.ts)
> **Guard:** [`middleware/auth.global.ts`](../../middleware/auth.global.ts)

## Flow

```
┌─────────────────────────────────────────────────────────┐
│  ┌─────────┐                                            │
│  │   🏫    │  SchoolTrack — Attendance + Report Cards   │
│  └─────────┘                                            │
│                                                         │
│  Demo accounts (click to fill)                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Platform Admin              [Super Admin]      │    │
│  │  Greenwood Academy           [Principal]        │    │
│  │  Ms. Priya Sharma (Grade 5A) [Teacher]          │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  [Email]                                                │
│  [Password ████████▾]                                   │
│                                                         │
│  [ Sign In  → ]                                         │
└─────────────────────────────────────────────────────────┘
```

The role is **not** picked manually. Supabase Auth identifies the user and
the linked `profiles` row dictates role/scope.

## Wire-up

1. User clicks Sign In → `auth.login(email, password)` → `supabase.auth.signInWithPassword(...)`.
2. On success, `auth.refresh()` reads `public.profiles` and builds an `AuthUser`.
3. `plugins/db-loader.client.ts` watches `auth.isAuthenticated` and triggers `db.loadAll()`.
4. The global middleware redirects to `/dashboard`.

## Errors

`auth.error` is bound to `<Message severity="error">`. Supabase returns:
- `Invalid login credentials` — wrong email/password.
- `Email not confirmed` — only if `email_confirm` was skipped during seed
  (the seed script sets it true).

## Sign Out

Top-nav user menu → Sign Out → `auth.logout()` →
`supabase.auth.signOut()` → guard redirects to `/login`.
