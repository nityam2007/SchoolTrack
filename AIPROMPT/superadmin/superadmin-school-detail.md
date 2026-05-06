# Super Admin — School Detail (`/schools/[id]`)

> Drill-down view for a single school. Reached by clicking a row in the
> Schools table at `/schools`.

## Route & access

| | |
|---|---|
| Path | `/schools/:id` |
| File | `pages/schools/[id].vue` |
| Middleware | `super-admin-only` (also enforced by global guard + role-guard plugin) |
| RLS | All reads filter by `id` and rely on the `schools_super_all` / `*_super_all` policies. |

## Page sections

1. **Header**
   - Back button → `/schools`
   - School icon avatar
   - School name + city + active/inactive chip
   - Action buttons: **Top up credits**, **Enable / Disable school**.

2. **KPI strip** (`StatCard` × 4)
   - Credits (red < 100, green ≥ 100)
   - Classes count
   - Teachers count
   - Students count

3. **Operational snapshot** (`st-card`, 2 cols)
   - Attendance rate across all dates on file (computed from
     `db.attendanceForSchool(id)`).
   - Absentees in the last 7 days.
   - Lifetime messages sent.

4. **Quick links**
   - `/credits` and `/analytics` — convenience navigation cards.

5. **Classes table** — Class id, name, grade, section, students count.

6. **Teachers table** — Name, email, assigned class chip, phone.

## Dialogs

### Top up credits
- `Dialog` with current balance and `<InputNumber min="1" />`.
- Submits via `db.topUpCredits(school.id, amount)`.
- Disabled while in flight (`submitting` ref).

### Enable / Disable school (uses `useConfirm`)
- Header & accept-class swap on current state.
- On accept calls `db.updateSchool(id, { active: !active })`.

## Empty / loading

- `EmptyState` ("School not found") if `db.loaded && !school`.
- `TableSkeleton` while `db` is still loading.
