# Module: Shared UI Components

## Stat Card

```
┌─────────────────┐
│  LABEL (upper)  │  ← muted, 12px, uppercase
│  42             │  ← 32px, bold, colored
│  sub text       │  ← muted, 12px (optional)
└─────────────────┘
```

**Props:** `label`, `value`, `color`, `sub`

---

## Badge

```
┌───────────┐
│  Active   │  ← bg: color+20%, text: color, 12px bold
└───────────┘
```

**Props:** `text`, `color`

---

## Tag (Toggle Button)

```
[ On State  ]   bg: accent, color: white, bold
[ Off State ]   bg: surface, color: muted
```

**Props:** `on`, `onClick`, `children`

---

## Table

```
┌──────────┬──────────┬──────────┐
│  COL 1   │  COL 2   │  COL 3   │  ← uppercase, muted, 12px
├──────────┼──────────┼──────────┤
│  data    │  data    │  data    │  ← 14px
│  data    │  data    │  data    │
└──────────┴──────────┴──────────┘
```

**Props:** `cols` (string[]), `rows` (any[]), `renderRow` (fn → `<><Td>…</Td></>`)

---

## Td (Table Cell)

**Props:** `children`, `align` (default: "left")

---

## Modal

```
┌─ OVERLAY (black 66% opacity) ─────────────┐
│  ┌─────────────────────────────────────┐   │
│  │  Title                         ×    │   │
│  │─────────────────────────────────────│   │
│  │  {children}                         │   │
│  └─────────────────────────────────────┘   │
└────────────────────────────────────────────┘
```

**Props:** `title`, `onClose`, `children`  
**Max width:** 520px  
**Max height:** 90vh (scrollable)

---

## ProgressBar

```
┌══════════════════────────────┐
│  ██████████░░░░░░░░░░░░░░░░ │  ← 6px tall, colored fill
└──────────────────────────────┘
```

**Props:** `value` (0-100), `color`
