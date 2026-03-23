# Module: Teacher — Dashboard

> **Tab key:** `dashboard`  
> **Component:** `TeacherDashboard`  
> **Role:** Teacher only

## Purpose

Quick status view: assigned class, student count, and whether today's attendance is submitted.

## UI Structure

```
┌────────────────────────────────────────────────────┐
│  Good morning, Priya! 👋                            │
├──────────────┬──────────────┬───────────────────────┤
│ My Class     │ Total        │ Today's Status        │
│ Grade 5A     │ Students     │ Pending / Submitted   │
│              │ 6            │ / Holiday             │
├──────────────┴──────────────┴───────────────────────┤
│  ⏰ Attendance for today hasn't been marked yet.    │  ← yellow warning (if pending)
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │ ✅  Today's attendance submitted              │  │  ← green card (if done)
│  │     4 present · 2 absent · Photo proof saved  │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Stat Cards (grid3)

| Label | Value | Color |
|---|---|---|
| My Class | Class name | accent |
| Total Students | Count | accent |
| Today's Status | "Holiday" / "Submitted" / "Pending" | amber / green / red |

## Conditional Alerts

| Condition | Display |
|---|---|
| Holiday today | No alert shown |
| Not marked + not holiday | ⏰ amber warning banner |
| Already marked | ✅ green card with present/absent counts |
