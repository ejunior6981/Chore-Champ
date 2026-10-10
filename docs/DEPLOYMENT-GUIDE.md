# Chore Champ - Deployment Guide

## Overview

This guide walks you through deploying Chore Champ to Cloudflare Pages after local testing.

---

## 📋 Prerequisites

Before deploying, ensure you have:

- [x] Node.js 18+ installed
- [x] npm or yarn installed
- [x] Cloudflare account
- [x] GitHub account
- [x] Completed local testing (see checklist below)

---

## ✅ Local Testing Checklist

Before deploying, verify these features work:

### Core Features
- [ ] Create new chores
- [ ] Edit existing chores
- [ ] Add new rewards
- [ ] Request points (as child user)
- [ ] Approve requests (as parent user)
- [ ] Add manual points
- [ ] Switch between family members

### UI/UX
- [ ] Light/Dark/System theme switching
- [ ] Responsive design (mobile view)
- [ ] Full-screen mode
- [ ] Notifications panel
- [ ] Settings menu
- [ ] Modal interactions

### Data Management
- [ ] Refresh page - data persists
- [ ] Close and reopen app
- [ ] Test offline mode (disconnect internet)

---

## 🚀 Deployment Steps

### Step 1: Update Environment for Production

Edit `.env` file:

```env
# Production Database (replace with your actual credentials)
DATABASE_URL=postgresql://user:password@host:port/database

# Cloudflare Access (required for production)
CLOUDFLARE_ACCESS_URL=https://access.your-domain.com
CLOUDFLARE_ACCESS_CLIENT_ID=your-client-id
CLOUDFLARE_ACCESS_CLIENT_SECRET=your-client-secret

# API Key (optional)
GEMINI_API_KEY=your-api-key
```

### Step 2: Build for Production

```bash
npm run build
```

Check the `dist/` folder for build artifacts.

### Step 3: Push to GitHub

```bash
# Add all changes
git add .

# Commit
git commit -m "Prepare for deployment to Cloudflare Pages"

# Push to main branch
git push origin main
```

### Step 4: Create Cloudflare Pages Project

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** → **Create application**
3. Select **Connect to Git**
4. Connect your GitHub repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Framework preset**: Auto-detect (or select Vite)

### Step 5: Deploy

1. Click **Deploy**
2. Wait for build to complete
3. Your app will be live at: `https://your-project.pages.dev`

### Step 6: Set Up Cloudflare Access

1. Go to **Access** in Cloudflare Dashboard
2. Create a new **Access application**
3. Configure authentication:
   - Enable email/password authentication
   - Set token expiration (24 hours recommended)
4. Configure **Access control rules**:
   - Allow parents to manage their family
   - Restrict admin features
5. Set up **Sign-in experience**
6. Get your **Access URL**, **Client ID**, and **Client Secret**

### Step 7: Update Production Environment

Add these environment variables to Cloudflare Pages:

```bash
# Access these in Cloudflare Dashboard → Workers & Pages → Settings → Environment variables
CLOUDFLARE_ACCESS_URL=https://access.your-domain.com
CLOUDFLARE_ACCESS_CLIENT_ID=your-client-id
CLOUDFLARE_ACCESS_CLIENT_SECRET=your-client-secret
DATABASE_URL=postgresql://user:password@host:port/chore_champ
GEMINI_API_KEY=your-api-key
```

### Step 8: Create D1 Database

1. Go to **D1** in Cloudflare Dashboard
2. Create a new database: **chore_champ**
3. Run the schema SQL (see [Database Schema](database/schema.md))
4. Set up row-level security policies

---

## 🔐 Security Checklist

Before going live:

- [ ] Cloudflare Access configured
- [ ] Row-level security policies set up
- [ ] Environment variables secured
- [ ] HTTPS enabled (automatic with Cloudflare Pages)
- [ ] Rate limiting configured
- [ ] CORS policies set correctly

---

## 📊 Monitoring

### Enable Cloudflare Analytics

1. Go to **Analytics** in Cloudflare Dashboard
2. Enable **Real-time monitoring**
3. Set up **Custom events** for key actions

### Set Up Error Tracking

1. Install [Sentry](https://sentry.io/) (optional)
2. Add SDK to `index.tsx`
3. Configure error reporting

---

## 🔄 Continuous Deployment

Cloudflare Pages automatically deploys on push to main branch:

1. Developer pushes to GitHub
2. Cloudflare Pages detects changes
3. Runs `npm run build`
4. Deploys new version
5. Updates CDN cache

---

## 🎯 Post-Deployment Tasks

### 1. Test Production Build

Visit your production URL and verify:

- [ ] All features work
- [ ] Data persists
- [ ] Notifications work
- [ ] Responsive design works

### 2. Set Up Domain (Optional)

1. Go to **Pages** → **Domain management**
2. Add your custom domain
3. Configure DNS records
4. Force HTTPS

### 3. Configure CDN Cache

1. Go to **Cache Zone** in Cloudflare Dashboard
2. Set cache rules for static assets
3. Configure purge rules

---

## 📝 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | Database connection string |
| `CLOUDFLARE_ACCESS_URL` | ✅ | Access sign-in URL |
| `CLOUDFLARE_ACCESS_CLIENT_ID` | ✅ | Access client ID |
| `CLOUDFLARE_ACCESS_CLIENT_SECRET` | ✅ | Access client secret |
| `GEMINI_API_KEY` | ❌ | External API key (optional) |

---

## 🔧 Troubleshooting

### Build Fails

**Error**: `npm install` fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Error**: TypeScript errors
```bash
# Run type checking
npm run typecheck
# Fix errors, then rebuild
npm run build
```

### Deployment Fails

**Error**: Build output not found
- Check `vite.config.ts` build settings
- Verify `npm run build` works locally

**Error**: Environment variables not set
- Check Cloudflare Dashboard → Settings → Environment variables
- Ensure variables are prefixed with `VITE_` for client-side access

### Access Not Working

**Error**: Cannot access protected routes
- Verify Cloudflare Access is configured
- Check token expiration settings
- Review access control rules

---

## 📚 Additional Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Cloudflare Access Docs](https://developers.cloudflare.com/access/)
- [D1 Database Docs](https://developers.cloudflare.com/d1/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

---

## 🆘 Support

For issues:
1. Check [API Documentation](api/openapi.yaml)
2. Review [Database Schema](database/schema.md)
3. Check [Deployment Guide](deployment/deploy.md)
4. Contact support team

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Ready for Production Deployment ✅
