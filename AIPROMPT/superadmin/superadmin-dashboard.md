# Module: Super Admin — Dashboard

> **Tab key:** `dashboard`  
> **Component:** `SuperDashboard`  
> **Role:** Super Admin only

## Purpose

Platform-wide overview showing all schools, total students, messages, and credits.

## UI Structure

```
┌─────────────────────────────────────────────────────┐
│  Platform Overview                                   │
├────────────┬────────────┬────────────┬────────────────┤
│ Total      │ Total      │ Messages   │ Platform       │
│ Schools    │ Students   │ Sent       │ Credits        │
│ [3]        │ [955]      │ [2]        │ [1158]         │
├────────────┴────────────┴────────────┴────────────────┤
│                                                       │
│  ┌─ School Credit Status ──┐  ┌─ Schools ───────────┐│
│  │  Greenwood   420 credits│  │  Greenwood Academy   ││
│  │  ████████░░░░░░░░░░░░░░ │  │  Mumbai · 312 ● Act ││
│  │  Sunrise      88 credits│  │  Sunrise Public      ││
│  │  ███░░░░░░░░░░░░░░░░░░░ │  │  Delhi · 198  ● Act ││
│  │  Blue Ridge  650 credits│  │  Blue Ridge Intl     ││
│  │  ████████████████░░░░░░ │  │  Bangalore · 445     ││
│  └─────────────────────────┘  └──────────────────────┘│
└───────────────────────────────────────────────────────┘
```

## Stat Cards (grid4)

| Label | Value | Color |
|---|---|---|
| Total Schools | `schools.length` | accent |
| Total Students | sum of `school.students` | purple |
| Messages Sent | `messages.length` | green |
| Platform Credits | sum of `school.credits` | amber |

## Panels (grid2)

1. **School Credit Status** — ProgressBar per school, max scale 500
2. **Schools List** — Name, city, student count, Active/Inactive badge
