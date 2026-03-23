# Module: Principal — Attendance Reports

> **Tab key:** `reports`  
> **Component:** `ReportsPage`  
> **Role:** Principal (School Admin)

## Purpose

Class-wise and student-wise attendance analytics with percentage bars.

## UI Structure

```
┌───────────────────────────────────────────────────┐
│  Attendance Reports                                │
│                                                    │
│  Today's Class Summary — 23 Mar 2026               │
│  ┌─────────────┐ ┌─────────────┐ ┌──────────────┐│
│  │  Grade 5A   │ │  Grade 5B   │ │  Grade 6A    ││
│  │  ✓ 4 Present│ │  ✓ 0 Present│ │  ✓ 0 Present ││
│  │  ✗ 2 Absent │ │  ✗ 0 Absent │ │  ✗ 0 Absent  ││
│  │  ████████░░ │ │  ░░░░░░░░░░ │ │  ░░░░░░░░░░  ││
│  │  67%        │ │  0%         │ │  0%          ││
│  └─────────────┘ └─────────────┘ └──────────────┘│
│                                                    │
│  Student Attendance Analytics                      │
│  Student    │ Class    │ Days │ Present │ Attend.% │
│  Aarav Patel│ Grade 5A │ 1    │ 1       │ ██ 100%  │
│  Diya Singh │ Grade 5A │ 1    │ 0       │ ░░   0%  │
│  Kabir…     │ Grade 5A │ 1    │ 1       │ ██ 100%  │
└───────────────────────────────────────────────────┘
```

## Class Summary Cards (grid3)

| Element | Detail |
|---|---|
| Class name | Bold heading |
| Present | Green checkmark + count |
| Absent | Red cross + count |
| ProgressBar | Green color |
| Percentage | Muted text below bar |

## Student Analytics Table

| Column | Content |
|---|---|
| Student | Bold name |
| Class | Class name |
| Days Tracked | Total attendance records |
| Present | Present count |
| Attendance % | Inline ProgressBar + colored percentage (green ≥75%, amber ≥50%, red <50%) |

## Data Scope

- Class summary: today's date only
- Student analytics: all-time records
- Scoped to `schoolId`
