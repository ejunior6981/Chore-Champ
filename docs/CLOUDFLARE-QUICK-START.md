# Quick Start: Dev/Test Environments on Cloudflare

## 🎯 What You Have Now

- ✅ **Production**: Connected to `main` branch → `your-project.pages.dev`
- ✅ **vite.config.ts**: Updated to detect dev/test/production environments
- ✅ **Environment variables**: Configured for automatic detection

## 🚀 3-Step Setup

### Step 1: Create Dev and Test Branches

```bash
# Create dev branch
git checkout -b dev
git push origin dev

# Create test branch
git checkout -b test
git push origin test
```

### Step 2: Configure Cloudflare Pages Branches

1. Go to: https://dash.cloudflare.com/profile/accounts/*/pages/projects/YOUR_PROJECT
2. Click **Settings** → **Branches**
3. Add these branch configurations:

| Branch | Production Subdomain | Environment |
|--------|---------------------|-------------|
| `main` | (leave blank) | Production |
| `dev` | `dev` | Development |
| `test` | `test` | Testing |

### Step 3: Test Your Dev Environment

```bash
# Switch to dev
git checkout dev
git push origin dev

# Open your dev URL
# https://dev.your-project.pages.dev
```

## 📋 Your Environment URLs

| Branch | URL | Purpose |
|--------|-----|---------|
| `main` | `your-project.pages.dev` | Production (live app) |
| `dev` | `dev.your-project.pages.dev` | Active development |
| `test` | `test.your-project.pages.dev` | Pre-production testing |
| `feature/*` | `dev.your-project.pages.dev/commits/xxx` | Auto-preview for PRs |

## 🔄 Typical Workflow

### 1. Develop a New Feature
```bash
git checkout -b feature/new-chore-feature
# Make changes
git add .
git commit -m "Add new chore feature"
git push origin feature/new-chore-feature
# Auto-preview URL created automatically
```

### 2. Test on Dev Environment
```bash
git checkout dev
git push origin dev
# Test at: https://dev.your-project.pages.dev
```

### 3. Test on Test Environment
```bash
git checkout test
git merge dev
git push origin test
# Test at: https://test.your-project.pages.dev
```

### 4. Deploy to Production
```bash
git checkout main
git merge test
git push origin main
# Auto-deploys to: https://your-project.pages.dev
```

## 🔧 Current Configuration

### vite.config.ts Environment Detection

The app now automatically detects the environment:

```typescript
// Detects from Cloudflare Pages build
const cfPagesBuild = env.CF_PAGES_BUILD;
const cfPagesBranch = env.CF_PAGES_BRANCH;

// Environment flags
const isProduction = cfPagesBranch === 'main' || nodeEnv === 'production';
const isDev = mode === 'development' || !isProduction;
```

**Environment Variables Available:**
- `process.env.IS_DEV` - `true` for dev/test branches
- `process.env.IS_PRODUCTION` - `true` for main branch
- `process.env.CF_PAGES_BRANCH` - Current branch name
- `process.env.CF_PAGES_BUILD` - Set to `true` on Cloudflare Pages

### Build Behavior

| Environment | Minification | Sourcemaps | Target |
|-------------|-------------|------------|--------|
| Production (main) | ✅ Enabled | ❌ Disabled | es2015 |
| Dev/Test | ❌ Disabled | ✅ Enabled | es2015 |

## 📝 Environment Variables

### For Production (main branch)
In Cloudflare Pages Dashboard → Settings → Environment Variables:

```env
DATABASE_URL=postgresql://user:password@host:port/chore_champ
CLOUDFLARE_ACCESS_URL=https://access.your-domain.com
CLOUDFLARE_ACCESS_CLIENT_ID=your-client-id
CLOUDFLARE_ACCESS_CLIENT_SECRET=your-client-secret
GEMINI_API_KEY=your-production-api-key
```

### For Dev/Test (dev/test branches)
Leave blank or use local mode:

```env
# Optional: Use SQLite for dev/testing
DATABASE_URL=sqlite:./dev.db

# Leave blank for local development mode
CLOUDFLARE_ACCESS_URL=
CLOUDFLARE_ACCESS_CLIENT_ID=
CLOUDFLARE_ACCESS_CLIENT_SECRET=
GEMINI_API_KEY=
```

## 🎯 Next Steps

1. ✅ **Create branches**: Run the commands above
2. ✅ **Configure Cloudflare**: Set up branch subdomains
3. ✅ **Push to dev**: Test the dev environment
4. ✅ **Set up environment variables**: In Cloudflare dashboard
5. ✅ **Test all environments**: main, dev, test

## 📚 Full Documentation

See `docs/CLOUDFLARE-DEV-SETUP.md` for:
- Detailed workflow instructions
- Custom domain setup
- Deployment scripts
- Troubleshooting guide

---

**Quick Command Summary:**

```bash
# Create branches
git checkout -b dev && git push origin dev
git checkout -b test && git push origin test

# Switch to dev and test
git checkout dev && git push origin dev
# Visit: https://dev.your-project.pages.dev
```

---

**Status**: ✅ Ready for Dev/Test Setup  
**Version**: 1.0.0
