# Module: Super Admin — Analytics

> **Tab key:** `analytics`  
> **Component:** `AnalyticsPage`  
> **Role:** Super Admin only

## Purpose

Platform-wide attendance analytics across all schools.

## UI Structure

```
┌──────────────────────────────────────────────────────┐
│  Platform Analytics                                   │
├────────────┬──────────────┬─────────────┬─────────────┤
│ Total      │ Overall      │ Schools     │ Total       │
│ Records    │ Attendance   │ Active      │ Messages    │
│ [6]        │ [67%]        │ [3]         │ [2]         │
├────────────┴──────────────┴─────────────┴─────────────┤
│  Attendance by School                                  │
│  ┌─────────────────────────────────────────────────┐  │
│  │  Greenwood Academy    Mumbai         67%        │  │
│  │  ██████████████░░░░░░░░░░░░░░░░░░░░             │  │
│  │  Sunrise Public       Delhi          —%         │  │
│  │  (no records)                                   │  │
│  │  Blue Ridge Intl      Bangalore      —%         │  │
│  │  (no records)                                   │  │
│  └─────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────┘
```

## Stat Cards (grid4)

| Label | Source | Color |
|---|---|---|
| Total Records | `attendance.length` | accent |
| Overall Attendance | `present / total * 100` | green |
| Schools Active | `schools.filter(active).length` | accent |
| Total Messages | `messages.length` | purple |

## Attendance by School Panel

Per school row:
- School name + city
- Percentage (green ≥75%, amber <75%)
- ProgressBar (hidden if no records)
