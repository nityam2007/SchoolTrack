# SchoolTrack — Business Rules & Access Control

## Role Hierarchy

```
Super Admin (Platform)
  └── Principal / School Admin (1 per school)
        └── Teacher (many per school, 1 class each)
```

## Access Matrix

| Feature | Super Admin | Principal | Teacher |
|---|:---:|:---:|:---:|
| Platform dashboard | ✅ | ❌ | ❌ |
| Add/remove/disable schools | ✅ | ❌ | ❌ |
| Top-up credits | ✅ | ❌ | ❌ |
| Platform analytics | ✅ | ❌ | ❌ |
| School dashboard | ❌ | ✅ | ❌ |
| Manage teachers/students | ❌ | ✅ | ❌ |
| Manage holidays | ❌ | ✅ | ❌ |
| Send WhatsApp messages | ❌ | ✅ | ❌ |
| **Manage exams (create/open/close)** | ❌ | ✅ | ❌ |
| **Manage subject catalog** | ❌ | ✅ | ❌ |
| Mark attendance + photo | ❌ | ❌ | ✅ |
| **Enter marks for own class** | ❌ | ❌ | ✅ |
| View own class roster | ❌ | ❌ | ✅ |
| **View report cards** | ❌ | ✅ | ✅ (own class) |
| **Print/share report cards** | ❌ | ✅ | ✅ (own class) |

## Multi-Tenant Rules

1. **Data isolation** — Each school sees only its own records. Enforced by
   RLS policies in `supabase/migrations/0001_init.sql`.
2. **1 Principal per school** — created via Supabase Auth admin API
   (`scripts/seed-users.mjs` for demo, manual invite in production).
3. **Teacher scope** — assigned to exactly one class. Can mark attendance
   and enter marks only for that class (RLS enforced).
4. **Super Admin scope** — sees all schools. RLS bypass via
   `is_super_admin()` check.

## Credit Rules

1. 1 credit per WhatsApp message sent.
2. Only Super Admin can top up credits.
3. Schools with `< 100` credits show a danger badge.
4. Below 0 is prevented by a `check (credits >= 0)` constraint.

## Attendance Rules

1. One attendance row per `(student_id, date)` (DB unique constraint).
2. Re-marking the same day overrides — store layer uses `upsert` with
   `onConflict: 'student_id,date'`.
3. A classroom photo flag (`photo = true`) is required client-side.
4. Holidays display "Today is a holiday" and disable the form.

## Report Card Rules

1. **Subjects** are per-school (`subjects.school_id`). Theory + practical
   maxes vary per subject.
2. **Exams** belong to one class (`exams.class_id`). Status lifecycle:
   `upcoming → open → closed`. Marks can be entered when `open`.
3. **Marks** are unique on `(exam_id, student_id, subject_id)` and stored
   as separate `theory` + `practical` integers — never a precomputed total.
4. **Grading scale**:
   ```
   A+ (90-100) → 10 GP    C+ (50-59) →  6 GP
   A  (80-89)  →  9 GP    C  (40-49) →  5 GP
   B+ (70-79)  →  8 GP    D  (33-39) →  4 GP
   B  (60-69)  →  7 GP    F  (<33)   →  0 GP
   ```
5. **Pass/fail per subject** = `theory + practical >= passing_marks`.
   Overall pass = all subjects passed.
6. **CGPA** = mean of subject grade points, one decimal.

## Security

- Service-role key (`SUPABASE_SERVICE_ROLE_KEY`) is server-only — never
  imported in client code or templates.
- All table queries from the browser go through the anon client, which
  enforces RLS.
- The `profiles` policy lets a user read only their own row (or all rows
  if super admin).
