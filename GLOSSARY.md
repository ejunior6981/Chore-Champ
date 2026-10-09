# Chore Champ Domain GLOSSARY

## Core Concepts

### User
A member of the Chore Champ system. Users have two roles:

- **Parent**: Can manage children, approve chores, approve point requests, configure the app
- **Child**: Can view assigned chores, complete chores, request points, redeem rewards

```typescript
interface User {
  id: string;
  familyId: string;
  email: string;
  passwordHash: string; // Hashed by Cloudflare Access
  name: string;
  role: 'parent' | 'child';
  avatarId: string; // Reference to selected avatar
  points: number;
  pin?: string; // PIN for parent access (encrypted)
  settings: UserSettings;
  createdAt: number;
  updatedAt: number;
}

interface UserSettings {
  themeMode: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  language: string;
}
```

### Family
A logical grouping of users that share chore data. Each family has a unique identifier and is partitioned in the database.

```typescript
interface Family {
  id: string;
  name?: string; // Optional family name (e.g., "The Smith Family")
  createdAt: number;
  settings: FamilySettings;
}

interface FamilySettings {
  pointMultiplier?: number; // Optional: 2x points for extra motivation
  streakBonus?: number; // Optional: bonus for maintaining streaks
  weeklyReset?: boolean; // Optional: reset weekly chores on Sunday
}
```

### Chore
A task that needs to be completed by a child. Can be one-time, daily, or weekly recurring.

```typescript
enum ChoreStatus {
  Incomplete = 'INCOMPLETE',
  PendingApproval = 'PENDING_APPROVAL',
  Completed = 'COMPLETED',
}

enum ChoreRecurrence {
  None = 'NONE',
  Daily = 'DAILY',
  Weekly = 'WEEKLY',
}

interface Chore {
  id: string;
  familyId: string;
  name: string;
  description?: string;
  points: number;
  status: ChoreStatus;
  requiresApproval: boolean;
  recurrence: ChoreRecurrence;
  assignedTo?: string; // User ID or null for unassigned
  streak: number;
  lastCompletedDate?: string; // ISO date string
  createdAt: number;
  updatedAt: number;
  version: number; // For conflict detection
}
```

### Reward
A treat or privilege that can be redeemed for points.

```typescript
interface Reward {
  id: string;
  familyId: string;
  name: string;
  description: string;
  points: number;
  category: 'entertainment' | 'food' | 'privilege' | 'experience' | 'custom';
  quantityLimit?: number; // Optional: limit how many times can be redeemed
  cooldownDays?: number; // Optional: days between redemptions
  createdAt: number;
  updatedAt: number;
}
```

### Point Request
A request by a child to earn additional points for going above and beyond.

```typescript
enum PointRequestStatus {
  Pending = 'PENDING',
  Approved = 'APPROVED',
  Denied = 'DENIED',
}

interface PointRequest {
  id: string;
  familyId: string;
  userId: string; // ID of child who made the request
  description: string;
  pointsRequested: number;
  status: PointRequestStatus;
  approvedBy?: string; // User ID of parent who approved/denied
  approvedAt?: number;
  notes?: string; // Parent's notes when approving/denying
  createdAt: number;
  updatedAt: number;
}
```

### Notification
A message sent to a user about app events.

```typescript
enum NotificationType {
  ChoreCompletion = 'CHORE_COMPLETION',
  ChoreApproved = 'CHORE_APPROVED',
  ChoreDenied = 'CHORE_DENIED',
  PointRequestApproved = 'POINT_REQUEST_APPROVED',
  PointRequestDenied = 'POINT_REQUEST_DENIED',
  NewChoreAssigned = 'NEW_CHORE_ASSIGNED',
  RewardRedeemed = 'REWARD_REDEEMED',
  DailyReset = 'DAILY_RESET',
}

interface Notification {
  id: string;
  familyId: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: NotificationData; // Click action and context
  read: boolean;
  createdAt: number;
  expiresAt?: number; // Optional: when notification expires
}

interface NotificationData {
  choreId?: string; // If related to a chore
  requestId?: string; // If related to a point request
  rewardId?: string; // If related to a reward
  choreName?: string;
  points?: number;
  action?: 'view' | 'complete' | 'redeem';
}
```

### Avatar
A visual representation of a user. Stored as emoji for simplicity, can be upgraded to custom images.

```typescript
type AvatarCategory = 'boy' | 'girl' | 'neutral';

interface Avatar {
  id: string;
  name: string;
  category: AvatarCategory;
  emoji: string;
  description: string;
  tags: string[]; // For filtering (e.g., 'tech', 'creative')
}
```

### Theme
Visual styling configuration for the app.

```typescript
type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeConfig {
  mode: ThemeMode;
  lastChanged: number;
}
```

## Relationships

```
Family
├── Users (Parent + Children)
│   ├── Chores (assigned or unassigned)
│   ├── Rewards
│   └── Point Requests
└── Notifications (all users)
```

## Lifecycle States

### Chore Lifecycle
1. **Created**: Chore is added to the family
2. **Assigned**: Chore is assigned to a specific child (or unassigned for anyone)
3. **Pending**: Child marks as complete, awaiting approval (if requiresApproval=true)
4. **Approved**: Parent approves, points awarded to child
5. **Denied**: Parent denies, chore resets
6. **Completed**: Already approved, no further action needed

### Point Request Lifecycle
1. **Pending**: Child submits request, awaiting parent approval
2. **Approved**: Parent approves, points awarded
3. **Denied**: Parent denies, no points awarded

### Reward Redemption Lifecycle
1. **Available**: Reward can be redeemed
2. **Redeemed**: Child redeems reward, points deducted
3. **Cooldown**: Optional cooldown period before next redemption

## Security Concepts

### Authentication
- **Cloudflare Access**: Handles authentication and authorization
- **JWT Tokens**: Short-lived (24h) access tokens with custom claims
- **Custom Claims**: Include familyId, role, permissions, child references
- **Rate Limiting**: Prevents brute force attacks on auth endpoints

### Authorization
- **Parent Permissions**: Create/delete children, approve chores/requests, configure app
- **Child Permissions**: View assigned chores, complete chores, request points, redeem rewards
- **Family Isolation**: Each family can only access its own data

### Data Security
- **Password Hashing**: Handled by Cloudflare Access
- **PIN Encryption**: Parent PIN is encrypted in database
- **Row-Level Security**: D1 tables partitioned by familyId
- **Token Expiration**: Short-lived JWT tokens reduce attack surface

## Sync Concepts

### Offline-First Architecture
- **IndexedDB Cache**: Client maintains local cache of user data
- **Last-Write-Wins**: Simple conflict resolution strategy
- **Versioning**: Each record has version number for conflict detection
- **Background Sync**: Syncs when connection is restored

### Sync Flow
1. User performs action offline
2. Action queued in IndexedDB
3. When online, sync manager sends to server
4. Server processes request, returns updated data
5. Client updates local cache with server data

## Migration Concepts

### LocalStorage Migration
- **One-time process**: Existing users migrate from localStorage to server
- **Data validation**: Validates data integrity during migration
- **Graceful degradation**: Falls back to server if migration fails
- **Cleanup**: Removes localStorage keys after successful migration

## Performance Concepts

### Database Partitioning
- **familyId**: Primary partition key for all tables
- **Indexes**: On frequently queried fields (userId, status, date)
- **Scalability**: Single database scales efficiently within family

### Caching Strategy
- **Static Assets**: Cache-first strategy
- **User Data**: Network-first for fresh data
- **API Responses**: Cache with appropriate TTL
