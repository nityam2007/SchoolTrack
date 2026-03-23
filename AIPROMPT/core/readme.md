# SchoolTrack — README

## What Is It?

SchoolTrack is a **multi-tenant SaaS** attendance management platform for K-12 schools. It provides real-time attendance marking with **photo proof**, **WhatsApp parent notifications**, and a **credit-based pricing** model.

## Roles

| Role | Scope | Count |
|---|---|---|
| **Super Admin** | Entire platform | Multiple |
| **Principal (School Admin)** | One school | 1 per school |
| **Teacher** | One class | Many per school |

## Core Features

- 🏫 Multi-school tenant management
- ✅ Daily attendance with classroom photo proof
- 💬 WhatsApp absence alerts to parents
- 💳 Credit-based messaging (pay-per-message)
- 📊 Class & student analytics
- 📅 Holiday calendar management
- 🔐 Role-based access control (RBAC)

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Inline CSS with design tokens |
| State | React useState (client-only seed data) |
| Auth | Client-side role-based login |
| Fonts | DM Sans, Space Grotesk (Google Fonts) |

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173`

## Demo Logins

| Role | Email | Password |
|---|---|---|
| Super Admin | `admin@schooltrack.in` | `admin123` |
| Principal (Greenwood) | `principal@greenwood.edu` | `school123` |
| Teacher (Ms. Priya) | `priya@greenwood.edu` | `teacher123` |
