# Chore Champ Deployment Guide

## Overview

This guide covers deploying Chore Champ to Cloudflare Pages with D1 database and Cloudflare Access authentication.

## Prerequisites

- GitHub account
- Cloudflare account (free tier is sufficient)
- Cloudflare Pages project setup

## Step 1: Push to GitHub

1. Push your code to a GitHub repository
2. Make sure all files are committed

```bash
git add .
git commit -m "Initial commit with multi-tenant architecture"
git push origin main
```

## Step 2: Create Cloudflare Pages Project

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
3. Select your GitHub repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Click **Deploy site**

## Step 3: Set Up Cloudflare Access

### 1. Create Access Application

1. Go to **Access** → **Applications** → **Create application**
2. Choose **Create a new application**
3. Name: `Chore Champ`
4. Select **Internal application**
5. Click **Create**

### 2. Configure Authentication Policy

1. Go to **Access** → **Authentication policies**
2. Click **Create policy**
3. Choose **Email and password**
4. Configure:
   - **Domain**: Your domain or email provider
   - **Custom claims**: Add family_id, role, permissions
5. Save and continue

### 3. Set Up Sign-In Experience

1. Go to **Access** → **Sign-in experiences**
2. Click **Create sign-in experience**
3. Configure:
   - **Sign-in page**: Custom URL or Cloudflare's default
   - **Logo**: Upload your logo
   - **Branding**: Choose theme colors
4. Save

### 4. Configure Access Control

1. Go to **Access** → **Access control** → **Create access rule**
2. Click **Create rule**
3. Name: `Chore Champ Access`
4. Select your Chore Champ application
5. Click **Add rule**
6. Configure rules:
   - **Allow**: All authenticated users
   - **Custom claims**: family_id, role
7. Save

## Step 4: Set Up D1 Database

### 1. Create D1 Database

1. Go to **D1** → **Create database**
2. Name: `chore-champ-db`
3. Region: Choose closest to your users
4. Click **Create database**

### 2. Create Tables

Run the following SQL to create tables:

```sql
-- Users table
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

-- Create indexes
CREATE INDEX idx_users_family_id ON users(family_id);
CREATE INDEX idx_users_email ON users(email);

-- Chores table
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

-- Create indexes
CREATE INDEX idx_chores_family_id ON chores(family_id);
CREATE INDEX idx_chores_assigned_to ON chores(assigned_to);
CREATE INDEX idx_chores_status ON chores(status);

-- Rewards table
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

-- Create indexes
CREATE INDEX idx_rewards_family_id ON rewards(family_id);

-- Point requests table
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

-- Create indexes
CREATE INDEX idx_requests_family_id ON point_requests(family_id);
CREATE INDEX idx_requests_user_id ON point_requests(user_id);
CREATE INDEX idx_requests_status ON point_requests(status);

-- Notifications table
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

-- Create indexes
CREATE INDEX idx_notifications_family_id ON notifications(family_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
```

### 3. Set Up Row-Level Security

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chores ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policy for users
CREATE POLICY "Users can view own family data" ON users
  USING (family_id = current_setting('family_id')::text);

-- Create policy for chores
CREATE POLICY "Users can view own family chores" ON chores
  USING (family_id = current_setting('family_id')::text);

-- Create policy for rewards
CREATE POLICY "Users can view own family rewards" ON rewards
  USING (family_id = current_setting('family_id')::text);

-- Create policy for point requests
CREATE POLICY "Users can view own family requests" ON point_requests
  USING (family_id = current_setting('family_id')::text);

-- Create policy for notifications
CREATE POLICY "Users can view own family notifications" ON notifications
  USING (family_id = current_setting('family_id')::text);
```

## Step 5: Environment Variables

Set these environment variables in Cloudflare Pages:

```
DATABASE_URL=postgresql://user:password@host:port/database
CLOUDFLARE_ACCESS_URL=https://access.your-domain.com
CLOUDFLARE_ACCESS_CLIENT_ID=your-client-id
CLOUDFLARE_ACCESS_CLIENT_SECRET=your-client-secret
```

## Step 6: Deploy

1. Wait for the build to complete
2. Check the preview URL
3. Click **Production deployment**
4. Wait for deployment to complete

## Step 7: Custom Domain (Optional)

1. Go to **Workers & Pages** → Your project
2. Click **Domains** → **Add custom domain**
3. Follow Cloudflare's instructions for DNS configuration

## Step 8: Test

1. Visit your deployment URL
2. Register a new account
3. Test authentication
4. Verify PWA install prompt
5. Test notifications (if enabled)

## Troubleshooting

### Build Fails

- Check build logs in Cloudflare Dashboard
- Ensure all dependencies are in `package.json`
- Run `npm install` locally to verify dependencies

### Database Connection Errors

- Verify `DATABASE_URL` is set correctly
- Check database credentials
- Ensure D1 database is created

### Authentication Errors

- Verify Access application is configured
- Check access rules
- Ensure custom claims are set correctly

## Next Steps

1. Set up analytics (optional)
2. Configure custom branding
3. Add additional security rules
4. Set up monitoring and alerts

## Support

For issues, check:
- Cloudflare Dashboard logs
- Build output
- Database logs
- Browser console
