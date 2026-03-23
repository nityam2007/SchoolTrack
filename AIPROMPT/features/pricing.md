# Module: Pricing — Credit System

## Overview

SchoolTrack uses a **prepaid credit model**. Schools buy credits; each WhatsApp message costs 1 credit.

## Credit Flow

```
Super Admin tops up credits
        ↓
School credit balance increases
        ↓
Principal sends WhatsApp messages
        ↓
1 credit deducted per message
        ↓
Balance reaches 0 → messaging blocked
```

## Pricing Rules

| Rule | Detail |
|---|---|
| Cost per message | **1 credit** |
| Default on school creation | **200 credits** |
| Minimum to send | Balance ≥ number of recipients |
| Who can top-up | **Super Admin only** |
| Top-up amount | Any positive integer (default: 100) |
| Maximum balance | **No cap** |
| Warning threshold | **< 100 credits** (shown in red) |

## Credit Display Locations

| Location | What's Shown |
|---|---|
| Super Admin Dashboard | Credit bars per school |
| Super Admin Credits page | Full card with top-up |
| School Schools Table | Credit column (red/green) |
| Principal Dashboard | Badge: "420 Credits" |
| Principal Messages | "Credits: 420" inline |

## Credit Color Logic

| Balance | Color |
|---|---|
| ≥ 100 | `#10B981` (green) |
| < 100 | `#EF4444` (red) |

## ProgressBar Scale

Max scale = **500 credits** (values above 500 show 100% bar fill)

## Future Pricing Features (Not Yet Implemented)

- [ ] Per-school pricing tiers (Basic / Pro / Enterprise)
- [ ] Monthly subscription plans
- [ ] Auto-recharge when credits drop below threshold
- [ ] Credit purchase via payment gateway (Razorpay/Stripe)
- [ ] Invoice generation for credit purchases
- [ ] Credit usage history / audit trail
- [ ] Bulk discount pricing
