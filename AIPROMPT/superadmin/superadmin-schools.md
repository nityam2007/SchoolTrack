# Module: Super Admin — Schools Management

> **Tab key:** `schools`  
> **Component:** `SchoolsPage`  
> **Role:** Super Admin only

## Purpose

Full CRUD for schools. Add new schools, toggle active/inactive, manage Principal login credentials.

## UI Structure

```
┌─────────────────────────────────────────────────────────┐
│  Schools                               [+ Add School]   │
├─────────────────────────────────────────────────────────┤
│  ID    │ Name     │ City   │ Students │ Credits │ Email │
│  SCH001│ Greenwood│ Mumbai │ 312      │ 420     │ p@g…  │
│        │          │        │          │         │       │
│  Password  │ Status   │ Actions                         │
│  ●●●●●●●● 👁│ ● Active │ [🔑 Credentials] [Disable]    │
└─────────────────────────────────────────────────────────┘
```

## Table Columns

| Column | Content |
|---|---|
| School ID | `SCH001` code badge |
| Name | Bold school name |
| City | Plain text |
| Students | Count |
| Credits | Green if ≥100, red if <100 |
| Admin Email | Email or "Not set" (red) |
| Password | Masked `••••••••` with 👁 toggle |
| Status | Active/Inactive badge |
| Actions | Credentials button + Enable/Disable toggle |

## Add School Modal

```
┌─ Add New School ──────────────── × ─┐
│  [ School Name *              ]     │
│  [ City                       ]     │
│  [ Initial Credits (200)      ]     │
│  ─────────────────────────────────  │
│  Principal (School Admin) Login     │
│  [ Admin Email *              ]     │
│  [ Admin Password *           ]     │
│  [ Create School              ]     │
└─────────────────────────────────────┘
```

| Field | Type | Required |
|---|---|---|
| School Name | Text | ✅ |
| City | Text | ❌ |
| Credits | Number (default 200) | ❌ |
| Admin Email | Text | ✅ |
| Admin Password | Text | ✅ |

## Credentials Modal

```
┌─ Update Credentials — Greenwood ─ × ─┐
│  "Login credentials for the Principal" │
│  [ Admin Email              ]          │
│  [ Admin Password           ]          │
│  ┌─ Share these with Principal ──────┐ │
│  │  URL: schooltrack.app/login       │ │
│  │  Email: principal@greenwood.edu   │ │
│  │  Password: school123              │ │
│  └───────────────────────────────────┘ │
│  [ Save Credentials        ]          │
└────────────────────────────────────────┘
```

## Actions

| Action | Effect |
|---|---|
| Add School | Creates school with auto-generated ID (`SCH###`) |
| Disable/Enable | Toggles `school.active` — disabled schools can't log in |
| Credentials | Updates `adminEmail` and `adminPass` for the Principal |
| Password Toggle | Shows/hides password per school row |
