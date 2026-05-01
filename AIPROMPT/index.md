# SchoolTrack — AIPROMPT Modules Index

> Master index linking every specification module for the SchoolTrack multi-tenant SaaS.

## 📁 Directory Structure

```
AIPROMPT/
├── core/           ← Project-level docs
├── ui/             ← Shared UI & auth
├── superadmin/     ← Super Admin modules
├── principal/      ← Principal (School Admin) modules
├── teacher/        ← Teacher modules
└── features/       ← Feature specs (pricing, whatsapp)
```

## Core (`core/`)

| File | Description |
|---|---|
| [readme.md](./core/readme.md) | Project overview & goals |
| [style.md](./core/style.md) | Design tokens, typography, color palette |
| [rules.md](./core/rules.md) | Business rules, RBAC & access control |
| [architecture.md](./core/architecture.md) | Multi-tenant SaaS architecture |
| [changelog.md](./core/changelog.md) | Version changelog (append-only at top) |

## Shared UI (`ui/`)

| File | Description |
|---|---|
| [components.md](./ui/components.md) | Reusable UI components (Stat, Badge, Table, Modal…) |
| [auth-login.md](./ui/auth-login.md) | Login screen & authentication flow |
| [sidebar-navigation.md](./ui/sidebar-navigation.md) | Sidebar menu per role |

## Super Admin (`superadmin/`)

| File | Description |
|---|---|
| [superadmin-dashboard.md](./superadmin/superadmin-dashboard.md) | Platform overview dashboard |
| [superadmin-schools.md](./superadmin/superadmin-schools.md) | School CRUD, enable/disable, credentials |
| [superadmin-credits.md](./superadmin/superadmin-credits.md) | Credit top-up management |
| [superadmin-analytics.md](./superadmin/superadmin-analytics.md) | Platform-wide analytics |

## Principal / School Admin (`principal/`)

| File | Description |
|---|---|
| [principal-dashboard.md](./principal/principal-dashboard.md) | School dashboard with today's stats |
| [principal-attendance.md](./principal/principal-attendance.md) | Attendance records viewer (read-only) |
| [principal-teachers.md](./principal/principal-teachers.md) | Teacher management |
| [principal-students.md](./principal/principal-students.md) | Student roster management |
| [principal-holidays.md](./principal/principal-holidays.md) | Holiday calendar management |
| [principal-messages.md](./principal/principal-messages.md) | WhatsApp absence notifications |
| [principal-reports.md](./principal/principal-reports.md) | Class & student attendance reports |

## Teacher (`teacher/`)

| File | Description |
|---|---|
| [teacher-dashboard.md](./teacher/teacher-dashboard.md) | Teacher home with status card |
| [teacher-mark-attendance.md](./teacher/teacher-mark-attendance.md) | Attendance marking + camera proof |
| [teacher-myclass.md](./teacher/teacher-myclass.md) | Class roster & today's status |

## Features (`features/`)

| File | Description |
|---|---|
| [pricing.md](./features/pricing.md) | Credit-based pricing system |
| [whatsapp.md](./features/whatsapp.md) | WhatsApp notification integration |
| [report-cards.md](./features/report-cards.md) | Subjects, exams, marks, A4 print view |
| [supabase.md](./features/supabase.md) | Schema, RLS, Auth, deployment runbook |
