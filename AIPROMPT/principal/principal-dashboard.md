# Module: Principal — Dashboard

> **Tab key:** `dashboard`  
> **Component:** `SchoolDashboard`  
> **Role:** Principal (School Admin)

## Purpose

Today's attendance overview for the school with class-wise breakdown and absent student list.

## UI Structure

```
┌───────────────────────────────────────────────┐
│  Greenwood Academy              ● 420 Credits │
│  Today — 04 Mar 2026                          │
├───────────┬───────────┬───────────┬───────────┤
│ Total     │ Present   │ Absent    │ Attend.%  │
│ Students  │ Today     │ Today     │           │
│ [11]      │ [4]       │ [2]       │ [67%]     │
├───────────┴───────────┴───────────┴───────────┤
│                                               │
│ ┌─ Class-wise Summary ──┐ ┌─ Absent Today ──┐│
│ │  Grade 5A    4/6      │ │  Diya Singh     ││
│ │  ████████████░░░      │ │  Grade 5A · 02  ││
│ │  Grade 5B    0/3      │ │  Rohan Gupta    ││
│ │  ░░░░░░░░░░░░░░░      │ │  Grade 5A · 05  ││
│ │  Grade 6A    0/2      │ │                 ││
│ │  ░░░░░░░░░░░░░░░      │ │                 ││
│ └───────────────────────┘ └─────────────────┘│
└───────────────────────────────────────────────┘
```

## Stat Cards (grid4)

| Label | Value | Color |
|---|---|---|
| Total Students | Filtered by schoolId | accent |
| Present Today | status=present count | green |
| Absent Today | status=absent count | red |
| Attendance % | `present/(present+absent)*100` | purple |

## Panels (grid2)

1. **Class-wise Summary** — Per class: name, present/total, ProgressBar (green ≥75%, amber <75%)
2. **Absent Students** — Name, class, roll, ❌ icon. Shows "No absences recorded today." if empty.

## Data Scope

All data filtered by `schoolId`. Attendance filtered to today's date.
