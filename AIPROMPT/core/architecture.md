# SchoolTrack — Multi-Tenant SaaS Architecture

## Tenant Model

```
┌──────────────────────────────────────────────┐
│              PLATFORM (SchoolTrack)           │
│  Super Admin(s) — manage all schools          │
├──────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌──────┐ │
│  │  School A    │  │  School B    │  │ …    │ │
│  │  Principal   │  │  Principal   │  │      │ │
│  │  Teachers[]  │  │  Teachers[]  │  │      │ │
│  │  Classes[]   │  │  Classes[]   │  │      │ │
│  │  Students[]  │  │  Students[]  │  │      │ │
│  └─────────────┘  └─────────────┘  └──────┘ │
└──────────────────────────────────────────────┘
```

## Data Model

```
School
├── id, name, city, credits, active
├── adminEmail, adminPass (Principal login)
├── Classes[]
│   ├── id, name, section, grade
│   └── Students[]
│       ├── id, name, roll, parentPhone
│       └── Attendance[]
│           ├── date, status, teacherId, photo, timestamp
├── Teachers[]
│   ├── id, name, email, pass, phone, classId
├── Holidays[]
│   ├── date, title
└── Messages[]
    ├── studentName, parentPhone, date, status
```

## Isolation Rules

| Entity | Scoped By |
|---|---|
| Classes | `schoolId` |
| Students | `schoolId` + `classId` |
| Teachers | `schoolId` |
| Attendance | `schoolId` + `classId` |
| Holidays | `schoolId` |
| Messages | `schoolId` |

## Authentication Flow

```
Login Screen
  ├── Role selector: [Super Admin] [Principal] [Teacher]
  ├── Email + Password fields
  └── Lookup:
        Super Admin → hardcoded credentials
        Principal   → school.adminEmail + school.adminPass
        Teacher     → teacher.email + teacher.pass
```

## State Architecture

```
App
├── user: { role, email, name, schoolId, teacherId?, classId? }
├── tab: string (active sidebar tab)
└── db: {
│     schools[], classes[], teachers[],
│     students[], attendance[], holidays[], messages[]
│   }
└── setDb → all mutations via functional setState
```

## Future: Backend Migration

| Current (Client) | Target (Server) |
|---|---|
| Seed data in memory | PostgreSQL / MySQL |
| useState for DB | REST API / tRPC |
| Client-side auth | JWT + bcrypt |
| No persistence | Persistent multi-tenant DB |
| WhatsApp stub | WhatsApp Business API |
