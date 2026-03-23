# Module: Auth — Login Screen

> **File:** `LoginScreen` component  
> **Route:** `/` (default when not logged in)

## Purpose

Role-based login with demo account quick-fill. Validates credentials against seed data.

## UI Structure

```
┌──────────────────────────────────────┐
│         🏫 SchoolTrack               │
│   "Attendance management, reimagined"│
├──────────────────────────────────────┤
│  LOGIN AS                            │
│  [🔑 Super Admin] [🏫 Principal] [👩‍🏫 Teacher] │
│                                      │
│  ┌─ Demo Accounts (click to fill) ─┐│
│  │  Platform Admin  admin@...       ││
│  │  Greenwood       principal@...   ││
│  └──────────────────────────────────┘│
│                                      │
│  [ Email address          ]          │
│  [ Password          👁   ]          │
│                                      │
│  ⚠ Error message (if any)           │
│                                      │
│  [ Sign In →                ]        │
└──────────────────────────────────────┘
```

## Fields

| Field | Type | Required |
|---|---|---|
| Role | Tag selector (3 options) | Yes |
| Email | Text input | Yes |
| Password | Password + show/hide toggle | Yes |

## Logic

| Role | Lookup | Check |
|---|---|---|
| Super Admin | Hardcoded `admin@schooltrack.in` / `admin123` | Exact match |
| Principal | `schools.find(s => s.adminEmail === email && s.adminPass === pass)` | + `school.active === true` |
| Teacher | `teachers.find(t => t.email === email && t.pass === pass)` | Exact match |

## Error States

- `"Invalid Super Admin credentials."`
- `"No school account found with these credentials."`
- `"This school account has been disabled."`
- `"No teacher account found with these credentials."`

## On Success

Sets `user` object:
```
{ role, email, name, schoolId, teacherId?, classId? }
```
