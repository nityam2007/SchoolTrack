# Module: Super Admin — Credits Management

> **Tab key:** `credits`  
> **Component:** `CreditsPage`  
> **Role:** Super Admin only

## Purpose

View credit balances for all schools and top-up credits.

## UI Structure

```
┌──────────────────────────────────────────────┐
│  Credit Management                            │
├──────────────┬──────────────┬─────────────────┤
│  Greenwood   │  Sunrise     │  Blue Ridge     │
│  Mumbai      │  Delhi       │  Bangalore      │
│              │              │                 │
│  Balance     │  Balance     │  Balance        │
│  420         │  88 (RED)    │  650            │
│  ████████░░░ │  ██░░░░░░░░░│  ████████████░░ │
│  [Top Up]    │  [Top Up]    │  [Top Up]       │
└──────────────┴──────────────┴─────────────────┘
```

## School Credit Card (grid3)

| Element | Detail |
|---|---|
| Name | School name, bold |
| City | Muted subtitle |
| Balance label | "Balance" in muted |
| Balance value | 28px, bold. Red if <100, green if ≥100 |
| ProgressBar | Max scale = 500 credits |
| Button | "Top Up" → opens modal |

## Top-Up Modal

```
┌─ Add Credits ──────────────── × ─┐
│  School: Greenwood Academy       │
│  [ 100                     ]     │
│  [ Add 100 Credits         ]     │
└──────────────────────────────────┘
```

| Field | Type | Default |
|---|---|---|
| Credits to add | Number | 100 |

## Logic

- Adds `+amt` to `school.credits`
- No maximum cap
- Only Super Admin can top-up
