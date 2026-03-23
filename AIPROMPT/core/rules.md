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
| View platform dashboard | ✅ | ❌ | ❌ |
| Add/remove schools | ✅ | ❌ | ❌ |
| Enable/disable schools | ✅ | ❌ | ❌ |
| Set school credentials | ✅ | ❌ | ❌ |
| Top-up credits | ✅ | ❌ | ❌ |
| Platform analytics | ✅ | ❌ | ❌ |
| View school dashboard | ❌ | ✅ | ❌ |
| View attendance records | ❌ | ✅ | ❌ |
| Manage teachers | ❌ | ✅ | ❌ |
| Manage students | ❌ | ✅ | ❌ |
| Manage holidays | ❌ | ✅ | ❌ |
| Send WhatsApp messages | ❌ | ✅ | ❌ |
| View reports | ❌ | ✅ | ❌ |
| Mark attendance | ❌ | ❌ | ✅ |
| Take classroom photo | ❌ | ❌ | ✅ |
| View own class | ❌ | ❌ | ✅ |

## Multi-Tenant Rules

1. **Data isolation** — Each school sees only its own data (students, teachers, classes, attendance, holidays, messages).
2. **1 Principal per school** — Each school has exactly one admin account (the Principal). Super Admin creates/manages these credentials.
3. **Teacher scope** — A teacher is assigned to exactly **one class**. They can only mark attendance and view data for their assigned class.
4. **Super Admin scope** — Can see and manage **all schools** across the platform. Multiple super admins can exist.

## Principal Restrictions (School Admin)

- ❌ **Cannot edit** school name, city, or their own login credentials (Super Admin controls these).
- ❌ **Cannot top-up credits** — must request from Super Admin.
- ❌ **Cannot disable/enable** their own school.
- ✅ Can add/remove teachers and students.
- ✅ Can add/remove holidays.
- ✅ Can send WhatsApp notifications (deducts credits).
- ✅ Can view all attendance records and reports.

## Teacher Restrictions

- ❌ Cannot manage students or teachers.
- ❌ Cannot view other classes.
- ❌ Cannot send WhatsApp messages.
- ✅ Can mark attendance once per day (re-marking overrides).
- ✅ Must take a classroom photo as proof.

## Credit Rules

1. Credits are consumed **1 per WhatsApp message sent**.
2. Only **Super Admin** can add credits to a school.
3. Schools with **0 credits** cannot send WhatsApp messages.
4. Schools below **100 credits** show a red warning.

## Attendance Rules

1. Attendance is marked **once per class per day**.
2. Re-marking on the same day **overrides** the previous record.
3. A **classroom photo** is mandatory with each submission.
4. Gallery uploads are **disabled** — only live camera capture.
5. Holidays block attendance marking (shows "Today is a Holiday!" message).
