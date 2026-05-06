# Principal — Student Detail (`/students/[id]`)

> Drill-down view for a single student. Reached by clicking a row in the
> Students table at `/students`, or via a teacher-detail roster link.

## Route & access

| | |
|---|---|
| Path | `/students/:id` |
| File | `pages/students/[id].vue` |
| Middleware | `principal-only` (also enforced by global guard + role-guard plugin) |
| RLS | Reads filter by school via `students_tenant_select`; principal can also remove via `students_principal_write`. |

## Page sections

1. **Header**
   - Back to `/students`
   - Avatar (violet `pi-user`)
   - Roll · Name · Class · Gender · DOB
   - **Remove** action (uses `useConfirm`; cascades to attendance & marks).

2. **KPI strip** (`StatCard` × 4)
   - Attendance rate (green ≥ 75 %, warn otherwise) + total records.
   - Present count.
   - Absent count.
   - Class name.

3. **Profile card**
   - Father's name, Mother's name, Parent phone (mono).
   - DOB, Gender, Student ID (mono `<code>`).

4. **Attendance history**
   - Paginated `DataTable` (10 per page) over `db.attendance` filtered by
     `student_id`, sorted DESC by date.
   - Columns: Date (formatted dd MMM yyyy), Status (Tag), Photo (Tag).
   - Hint above table shows count of records in the **last 30 days**.
   - `EmptyState` when no attendance exists.

5. **Exam results**
   - One row per exam in the student's class (`db.examsForClass(student.class_id)`).
   - Uses `calcReportStats(subjects, marks)` helper from
     `composables/useReportCard.ts`.
   - Columns: Exam, Score, %, Grade, Result (PASS/FAIL Tag), and an
     `Open` button → `/report-cards/[examId]/[studentId]`.

## Empty / loading

- `EmptyState` ("Student not found") if `db.loaded && !student`.
- `TableSkeleton` until `db.loaded` is true.
