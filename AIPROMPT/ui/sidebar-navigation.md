# Module: Sidebar & Navigation

> **Component:** `Sidebar`  
> **Position:** Fixed left, 220px wide, full height

## UI Structure

```
┌──────────────────┐
│ 🏫 SchoolTrack   │  ← Logo
│                  │
│  🏠 Dashboard    │  ← Menu items
│  📋 Attendance   │     (role-based)
│  👨‍🏫 Teachers     │
│  👩‍🎓 Students     │
│  📅 Holidays     │
│  💬 Messages     │
│  📈 Reports      │
│                  │
│  ┌──────────────┐│
│  │ User Name    ││  ← User card
│  │ Role Label   ││
│  └──────────────┘│
│  [ Sign Out     ]│  ← Logout
└──────────────────┘
```

## Menu Items by Role

### Super Admin
| Icon | Key | Label |
|---|---|---|
| 🏠 | `dashboard` | Dashboard |
| 🏫 | `schools` | Schools |
| 💳 | `credits` | Credits |
| 📊 | `analytics` | Analytics |

### Principal (School Admin)
| Icon | Key | Label |
|---|---|---|
| 🏠 | `dashboard` | Dashboard |
| 📋 | `attendance` | Attendance |
| 👨‍🏫 | `teachers` | Teachers |
| 👩‍🎓 | `students` | Students |
| 📅 | `holidays` | Holidays |
| 💬 | `messages` | Messages |
| 📈 | `reports` | Reports |

### Teacher
| Icon | Key | Label |
|---|---|---|
| 🏠 | `dashboard` | Dashboard |
| ✅ | `markattendance` | Mark Attendance |
| 📋 | `myclass` | My Class |

## Active State

- Background: `accentGlow` (`#3B82F640`)
- Text color: `accent` (`#3B82F6`)
- Border: `accent` at 30% opacity
- Font weight: 700
