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
Preview shows recipient count + credit cost
        ↓
[Send] clicked
        ↓
Validates credits ≥ recipient count
        ↓
Creates message records in DB
        ↓
Deducts credits from school balance
        ↓
Shows "✓ Sent!" for 3 seconds
```

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
