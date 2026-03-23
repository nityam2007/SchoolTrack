# Module: Teacher — My Class

> **Tab key:** `myclass`  
> **Component:** `MyClass`  
> **Role:** Teacher only

## Purpose

View class roster and today's attendance status per student. Read-only.

## UI Structure

```
┌───────────────────────────────────────────┐
│  My Class — Grade 5A                       │
├─────────────┬─────────────┬────────────────┤
│ Total       │ Present     │ Absent         │
│ Students    │ Today       │ Today          │
│ [6]         │ [4]         │ [2]            │
├─────────────┴─────────────┴────────────────┤
│  Roll │ Name         │ Today's Status      │
│  01   │ Aarav Patel  │ ● Present           │
│  02   │ Diya Singh   │ ● Absent            │
│  03   │ Kabir Sharma │ ● Present           │
│  04   │ Meera Joshi  │ ● Present           │
│  05   │ Rohan Gupta  │ ● Absent            │
│  06   │ Sia Kumar    │ ● Present           │
└───────────────────────────────────────────┘
```

## Stat Cards (grid3)

| Label | Value | Color |
|---|---|---|
| Total Students | Count in class | accent |
| Present Today | status=present | green |
| Absent Today | status=absent | red |

## Table Columns

| Column | Content |
|---|---|
| Roll | Bold roll number |
| Name | Student name |
| Today's Status | Badge: green "present" / red "absent" / muted "Not Marked" |

## Restrictions

- ❌ Read-only — no editing students from this view
- ❌ Cannot mark attendance from here (use "Mark Attendance" tab)
