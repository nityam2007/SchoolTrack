# Module: Principal — Holiday Management

> **Tab key:** `holidays`  
> **Component:** `HolidaysPage`  
> **Role:** Principal (School Admin)

## Purpose

Add and manage school holidays. Holidays block attendance marking for teachers.

## UI Structure

```
┌──────────────────────────────────────────────┐
│  Holiday Management                           │
├──────────────────────────────────────────────┤
│  Add Holiday                                  │
│  [ 📅 Date ] [ Holiday Title         ] [Add] │
├──────────────────────────────────────────────┤
│  Date         │ Title              │ Day     │ Actions │
│  25 Mar 2026  │ Holi               │ Wednesday│[Remove]│
│  14 Apr 2026  │ Dr. Ambedkar Jayanti│ Tuesday │[Remove]│
└──────────────────────────────────────────────┘
```

## Add Holiday Form (inline, not modal)

| Field | Type | Required |
|---|---|---|
| Date | Date picker | ✅ |
| Title | Text | ✅ |

## Table Columns

| Column | Content |
|---|---|
| Date | Formatted: `25 Mar 2026` |
| Title | Holiday name |
| Day | Badge (purple): day of week |
| Actions | Remove button (red) |

## Logic

- Auto-generates ID: `H` + timestamp
- Sorted by date ascending
- Scoped to `schoolId`
- When a holiday matches today's date, teachers see "Today is a Holiday!" instead of attendance form
