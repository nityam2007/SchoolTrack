# Principal — Teacher Detail (`/teachers/[id]`)

> Drill-down view for a single teacher. Reached by clicking a row in the
> Teachers table at `/teachers`.

## Route & access

| | |
|---|---|
| Path | `/teachers/:id` |
| File | `pages/teachers/[id].vue` |
| Middleware | `principal-only` (also enforced by global guard + role-guard plugin) |
| RLS | `teachers_tenant_select` for read, `teachers_principal_write` for the class-reassign mutation. |

## Page sections

1. **Header**
   - Back to `/teachers`
   - Avatar (green `pi-id-card`)
   - Teacher name + email (mono)
   - **Reassign class** action.

2. **KPI strip** (`StatCard` × 4)
   - Class (chip; warn if unassigned).
   - Roster count.
   - Today's attendance — `present/total`, sub-line shows `absent`.
     Falls back to "Not marked" when no records exist for today.
   - 30-day attendance rate for the class (warn if < 75 %).

3. **Contact card**
   - Email, Phone (both mono).

4. **Roster table**
   - Renders `db.studentsForClass(teacher.class_id)`.
   - Each name links to `/students/[id]`.
   - `EmptyState` covers both "no class linked" and "class is empty",
     with copy adapted to whichever applies.

## Dialogs

### Reassign class
- `Dialog` with a class `Dropdown` (excludes the currently-assigned class).
- Submits via `supabase.from('teachers').update({ class_id }).eq('id', t.id)`.
- The teacher's `class_id` is updated optimistically on success so KPIs and
  the roster refresh without a full page reload.

## Empty / loading

- `EmptyState` ("Teacher not found") when `db.loaded && !teacher`.
- `TableSkeleton` until `db.loaded` is true.
