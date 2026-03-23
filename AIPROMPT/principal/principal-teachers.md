# Module: Principal — Teachers Management

> **Tab key:** `teachers`  
> **Component:** `TeachersPage`  
> **Role:** Principal (School Admin)

## Purpose

View and add teachers assigned to the school. Each teacher gets a login and class assignment.

## UI Structure

```
┌───────────────────────────────────────────────────┐
│  Teachers                          [+ Add Teacher] │
├───────────────────────────────────────────────────┤
│  Name           │ Email             │ Class   │Phone│
│  Ms. Priya      │ priya@greenwood…  │ Grade5A │+91… │
│  Mr. Rahul      │ rahul@greenwood…  │ Grade5B │+91… │
│  Ms. Anita      │ anita@greenwood…  │ Grade6A │+91… │
└───────────────────────────────────────────────────┘
```

## Table Columns

| Column | Content |
|---|---|
| Name | Bold teacher name |
| Email | Muted email |
| Assigned Class | Badge: class name (accent) or "Unassigned" (amber) |
| Phone | Phone number |

## Add Teacher Modal

```
┌─ Add Teacher ──────────────── × ─┐
│  [ Full Name              ]      │
│  [ Email                  ]      │
│  [ Phone                  ]      │
│  [ Login Password *       ]      │
│  [ Assign Class ▾         ]      │
│  [ Add Teacher            ]      │
└──────────────────────────────────┘
```

| Field | Type | Required |
|---|---|---|
| Full Name | Text | ✅ |
| Email | Text | ✅ |
| Phone | Text | ❌ |
| Login Password | Text | ✅ |
| Assign Class | Select (school's classes) | ❌ |

## Restrictions (Future)

- ❌ Principal **cannot edit** existing teacher details (future: add edit button)
- ❌ Principal **cannot delete** teachers (future: add remove with confirmation)
- ✅ Can add new teachers
- ✅ Can view all teachers in their school
