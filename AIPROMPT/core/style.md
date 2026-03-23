# SchoolTrack — Design System & Style Guide

## Color Tokens

| Token | Hex | Usage |
|---|---|---|
| `bg` | `#0A0E1A` | Page background |
| `surface` | `#111827` | Sidebar, inputs |
| `card` | `#161D2E` | Card backgrounds |
| `border` | `#1E2D45` | Borders, dividers |
| `accent` | `#3B82F6` | Primary actions, active states |
| `accentGlow` | `#3B82F640` | Active tab background |
| `green` | `#10B981` | Present, success, active |
| `red` | `#EF4444` | Absent, error, danger |
| `amber` | `#F59E0B` | Warnings, credits, holidays |
| `purple` | `#8B5CF6` | Analytics, credentials |
| `text` | `#F1F5F9` | Primary text |
| `muted` | `#64748B` | Labels, secondary text |
| `light` | `#94A3B8` | Tertiary text |

## Typography

| Font | Weight | Usage |
|---|---|---|
| **DM Sans** | 400, 600, 700, 800 | Body, labels, headings |
| **Space Grotesk** | 700, 800 | Logo, brand text |

## Spacing

- Card padding: `24px`
- Card border-radius: `16px`
- Button border-radius: `10px`
- Input border-radius: `10px`
- Gap (standard): `12px`
- Gap (column): `8px`

## Grid Layouts

| Name | Columns | Usage |
|---|---|---|
| `grid2` | `1fr 1fr` | Dashboard two-column |
| `grid3` | `1fr 1fr 1fr` | Stat cards, class cards |
| `grid4` | `repeat(4,1fr)` | Top-level stat row |

## Button Variants

```
┌─────────────────────────────────┐
│  [Primary]  solid bg, white text │  gs.btn(color)
│  [Ghost]    transparent, border  │  gs.btnGhost
│  [Tag]      toggle on/off        │  <Tag on={bool}>
└─────────────────────────────────┘
```

## Badge

```
┌───────────────┐
│  ● Active     │  gs.badge(color) → bg: color+20, text: color
└───────────────┘
```

## Dark Mode

The entire app is **dark-mode only** with `#0A0E1A` base. All colors are designed for dark backgrounds.
