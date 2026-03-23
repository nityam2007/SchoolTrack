# Module: Principal — Students Management

> **Tab key:** `students`  
> **Component:** `StudentsPage`  
> **Role:** Principal (School Admin)

## Purpose

Full student roster management. Search, add, and remove students.

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
| Search | Filters by name (case-insensitive) OR roll number |
| Remove | Red button, removes student from db immediately |

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
