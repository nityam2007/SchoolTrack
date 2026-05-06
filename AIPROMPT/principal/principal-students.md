# Module: Principal — Students Management

> **Path:** `/students`
> **File:** `pages/students/index.vue`
> **Detail page:** [`/students/:id`](./principal-student-detail.md)
> **Role:** Principal (School Admin)

## Purpose

Full student roster management. Search, add, and remove students.
Clicking a row opens the per-student detail (profile, attendance history,
exam results).

## UI Structure

```
┌──────────────────────────────────────────────────────┐
│  Students            [🔍 Search name/roll] [+ Add]   │
├──────────────────────────────────────────────────────┤
│  Roll │ Name         │ Class    │ Parent Phone│Action │
│  01   │ Aarav Patel  │ Grade 5A │ +9198000…   │[Remove]│
│  02   │ Diya Singh   │ Grade 5A │ +9198000…   │[Remove]│
│  03   │ Kabir Sharma │ Grade 5A │ +9198000…   │[Remove]│
└──────────────────────────────────────────────────────┘
```

## Features

| Feature | Detail |
|---|---|
| Row click / **Open** | Push to `/students/:id` |
| Search | Filters by name (case-insensitive) OR roll number |
| Remove | Uses PrimeVue `ConfirmDialog` (no browser `confirm()`); cascades to attendance & marks via RLS-aware FK |

## Table Columns

| Column | Content |
|---|---|
| Roll | Bold roll number |
| Name | Student name |
| Class | Looked up from classes by classId |
| Parent Phone | Phone number |
| Actions | Remove button (red) |

## Add Student Modal

```
┌─ Add Student ──────────────── × ─┐
│  [ Full Name              ]      │
│  [ Select Class ▾         ]      │
│  [ Roll Number            ]      │
│  [ Parent Phone (+91…)    ]      │
│  [ Add Student            ]      │
└──────────────────────────────────┘
```

| Field | Type | Required |
|---|---|---|
| Full Name | Text | ✅ |
| Class | Select (school's classes) | ✅ |
| Roll Number | Text | ✅ |
| Parent Phone | Text | ❌ |

## Logic

- Auto-generates ID: `S` + zero-padded index
- Scoped to `schoolId`
