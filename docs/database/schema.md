# Chore Champ Database Schema

## Overview

Chore Champ uses a single D1 database (SQLite) with multi-tenant architecture. Each family is partitioned using `family_id`.

## Design Principles

1. **Single Database**: All families share one database for efficient scaling
2. **Partitioning**: `family_id` is the partition key for all tables
3. **Row-Level Security**: D1 RLS ensures data isolation between families
4. **Indexes**: Strategic indexes on frequently queried fields
5. **Versioning**: Each record has a version number for conflict detection

## Tables

### Users

Stores all family members (parents and children).

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('parent', 'child')),
  avatar_id TEXT,
  points INTEGER DEFAULT 0,
  pin_hash TEXT,
  settings TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX idx_users_family_id ON users(family_id);
CREATE INDEX idx_users_email ON users(email);
```

**Fields:**
- `id`: Unique identifier (UUID)
- `family_id`: Partition key, links to family
- `email`: User's email address (unique)
- `password_hash`: Hashed password (stored by Cloudflare Access)
- `name`: Display name
- `role`: 'parent' or 'child'
- `avatar_id`: Selected avatar identifier
- `points`: Current point balance
- `pin_hash`: Encrypted PIN for parent access
- `settings`: JSON with user preferences
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

**Indexes:**
- `family_id`: For family-scoped queries
- `email`: For login lookups

### Chores

Stores all chores in the family.

```sql
CREATE TABLE chores (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  points INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('INCOMPLETE', 'PENDING_APPROVAL', 'COMPLETED')),
  requires_approval BOOLEAN DEFAULT FALSE,
  recurrence TEXT DEFAULT 'NONE' CHECK (recurrence IN ('NONE', 'DAILY', 'WEEKLY')),
  assigned_to TEXT,
  streak INTEGER DEFAULT 0,
  last_completed_date TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  version INTEGER DEFAULT 1
);

CREATE INDEX idx_chores_family_id ON chores(family_id);
CREATE INDEX idx_chores_assigned_to ON chores(assigned_to);
CREATE INDEX idx_chores_status ON chores(status);
```

**Fields:**
- `id`: Unique identifier (UUID)
- `family_id`: Partition key
- `name`: Chore name
- `description`: Optional details
- `points`: Point value
- `status`: Current status (INCOMPLETE, PENDING_APPROVAL, COMPLETED)
- `requires_approval`: Whether parent approval needed
- `recurrence`: Frequency (NONE, DAILY, WEEKLY)
- `assigned_to`: User ID or null for unassigned
- `streak`: Completion streak count
- `last_completed_date`: Last completion timestamp
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp
- `version`: For conflict detection

**Indexes:**
- `family_id`: Family-scoped queries
- `assigned_to`: Find chores for specific user
- `status`: Filter by status

### Rewards

Stores all available rewards.

```sql
CREATE TABLE rewards (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  points INTEGER NOT NULL,
  category TEXT DEFAULT 'custom',
  quantity_limit INTEGER,
  cooldown_days INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX idx_rewards_family_id ON rewards(family_id);
```

**Fields:**
- `id`: Unique identifier (UUID)
- `family_id`: Partition key
- `name`: Reward name
- `description`: Reward details
- `points`: Point cost
- `category`: Entertainment, food, privilege, experience, custom
- `quantity_limit`: Max redemptions (optional)
- `cooldown_days`: Days between redemptions (optional)
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

**Indexes:**
- `family_id`: Family-scoped queries

### Point Requests

Stores point requests from children.

```sql
CREATE TABLE point_requests (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  description TEXT NOT NULL,
  points INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'DENIED')),
  approved_by TEXT,
  approved_at INTEGER,
  notes TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX idx_requests_family_id ON point_requests(family_id);
CREATE INDEX idx_requests_user_id ON point_requests(user_id);
CREATE INDEX idx_requests_status ON point_requests(status);
```

**Fields:**
- `id`: Unique identifier (UUID)
- `family_id`: Partition key
- `user_id`: Child who made request
- `description`: What they did
- `points`: Points requested
- `status`: PENDING, APPROVED, DENIED
- `approved_by`: Parent who approved/denied
- `approved_at`: Approval timestamp
- `notes`: Parent's notes (optional)
- `created_at`: Request creation timestamp
- `updated_at`: Last update timestamp

**Indexes:**
- `family_id`: Family-scoped queries
- `user_id`: Find requests by user
- `status`: Filter by status

### Notifications

Stores all notifications.

```sql
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at INTEGER NOT NULL,
  expires_at INTEGER
);

CREATE INDEX idx_notifications_family_id ON notifications(family_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
```

**Fields:**
- `id`: Unique identifier (UUID)
- `family_id`: Partition key
- `user_id`: Target user
- `type`: Notification type
- `title`: Notification title
- `body`: Notification body
- `data`: JSON with additional data
- `read`: Whether notification was read
- `created_at`: Creation timestamp
- `expires_at`: Optional expiration timestamp

**Indexes:**
- `family_id`: Family-scoped queries
- `user_id`: Find notifications for user
- `read`: Filter read/unread

## Row-Level Security Policies

All tables use `family_id` for data isolation:

```sql
-- Policy: Users can view own family data
CREATE POLICY "Users can view own family data" ON users
  USING (family_id = current_setting('family_id')::text);

-- Similar policies for all other tables
```

## Data Flow

### User Registration
1. Parent registers with email/password
2. Cloudflare Access validates and hashes password
3. If first user, creates default family
4. Inserts user record

### Chore Creation
1. Parent creates chore
2. Insert into chores table
3. Set appropriate status and recurrence

### Chore Completion
1. Child marks chore complete
2. Update status to PENDING_APPROVAL
3. Create notification
4. Queue sync operation

### Chore Approval
1. Parent approves chore
2. Update status to COMPLETED
3. Add points to child
4. Create notification
5. Update streak if applicable

## Migration from localStorage

The migration utility handles data migration:

```typescript
// Migration script
async function migrate() {
  // 1. Read from localStorage
  const users = localStorage.getItem('chore-champ-users');
  const chores = localStorage.getItem('chore-champ-chores');
  
  // 2. Validate data
  if (!users || !chores) {
    throw new Error('No data to migrate');
  }
  
  // 3. Create default family if needed
  const familyId = crypto.randomUUID();
  
  // 4. Insert into database
  await db.users.insert(users);
  await db.chores.insert(chores);
  
  // 5. Mark migration complete
  localStorage.setItem('chore-champ-migration-status', 'completed');
}
```

## Performance Considerations

1. **Partitioning**: All queries include `family_id` filter
2. **Indexing**: Strategic indexes on frequently queried fields
3. **Caching**: Client-side IndexedDB cache for offline support
4. **Batching**: Batch operations for bulk updates
5. **Pagination**: Use LIMIT/OFFSET for large result sets

## Security Considerations

1. **Row-Level Security**: Prevents cross-family data access
2. **Password Hashing**: Handled by Cloudflare Access
3. **Token Expiration**: JWT tokens expire after 24 hours
4. **Rate Limiting**: Cloudflare Access handles brute force prevention
5. **Input Validation**: All inputs validated before database insert

## Monitoring

Key metrics to monitor:

1. **Query Performance**: Slow query logs
2. **Storage Usage**: Database size growth
3. **Connection Count**: Active connections
4. **Error Rates**: Failed queries
5. **Migration Status**: Migration completion

## Backup Strategy

1. **Automatic Backups**: Cloudflare provides point-in-time recovery
2. **Export**: Regular SQL dumps for critical data
3. **Cross-Region**: Consider multi-region deployment for critical apps

## Scaling Considerations

1. **Single Database**: D1 scales automatically within limits
2. **Partitioning**: family_id enables efficient queries
3. **Indexes**: Strategic indexing for common queries
4. **Caching**: Client-side cache reduces database load
5. **Connection Pooling**: Managed by Cloudflare
