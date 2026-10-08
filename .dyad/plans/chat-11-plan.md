---
title: "Chore System v2 — Multi-Select Weekly, Extra Limits, Delete, & Child Chore Requests"
summary: "Complete the remaining gaps: weekly multi-select with variance, extra-chore completion caps, ability to delete chores, and a child-to-parent chore request flow."
status: "draft"
chatId: "11"
createdAt: "2026-10-08T02:57:01.149Z"
updatedAt: "2026-10-08T12:29:47.675Z"
---

## Overview

This plan bundles the remaining features needed to round out the chore system:

1. **Weekly Multi-Select Days + Variance** — Pick multiple due days + completion window
2. **Extra Chore Completion Limits** — Cap bonus chores per period (e.g. wash car 1×/week)
3. **Delete Chores** — Missing entirely; parent can remove a chore with confirmation
4. **Child Chore Requests** — Child proposes a new chore (name, points, recurrence, description); parent approves and the Add Chore modal opens pre-filled

*(Note: **Edit chore** is already fully implemented — pencil icon on the card → edit modal with all fields.)*

---

## UI/UX Design

### Chore Card (Parent View)
- **Edit** (pencil icon) — already exists ✅
- **Delete** (trash icon, red, visible only to parents) — opens confirmation dialog
- **Extra chore badge** now shows `Extra Chore • 1/3 this week` counter when a limit is set

### Add/Edit Chore Modal

**When Recurrence = Weekly:**
- Replaces the custom schedule with:
  - 7 checkbox pills (Mon Tue Wed Thu Fri Sat Sun)
  - Variance dropdown (0–7 days)

**When "Extra Chore" is checked:**
- Shows limit controls:
  - Number input: "Allow up to _ completions"
  - Dropdown: "per _" (`Daily` / `Weekly` / `Monthly`)
  - "Unlimited" toggle to hide limit inputs

### Child Side — Floating "+" Button Menu
- Currently the floating "+" button opens "Request Points"
- Expand it to a small speed-dial with two options:
  1. **Request Points** (existing)
  2. **Request a Chore** (new)

### Request a Chore Modal (Child)
Fields:
- Chore name (e.g. "Clean my room")
- Points requested (e.g. 50)
- Recurrence (One-time / Daily / Weekly / Monthly)
- Description (optional: "I will vacuum and dust")

### Parent Requests Tab
Split into two sections:
1. **Point Requests** (existing `PointRequestCard`s)
2. **Chore Requests** (new `ChoreRequestCard`s)

`ChoreRequestCard` layout:
- Name & requested points
- Recurrence badge
- Child's name
- Description (collapsible)
- **Approve** → Opens Add Chore modal pre-filled with these details, request status becomes `APPROVED`
- **Deny** → Request status becomes `DENIED`

### Approve Flow
1. Parent clicks **Approve** on a chore request
2. The request is marked `APPROVED`
3. The Add Chore modal opens with all fields pre-filled (child can edit)
4. Parent clicks **Add Chore** → creates the chore
5. Child gets a notification: *"Your chore request 'Clean my room' was approved!"*

---

## Technical Approach

### Data Model

**`ChoreSchedule.type` adds `'WEEKLY_DAYS'':**
```typescript
type: 'DEADLINE' | 'DAY_OF_WEEK' | 'WEEKLY_DAYS' | null;
```

**`Chore` adds `completionConfig`:**
```typescript
completionConfig?: {
  maxCompletions: number;
  period: 'daily' | 'weekly' | 'monthly';
} | null;
```

**`ActivityEvent` adds `choreId`** (to count completions for extra-chore limits):
```typescript
choreId?: number;
```

**New `ChoreRequest` type:**
```typescript
export interface ChoreRequest {
  id: number;
  userId: number;
  name: string;
  points: number;
  recurrence: ChoreRecurrence;
  description?: string;
  status: 'PENDING' | 'APPROVED' | 'DENIED';
}
```

### Extra Chore Limit Enforcement

Computed from activity log (source of truth):
1. Filter `CHORE_APPROVED` events by `choreId`, `userId`, and `timestamp` within the current sliding window
2. If count ≥ `maxCompletions`, block with: *"You've already hit the limit for this chore this [period]. Come back [date]!"*
3. Window lengths: daily = 24h, weekly = 7 days, monthly = 30 days

---

## Implementation Steps

### Step 1 — Update Types (`types.ts`)
- Add `'WEEKLY_DAYS'` to `ChoreSchedule.type`
- Add `completionConfig` to `Chore`
- Add `choreId` to `ActivityEvent`
- Add new `ChoreRequest` interface and status enum

### Step 2 — Update App State (`App.tsx`)
- New state: `choreRequests`, `weeklyDays: string[]`, `extraChoreMaxCompletions`, `extraChorePeriod`
- New modal content: `'requestChore'`
- New notification hook for chore-request approvals

### Step 3 — Add `handleDeleteChore` (`App.tsx`)
- Confirmation dialog with `window.confirm`
- Remove from `chores` array
- Log `CHORE_DELETED` to activity log (optional)

### Step 4 — Update `handleAddChore` / `handleEditChore` (`App.tsx`)
- Attach `completionConfig` when `isExtraChore && maxCompletions > 0`
- Build `WEEKLY_DAYS` schedule for Weekly recurrence
- Pass `choreId` through to all `logActivityEvent` calls

### Step 5 — Update `handleOpenEditModal` / `closeModal` (`App.tsx`)
- Populate/reset: `weeklyDays`, `extraChoreMaxCompletions`, `extraChorePeriod`

### Step 6 — Update Form JSX (`App.tsx`)
- Weekly → day checkboxes + variance (replace the old custom schedule block)
- Extra chore → show limit inputs when checkbox is checked
- One-time custom schedule block remains, hidden when Weekly is selected

### Step 7 — Update `ChoreCard.tsx`
- Add `onDelete` prop + delete button (parent only)
- Update `isWithinVarianceWindow` for `WEEKLY_DAYS` (parse comma-separated days, compute shortest circular weekday distance)
- Add extra-chore limit check in `handleCompleteClick` / `handleApproveClick`
- Update `ExtraChoreBadge` to show progress counter when limit is set

### Step 8 — Create `ChoreRequestCard.tsx` (`components/ChoreRequestCard.tsx`)
- Card layout matching `PointRequestCard`
- Shows name, points, recurrence badge, child name, description
- **Approve** → calls `onApprove(id)` and parent-side logic opens the Add Chore modal pre-filled
- **Deny** → calls `onDeny(id)`

### Step 9 — Wire Child Chore Request Flow (`App.tsx`)
- Child opens modal → fills form → `handleRequestChore`
- Store in `choreRequests` array
- Add to Notifications for parent

### Step 10 — Wire Parent Chore Request Handling (`App.tsx`)
- Show `ChoreRequestCard`s in Requests tab alongside `PointRequestCard`s
- **Approve** handler pre-fills Add Chore modal fields and opens it
- **Deny** handler updates request status
- Child gets notification on approval/denial

### Step 11 — Update Floating "+" Button for Child (`App.tsx`)
- Expand to a mini speed-dial with two options:
  1. Request Points
  2. Request a Chore

---

## Files to Change

| File | Change |
|------|--------|
| `types.ts` | Add `'WEEKLY_DAYS'`, `completionConfig`, `choreId`, new `ChoreRequest` types |
| `App.tsx` | New state, new handlers (delete, chore request, weekly form, extra limit), pre-filled approve flow, updated form JSX, floating button menu |
| `components/ChoreCard.tsx` | Delete button, variance window for `WEEKLY_DAYS`, extra-chore limit enforcement, badge counters |
| `components/ChoreRequestCard.tsx` | **New file** — card for child-initiated chore requests |
| `components/PointRequestCard.tsx` | Minor tweaks if needed for visual consistency |

---

## Testing Strategy

**Delete:**
- Parent clicks trash → confirmation dialog → chore removed, list updates instantly
- Child never sees delete button

**Weekly Multi-Select:**
- Create "Trash" (Tue only, var 0) → complete Tue ✅, Mon ❌
- Create "Vacuum" (Mon/Wed/Thu, var 1) → complete Sun ✅, Sat ❌

**Extra Chore Limits:**
- "Wash car" (extra, max 1/week) → complete, complete again same week → blocked
- "Dust" (extra, max 2/month) → complete ×2, third attempt blocked

**Child Chore Request:**
- Child requests "Clean room" 50 pts weekly → appears in Parent Requests
- Parent approves → Add Chore modal opens pre-filled
- Parent edits, creates → child gets notification, chore appears in list
- Parent denies → child gets notification
