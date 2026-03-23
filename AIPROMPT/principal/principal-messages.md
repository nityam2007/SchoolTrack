# Module: Principal — WhatsApp Messages

> **Tab key:** `messages`  
> **Component:** `MessagesPage`  
> **Role:** Principal (School Admin)

## Purpose

Send WhatsApp absence notification messages to parents. Uses credit system. View message log.

## UI Structure

```
┌──────────────────────────────────────────────────────┐
│  WhatsApp Notifications                               │
├──────────────────────────────────────────────────────┤
│  Send Absence Notifications          Credits: 420    │
│                                                       │
│  [By Class ●] [Entire School ○]  [ Grade 5A ▾ ]     │
│                                                       │
│  ┌─ Message Preview ──────────────────────────────┐  │
│  │  "Dear Parent, your child [Student Name] from  │  │
│  │  Class [Class Name] was absent today. Please    │  │
│  │  contact the school if unexpected."             │  │
│  └────────────────────────────────────────────────┘  │
│                                                       │
│  2 parent(s) will receive · 2 credit(s)              │
│                           [Send to 2 Parent(s)]      │
├──────────────────────────────────────────────────────┤
│  Message Log                                          │
│  Student     │ Phone       │ Date & Time    │ Status  │
│  Diya Singh  │ +919800…    │ 04 Mar 09:15   │ ● Sent  │
│  Rohan Gupta │ +919800…    │ 04 Mar 09:16   │ ● Sent  │
└──────────────────────────────────────────────────────┘
```

## Filter Options

| Filter | Type | Detail |
|---|---|---|
| By Class | Tag toggle | Shows class selector dropdown |
| Entire School | Tag toggle | Shows all absent students |
| Class selector | Select | Visible only when "By Class" is active |

## Send Logic

1. Find today's absent students (filtered by class or all)
2. Check `school.credits >= count`
3. If insufficient → `alert("Insufficient credits!")`
4. Create message records (1 per absent student)
5. Deduct credits from school
6. Show "✓ Sent!" green button for 3 seconds

## Message Log Table

| Column | Content |
|---|---|
| Student | Bold student name |
| Parent Phone | Phone number |
| Date & Time | Formatted datetime |
| Status | Badge: "delivered" (green) |

## Credit Deduction

`1 message = 1 credit`
