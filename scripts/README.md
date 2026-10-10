# 🚀 Chore Champ - Git Workflow Scripts

## Quick Start

### Push to Both Dev and Test Branches (Recommended)

```bash
chmod +x scripts/push-to-both.sh
./scripts/push-to-both.sh
```

This will:
- ✅ Stage all changes
- ✅ Commit with current commit message
- ✅ Create and push to `dev` branch
- ✅ Create and push to `test` branch

### Push to Individual Branches

```bash
# Push to dev only
./scripts/push-to-dev.sh

# Push to test only
./scripts/push-to-test.sh
```

### Push to Production (Main Branch)

```bash
git checkout main
git push origin main
```

---

## Available Scripts

| Script | Purpose |
|--------|---------|
| `push-to-both.sh` | Push to dev AND test branches |
| `push-to-dev.sh` | Push to dev branch only |
| `push-to-test.sh` | Push to test branch only |
| `push-to-branches.sh` | Full workflow with status check |

---

## Usage Examples

### After Making Changes

```bash
# Make your code changes
# Edit files, add features, etc.

# Push to dev and test
./scripts/push-to-both.sh
```

### After Testing Locally

```bash
# Test on local development server
npm run dev
# Visit: http://localhost:5173

# When ready, push to dev
./scripts/push-to-dev.sh

# Visit: dev.YOUR_PROJECT.pages.dev
```

### Before Production Release

```bash
# Test on dev and test environments
./scripts/push-to-both.sh
# Test both URLs

# When ready for production
git checkout main
git push origin main
# Visits: YOUR_PROJECT.pages.dev
```

---

## Branch Structure

```
main (production)
├── dev.YOUR_PROJECT.pages.dev (development)
└── test.YOUR_PROJECT.pages.dev (testing)
```

### Environment URLs

| Branch | URL | Purpose |
|--------|-----|---------|
| `main` | `YOUR_PROJECT.pages.dev` | Production (live app) |
| `dev` | `dev.YOUR_PROJECT.pages.dev` | Active development |
| `test` | `test.YOUR_PROJECT.pages.dev` | Pre-production testing |
| `feature/*` | Auto-preview | Feature development |

---

## Workflow

### 1. Develop Locally

```bash
npm run dev
# Edit code, test features
```

### 2. Push to Dev/Test

```bash
./scripts/push-to-both.sh
# Test on Cloudflare dev/test URLs
```

### 3. Test on Cloudflare

```bash
# Dev environment
dev.YOUR_PROJECT.pages.dev

# Test environment  
test.YOUR_PROJECT.pages.dev
```

### 4. Deploy to Production

```bash
git checkout main
git push origin main
# Auto-deploys to production
```

---

## Cloudflare Pages Setup

After running the push scripts, configure Cloudflare Pages:

1. Go to: https://dash.cloudflare.com/profile/accounts/*/pages/projects/YOUR_PROJECT
2. Click **Settings** → **Branches**
3. Add branch configurations:

| Branch | Production Subdomain |
|--------|---------------------|
| `main` | (leave blank) |
| `dev` | `dev` |
| `test` | `test` |

4. Click **Save**

---

## Manual Git Commands

If you prefer manual git commands:

```bash
# Stage all changes
git add .

# Commit
git commit -m "Your commit message"

# Push to dev
git checkout -b dev
git push -u origin dev

# Push to test
git checkout -b test
git push -u origin test

# Push to main (production)
git checkout main
git push origin main
```

---

## Troubleshooting

### "branch 'dev' not found"

```bash
# Create the branch locally first
git branch dev

# Then push
git push -u origin dev
```

### "remote branch dev does not exist"

```bash
# Create and push in one command
git push --set-upstream origin dev
```

### No changes to commit

```bash
# Force push anyway (be careful!)
git push -f origin dev
```

### Switch branches manually

```bash
git checkout dev  # or
git switch dev
```

---

## Environment Variables

For Cloudflare Pages environment variables:

1. Go to: Settings → Environment Variables
2. For `main` branch (production):
   ```
   DATABASE_URL=postgresql://user:password@host:port/chore_champ
   CLOUDFLARE_ACCESS_URL=https://access.your-domain.com
   CLOUDFLARE_ACCESS_CLIENT_ID=your-client-id
   CLOUDFLARE_ACCESS_CLIENT_SECRET=your-client-secret
   GEMINI_API_KEY=your-api-key
   ```

3. For `dev` and `test` branches: Leave blank (uses local mode)

---

## Next Steps

1. ✅ **Run push script**: `./scripts/push-to-both.sh`
2. ✅ **Configure Cloudflare**: Set up branch subdomains
3. ✅ **Test dev environment**: Visit `dev.YOUR_PROJECT.pages.dev`
4. ✅ **Test test environment**: Visit `test.YOUR_PROJECT.pages.dev`
5. ✅ **Deploy to production**: Push to `main` branch

---

**Version**: 1.0.0  
**Status**: ✅ Ready to Use
