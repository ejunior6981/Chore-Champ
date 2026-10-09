# Chore Champ Admin Portal Deployment Guide

## Overview

This guide covers deploying the Chore Champ admin portal for managing family members, chores, rewards, and point requests.

## Prerequisites

- Cloudflare Pages account
- D1 database access
- Parent account with admin privileges

## Deployment Steps

### 1. Push Code to GitHub

```bash
git add .
git commit -m "Add admin portal shell"
git push origin main
```

### 2. Deploy to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
3. Select your GitHub repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Click **Deploy site**

### 3. Set Up Admin Authentication

The admin portal uses the same authentication as the main app. Parents automatically have admin access.

### 4. Configure Admin Routes

The admin portal is accessible at `/admin/*` routes.

### 5. Test Admin Portal

1. Visit your deployment URL
2. Login with parent credentials
3. Navigate to `/admin` to access the admin dashboard

## Admin Features

### Family Management

- View all family members
- Add new children
- Edit member details
- Reset points
- Delete members

### Chore Management

- View all chores
- Edit chore details
- Assign/unassign chores
- Override chore status

### Reward Management

- View all rewards
- Add new rewards
- Edit reward details
- Delete rewards

### Point Request Management

- View pending requests
- Approve requests
- Deny requests with notes
- View request history

### Notifications

- View all notifications
- Mark as read
- Clear read notifications

## Admin Dashboard

The admin dashboard provides an overview of:

- Total family members
- Pending point requests
- Incomplete chores
- Rewards available

## Security

- **Authentication**: JWT tokens with parent role
- **Authorization**: Row-level security in D1 database
- **Rate Limiting**: 100 requests per minute
- **Token Expiration**: 24 hours

## Future Features (Monetization Ready)

The admin portal shell is built to support:

- **Payment Processing**: Stripe integration ready
- **Subscription Management**: Recurring billing hooks
- **Analytics Dashboard**: Usage statistics
- **Family Plans**: Multi-family management
- **Premium Features**: Advanced chore tracking

## Troubleshooting

### Can't Access Admin Portal

- Ensure you're logged in with a parent account
- Check that your account has admin privileges
- Verify the admin route is not blocked

### Build Fails

- Check build logs in Cloudflare Dashboard
- Ensure all dependencies are in `package.json`
- Run `npm install` locally to verify dependencies

### Data Not Syncing

- Verify database connection
- Check D1 database credentials
- Ensure row-level security is configured

## Support

For issues:
1. Check in-app help section
2. Visit support page
3. Contact support team

## Next Steps

1. Set up analytics (optional)
2. Configure custom branding
3. Add additional admin features
4. Set up monitoring and alerts
