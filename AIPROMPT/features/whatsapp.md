# Module: WhatsApp Integration

## Overview

Automated WhatsApp messages sent to parents when their child is marked absent. Currently a **stub** (records messages in DB, no real API call).

## Message Template

```
Dear Parent, your child [Student Name] from Class [Class Name]
was absent today. Please contact the school if this was unexpected.
```

## Send Flow

```
Principal opens Messages tab
        ↓
Selects filter: By Class / Entire School
        ↓
System finds today's absent students
        ↓
Preview shows recipient count + credit cost (real student name + class)
        ↓
[Send] clicked
        ↓
Client-side soft check: credits ≥ recipient count, else toast "Insufficient credits"
        ↓
Insert N rows into public.messages (RLS: messages_principal_write)
        ↓
BEFORE-INSERT trigger decrement_school_credits_on_message():
  · row-locks public.schools where id = NEW.school_id
  · raises if credits < 1 → whole transaction rolls back
  · UPDATE schools SET credits = credits - 1
  (runs SECURITY DEFINER so the principal does not need write
   access to the schools table)
        ↓
Client re-fetches schools.credits via SELECT (RLS: schools_tenant_select)
        ↓
Toast "Sent to N parent(s)" + topbar chip refreshes
```

## Why a trigger instead of a client-side update

The `schools` table is locked down to super admins via `schools_super_all`.
Principals only have SELECT (`schools_tenant_select`). A previous version of
this page tried to UPDATE `schools.credits` from the client after inserting
messages and produced:

> `new row violates row-level security policy for table "schools"`

Moving the credit decrement into a `SECURITY DEFINER` trigger keeps the
authorization model intact (principals still cannot directly mutate
schools) while making credit accounting atomic with the message insert.
See `supabase/migrations/0002_messages_decrement_credits.sql`.

## Message Record Schema

```json
{
  "id": "M{timestamp}-{studentId}",
  "schoolId": "SCH001",
  "studentName": "Diya Singh",
  "parentPhone": "+919800001112",
  "date": "04 Mar 2026 09:15",
  "status": "delivered"
}
```

## Status Values

| Status | Meaning |
|---|---|
| `delivered` | Message created (stub always sets this) |

## Future: Real WhatsApp Integration

- [ ] WhatsApp Business API integration
- [ ] Message delivery receipts (sent → delivered → read)
- [ ] Failed message retry logic
- [ ] Custom message templates (editable by Principal)
- [ ] Scheduled messaging (e.g., send at 10 AM daily)
- [ ] Follow-up messages for consecutive absences
- [ ] Parent reply handling
- [ ] Message language localization (Hindi, regional)
- [ ] SMS fallback if WhatsApp unavailable
