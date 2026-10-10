# Cloudflare Dev/Test Environment Setup Guide

## Overview

This guide explains how to set up multiple environments (dev, test, production) on Cloudflare Pages using branches.

---

## Current Setup

Your app is currently deployed to:
- **Production**: `https://your-project.pages.dev` (main branch)
- **Dev/Test**: Not yet configured

---

## Quick Start: Setting Up Dev/Test Environments

### Step 1: Create Branches in GitHub

```bash
# Create dev branch
git checkout -b dev
git push origin dev

# Create test branch
git checkout -b test
git push origin test
```

### Step 2: Configure Cloudflare Pages Branches

1. Go to your Cloudflare Pages project dashboard
2. Navigate to **Settings** → **Branches**
3. Add branch configurations:

| Branch | Production Subdomain | Environment |
|--------|---------------------|-------------|
| `main` | (blank - root domain) | Production |
| `dev` | `dev` | Development |
| `test` | `test` | Testing |
| `feature/*` | (blank - auto preview) | Feature Preview |

**Example URLs:**
- Production: `https://your-project.pages.dev`
- Dev: `https://dev.your-project.pages.dev`
- Test: `https://test.your-project.pages.dev`

### Step 3: Push to Dev Branch

```bash
git checkout dev
# Make your changes
git add .
git commit -m "Update development version"
git push origin dev
```

Cloudflare will automatically deploy to `https://dev.your-project.pages.dev`

---

## Environment Detection

The `vite.config.ts` is now configured to detect the environment:

```typescript
// Environment detection
const cfPagesBuild = env.CF_PAGES_BUILD; // Set to 'true' on Cloudflare Pages
const cfPagesBranch = env.CF_PAGES_BRANCH; // 'main', 'dev', 'test', etc.
const nodeEnv = env.NODE_ENV || 'development';

// Environment flags
const isProduction = cfPagesBranch === 'main' || nodeEnv === 'production';
const isDev = mode === 'development' || !isProduction;
```

**Available Environment Variables:**
- `process.env.IS_DEV` - `true` for dev/test branches
- `process.env.IS_PRODUCTION` - `true` for main branch
- `process.env.CF_PAGES_BRANCH` - Current branch name
- `process.env.CF_PAGES_BUILD` - Set to `true` on Cloudflare Pages

---

## Recommended Workflow

### Development Workflow

1. **Feature Development:**
   ```bash
   git checkout -b feature/new-feature
   # Make changes
   git push origin feature/new-feature
   # Auto-deploys to preview URL
   ```

2. **Testing on Dev Environment:**
   ```bash
   git checkout dev
   git push origin dev
   # Test at: https://dev.your-project.pages.dev
   ```

3. **Merge to Test Environment:**
   ```bash
   git checkout test
   git push origin test
   # Test at: https://test.your-project.pages.dev
   ```

4. **Merge to Production:**
   ```bash
   git checkout main
   git push origin main
   # Auto-deploys to: https://your-project.pages.dev
   ```

### Pull Request Workflow

1. Create feature branch: `git checkout -b feature/xyz`
2. Push to GitHub: `git push origin feature/xyz`
3. Cloudflare auto-creates preview URL
4. Test preview URL
5. Submit pull request to `dev` branch
6. Merge to `dev` after testing
7. Merge from `dev` to `main` when ready for production

---

## Environment-Specific Configuration

### Add Environment Variables

In Cloudflare Pages Dashboard (**Settings** → **Environment Variables**):

| Variable | Production (main) | Dev/Test | Description |
|----------|------------------|----------|-------------|
| `DATABASE_URL` | `postgresql://...` | `sqlite:./dev.db` | Database URL |
| `GEMINI_API_KEY` | `your-production-key` | `your-dev-key` | API keys |
| `CLOUDFLARE_ACCESS_URL` | `https://...` | (blank) | Access URL |
| `CLOUDFLARE_ACCESS_CLIENT_ID` | `your-client-id` | (blank) | Client ID |
| `CLOUDFLARE_ACCESS_CLIENT_SECRET` | `your-secret` | (blank) | Client secret |

**Tip:** Leave dev/test variables blank to use local development mode.

---

## Custom Domain Setup (Optional)

If you want custom subdomains instead of `*.pages.dev`:

### 1. Add Custom Domains in Cloudflare

1. Go to **Pages** → **Custom domains**
2. Add domains:
   - `dev.yourdomain.com`
   - `test.yourdomain.com`
   - `staging.yourdomain.com`

### 2. Create DNS Records

In Cloudflare Dashboard (**DNS** → **Add Record**):

| Type | Name | Value | Proxy Status |
|------|------|-------|--------------|
| CNAME | dev | `dev.your-project.pages.dev` | Full (Proxied) |
| CNAME | test | `test.your-project.pages.dev` | Full (Proxied) |
| CNAME | staging | `staging.your-project.pages.dev` | Full (Proxied) |

### 3. Update Cloudflare Pages Branch Settings

- **Branch**: `dev` → **Production subdomain**: `dev.yourdomain.com`
- **Branch**: `test` → **Production subdomain**: `test.yourdomain.com`

---

## Deployment Scripts

### Add to `.gitignore`

```gitignore
# Local development databases
local-chore-champ.db
dev.db
test.db

# Build outputs
dist/
```

### Create Deployment Scripts

Create `scripts/deploy.sh`:

```bash
#!/bin/bash

# Deploy to dev environment
echo "🚀 Deploying to dev environment..."
git checkout dev
git pull origin dev
npm run build
git add dist/
git commit -m "Deploy to dev: $(git log -1 --pretty=format:'%s')"
git push origin dev

echo "✅ Dev deployment complete!"
echo "🌐 URL: https://dev.your-project.pages.dev"
```

Create `scripts/deploy-test.sh`:

```bash
#!/bin/bash

# Deploy to test environment
echo "🚀 Deploying to test environment..."
git checkout test
git pull origin test
npm run build
git add dist/
git commit -m "Deploy to test: $(git log -1 --pretty=format:'%s')"
git push origin test

echo "✅ Test deployment complete!"
echo "🌐 URL: https://test.your-project.pages.dev"
```

Make executable:
```bash
chmod +x scripts/deploy.sh
chmod +x scripts/deploy-test.sh
```

---

## Environment Comparison

| Feature | Production (main) | Dev | Test |
|---------|-------------------|-----|------|
| URL | `your-project.pages.dev` | `dev.your-project.pages.dev` | `test.your-project.pages.dev` |
| Minification | ✅ Enabled | ❌ Disabled | ❌ Disabled |
| Sourcemaps | ❌ Disabled | ✅ Enabled | ✅ Enabled |
| Database | PostgreSQL | SQLite (optional) | SQLite (optional) |
| API Keys | Production keys | Dev keys (optional) | Test keys (optional) |
| Access Required | ✅ Yes | ❌ No | ❌ No |
| Row-Level Security | ✅ Enabled | ❌ Disabled | ❌ Disabled |

---

## Troubleshooting

### Preview Not Loading

1. Check build logs in Cloudflare Pages dashboard
2. Verify `vite.config.ts` is correct
3. Clear build cache in Cloudflare Pages settings

### Environment Variables Not Working

1. Go to **Settings** → **Environment Variables**
2. Add variables for each branch
3. Redeploy after adding variables

### Wrong Environment Detected

Check `vite.config.ts` is reading `CF_PAGES_BUILD` correctly:
```bash
# Add to .env for testing
CF_PAGES_BUILD=true
CF_PAGES_BRANCH=dev
```

---

## Best Practices

### 1. Use Feature Branches for New Features
```bash
git checkout -b feature/xyz-123
# Develop and test
git push origin feature/xyz-123
# Auto-preview URL created
```

### 2. Keep Dev Branch Up-to-Date
```bash
# Periodically merge main to dev
git checkout dev
git merge main
git push origin dev
```

### 3. Use Test Branch for Pre-Production Testing
```bash
# Merge dev to test for final testing
git checkout test
git merge dev
git push origin test
```

### 4. Document Environment-Specific Config
Add to `README.md`:
```markdown
## Environment Setup

- **Dev**: `dev.your-project.pages.dev` - For active development
- **Test**: `test.your-project.pages.dev` - For pre-production testing
- **Production**: `your-project.pages.dev` - Live app
```

---

## Next Steps

1. ✅ **Create dev and test branches** in GitHub
2. ✅ **Configure Cloudflare Pages** branch settings
3. ✅ **Push to dev branch** to test
4. ✅ **Set up environment variables** for each branch
5. ✅ **Test the dev environment** URL
6. ✅ **Create custom domains** (optional)

---

## Quick Reference

### Commands

```bash
# Switch to dev
git checkout dev

# Push to dev
git push origin dev

# Switch to test
git checkout test
git push origin test

# Switch to main (production)
git checkout main
git push origin main
```

### URLs

- Production: `https://your-project.pages.dev`
- Dev: `https://dev.your-project.pages.dev`
- Test: `https://test.your-project.pages.dev`

### Environment Detection

The app automatically detects:
- ✅ Development mode (dev/test branches)
- ✅ Production mode (main branch)
- ✅ Sourcemaps for debugging in dev
- ✅ Minification for production

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: ✅ Ready for Dev/Test Setup
