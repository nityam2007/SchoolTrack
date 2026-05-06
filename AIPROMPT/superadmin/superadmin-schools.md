# Module: Super Admin — Schools Management

> **Path:** `/schools`
> **File:** `pages/schools/index.vue`
> **Detail page:** [`/schools/:id`](./superadmin-school-detail.md)
> **Role:** Super Admin only (`super-admin-only` middleware + global guard)

## Purpose

Schools list with add / enable / disable. Clicking a row drills down into
the per-school detail view (credits top-up, classes, teachers).

> **Note:** Login credentials are now managed in **Supabase Auth** directly
> (`scripts/seed-users.mjs` for demos, Supabase dashboard for production).
> The previous "Credentials" modal has been removed — `app_metadata.role`
> + `app_metadata.school_id` on the auth user is the source of truth.

## UI Structure

```
┌─────────────────────────────────────────────────────────┐
│  Schools                               [+ Add School]   │
├─────────────────────────────────────────────────────────┤
│  ID    │ Name     │ City   │ Students │ Credits │ Email │
│  SCH001│ Greenwood│ Mumbai │ 312      │ 420     │ p@g…  │
│        │          │        │          │         │       │
│  Password  │ Status   │ Actions                         │
│  ●●●●●●●● 👁│ ● Active │ [🔑 Credentials] [Disable]    │
└─────────────────────────────────────────────────────────┘
```

## Table Columns

| Column | Content |
|---|---|
| School ID | `SCH###` code badge |
| Name | Bold school name |
| City | Plain text |
| Credits | Green if ≥100, red if <100 |
| Status | Active/Inactive chip with status dot |
| Actions | **Open** (eye) → `/schools/:id`, plus Enable/Disable toggle |

Whole rows are clickable and open the detail page. Per-row buttons stop
propagation so clicking Disable doesn't also navigate away.

## Add School Modal

| Field | Type | Required |
|---|---|---|
| School Name | Text | ✅ |
| City | Text | ❌ |
| Credits | Number (default 200) | ❌ |

After creation an info `Message` reminds the operator to provision the
Principal's auth user separately in Supabase (Auth → Users) with
`app_metadata = { role: 'schooladmin', school_id: '<new id>' }`.

## Actions

| Action | Effect |
|---|---|
| Row click / **Open** | Push to `/schools/:id` (full detail) |
| Add School | Creates school with `SCH${Date.now().toString(36).toUpperCase()}` id (collision-safe across deletes) |
| Disable/Enable | Toggles `school.active` — disabled schools' users can't reach data via RLS |
