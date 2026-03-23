# Module: Teacher — Mark Attendance

> **Tab key:** `markattendance`  
> **Component:** `MarkAttendance`  
> **Role:** Teacher only  
> **Critical module** — core business flow

## Purpose

3-step flow: Mark each student → Take classroom photo → Confirmation. Mandatory photo proof, no gallery uploads.

## Flow Steps

```
Step 1: MARK     →  Step 2: CAMERA   →  Step 3: DONE
(student list)      (take photo)        (confirmation)
```

## Step 1: Mark Attendance

```
┌──────────────────────────────────────────────────────┐
│  Mark Attendance — Grade 5A              ● 23 Mar '26│
│                                                       │
│  ⚠️ Already submitted today. Re-mark to update.      │  ← if already marked
│                                                       │
│  [All Present] [All Absent]          4/6 marked       │
│                                                       │
│  ┌───────────────────────────────────────────────┐   │
│  │  [01]  Aarav Patel                   ✅ present│   │  ← green bg
│  │  [02]  Diya Singh                    ❌ absent │   │  ← red bg
│  │  [03]  Kabir Sharma                  ⬜        │   │  ← neutral (unset)
│  │  [04]  Meera Joshi                   ✅ present│   │
│  │  [05]  Rohan Gupta                   ❌ absent │   │
│  │  [06]  Sia Kumar                     ⬜        │   │
│  └───────────────────────────────────────────────┘   │
│                                                       │
│  [  Submit & Take Classroom Photo →  ]               │  ← visible only when ALL marked
└───────────────────────────────────────────────────────┘
```

### Student Row Behavior

| Click Cycle | State | Background | Icon |
|---|---|---|---|
| 1st click | `present` | Green 15% | ✅ |
| 2nd click | `absent` | Red 15% | ❌ |
| 3rd click | `undefined` | Surface | ⬜ |

### Bulk Actions

- **All Present** — sets all students to `present`
- **All Absent** — sets all students to `absent`

### Submit Button

- Only visible when **all students are marked** (`allMarked === true`)
- Advances to Step 2

## Step 2: Camera Photo

```
┌──────────────────────────────────────┐
│  📸 Classroom Photo Required          │
│  "Take a live photo as proof"        │
│                                      │
│  ┌──────────────────────────────┐   │
│  │                              │   │
│  │     [ LIVE CAMERA FEED ]     │   │
│  │                              │   │
│  └──────────────────────────────┘   │
│       [ 📷 Capture Photo ]          │
└──────────────────────────────────────┘
```

### Camera Logic

1. Opens rear camera (`facingMode: "environment"`)
2. If denied → amber warning with fallback message
3. On capture → draws video frame to canvas → saves as JPEG data URL
4. Stops camera stream
5. Saves attendance records to DB
6. Advances to Step 3

### Camera Error Fallback

```
┌─ ⚠ Warning ─────────────────────────┐
│  Camera permission denied or not     │
│  available. In a production deploy-  │
│  ment on mobile, camera opens auto-  │
│  matically.                          │
└──────────────────────────────────────┘
```

"Capture Photo" button works even without camera (sets `photo: "captured"`)

## Step 3: Done

```
┌──────────────────────────────────────┐
│         ✅ (64px)                     │
│  Attendance Submitted!               │
│  4 Present · 2 Absent                │
│  Photo saved with timestamp          │
│                                      │
│  📸 Classroom photo linked to        │
│  today's attendance record           │
│                                      │
│  [ Mark Again (Override) ]           │
└──────────────────────────────────────┘
```

## Holiday Block

If today is a holiday:

```
┌──────────────────────────────────────┐
│         🎉 (48px)                     │
│  Today is a Holiday!                 │
│  Holi                                │
└──────────────────────────────────────┘
```

No attendance marking allowed.

## Data Written

Per student attendance record:
```json
{
  "id": "A{timestamp}-{studentId}",
  "schoolId": "...",
  "classId": "...",
  "studentId": "...",
  "date": "2026-03-23",
  "status": "present|absent",
  "teacherId": "...",
  "photo": true,
  "timestamp": "ISO string"
}
```

Re-marking removes old records for the same class+date, then inserts new ones.
