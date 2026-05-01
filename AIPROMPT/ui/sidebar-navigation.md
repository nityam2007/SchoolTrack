# Module: Sidebar & Navigation

> **Component:** [`components/AppSidebar.vue`](../../components/AppSidebar.vue)
> **Width:** 220px fixed left, full height
> **Source of menu:** [`composables/useNav.ts`](../../composables/useNav.ts)

## Structure

```
┌──────────────────┐
│ 🏫 SchoolTrack   │  ← Logo (links to /dashboard)
│                  │
│  🏠 Dashboard    │  ← role-based items
│  📋 Attendance   │
│  …               │
│                  │
│  ┌──────────────┐│
│  │ User Name    ││  ← User card (auth.user.name)
│  │ Role Label   ││
│  └──────────────┘│
│  [ Sign Out     ]│
└──────────────────┘
```

## Menu by Role

### Super Admin
| Icon | Key | Label | Route |
|---|---|---|---|
| `pi-home`        | dashboard  | Dashboard | `/dashboard` |
| `pi-building`    | schools    | Schools   | `/schools`   |
| `pi-credit-card` | credits    | Credits   | `/credits`   |
| `pi-chart-bar`   | analytics  | Analytics | `/analytics` |

### Principal (School Admin)
| Icon | Key | Label | Route |
|---|---|---|---|
| `pi-home`         | dashboard      | Dashboard      | `/dashboard` |
| `pi-list`         | attendance     | Attendance     | `/attendance` |
| `pi-id-card`      | teachers       | Teachers       | `/teachers` |
| `pi-users`        | students       | Students       | `/students` |
| `pi-calendar`     | holidays       | Holidays       | `/holidays` |
| `pi-comments`     | messages       | Messages       | `/messages` |
| `pi-chart-line`   | reports        | Reports        | `/reports` |
| `pi-file`         | reportcards    | Report Cards   | `/report-cards` |

### Teacher
| Icon | Key | Label | Route |
|---|---|---|---|
| `pi-home`          | dashboard       | Dashboard         | `/dashboard` |
| `pi-check-square`  | markattendance  | Mark Attendance   | `/mark-attendance` |
| `pi-list`          | myclass         | My Class          | `/my-class` |
| `pi-file`          | reportcards     | Report Cards      | `/report-cards` |

## Active State

Tailwind classes (see `AppSidebar.vue`):
- Active:  `bg-accentGlow text-accent border-accent/30 font-bold`
- Idle:    `text-light border-transparent hover:bg-card hover:text-ink`

Tokens are defined in [`tailwind.config.js`](../../tailwind.config.js).

## Top Nav

[`components/AppTopNav.vue`](../../components/AppTopNav.vue) renders a
sticky bar above content with: page title, optional school name, search
input, credits badge (Principal only), notification icon, user menu.
