# Module: Principal — Attendance Records

> **Tab key:** `attendance`  
> **Component:** `AttendancePage`  
> **Role:** Principal (School Admin)

## Purpose

View historical attendance records filtered by date and class. **Read-only** — Principal cannot edit attendance.

## UI Structure

```
┌───────────────────────────────────────────────────┐
│  Attendance Records                                │
│  [ 📅 2026-03-04 ]  [ All Classes ▾ ]             │
│  ● 4 Present  ● 2 Absent                          │
├───────────────────────────────────────────────────┤
│  Student      │ Class    │ Status  │ Photo │ Time  │
│  Aarav Patel  │ Grade 5A │ Present │ ✓ Saved│09:00 │
│  Diya Singh   │ Grade 5A │ Absent  │ ✓ Saved│09:00 │
│  Kabir Sharma │ Grade 5A │ Present │ ✓ Saved│09:00 │
└───────────────────────────────────────────────────┘
```

## Filters

| Filter | Type | Default |
|---|---|---|
| Date | Date picker | `2026-03-04` |
| Class | Select (All Classes + per-class) | `all` |

## Table Columns

| Column | Content |
|---|---|
| Student | Bold student name |
| Class | Class name |
| Status | Badge: green "present" / red "absent" |
| Photo Proof | Badge: green "✓ Saved" / red "Missing" |
| Time | Timestamp or "09:00 AM" default |

## Summary Badges

Inline badges above table: `X Present` (green) + `X Absent` (red)

## Restrictions

- ❌ Principal **cannot edit** attendance records
- ❌ Principal **cannot delete** attendance records
- ✅ View-only with filter controls
