# Feature: Report Cards

> Routes:  `/report-cards`,  `/report-cards/exams`,  `/report-cards/marks/:examId`,  `/report-cards/:examId/:studentId`

## Tables

| Table | Columns |
|---|---|
| `subjects` | id, school_id, name, has_theory, has_practical, theory_max, practical_max, passing_marks |
| `exams`    | id, school_id, class_id, name, date_label, session, max_marks, status (`upcoming`/`open`/`closed`) |
| `marks`    | id (uuid), school_id, exam_id, student_id, subject_id, theory, practical, updated_at — UNIQUE (exam_id, student_id, subject_id) |

## Routes & Permissions

| Path | Component | Who |
|---|---|---|
| `/report-cards` | `pages/report-cards/index.vue` | Principal + Teacher |
| `/report-cards/exams` | `pages/report-cards/exams.vue` | Principal only (`principal-only` middleware) |
| `/report-cards/marks/[examId]` | `pages/report-cards/marks/[examId].vue` | Teacher (own class — RLS) or Principal |
| `/report-cards/[examId]/[studentId]` | `pages/report-cards/[examId]/[studentId].vue` | Principal + Teacher |

## Grading Scale

```
A+ (90-100) → 10 GP    C+ (50-59) →  6 GP
A  (80-89)  →  9 GP    C  (40-49) →  5 GP
B+ (70-79)  →  8 GP    D  (33-39) →  4 GP
B  (60-69)  →  7 GP    F  (<33)   →  0 GP
```

Computed by [`composables/useGrade.ts`](../../composables/useGrade.ts).
Per-student aggregation by [`composables/useReportCard.ts`](../../composables/useReportCard.ts).

## Lifecycle

```
Principal creates Exam (status=upcoming)
        ↓ "Open for Entry"
Teacher enters Marks (status=open)
        ↓ "Close Exam"
Marks frozen (status=closed) → Reports printable
```

## Print

The `[examId]/[studentId]` page renders an A4 layout designed for browser
print (`window.print()`), gated by `@page { size: A4; margin: 12mm }`. The
top-bar buttons hide via `print:hidden`.

## RLS

- Marks for a teacher are restricted by:
  ```sql
  exists (
    select 1 from exams e
    where e.id = marks.exam_id and e.class_id = current_class_id()
  )
  ```
  → Teachers cannot enter marks for another class's exam.
- Principals get full read+write within `school_id`.
- Super admin bypasses both via `is_super_admin()`.
