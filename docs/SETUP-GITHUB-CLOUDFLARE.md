# Chore Champ - GitHub & Cloudflare Setup Guide

## Quick Setup Commands

### Step 1: Create Dev and Test Branches

Run these commands in your terminal:

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
3. Add these configurations:

| Branch | Production Subdomain |
|--------|---------------------|
| `main` | (leave blank) |
| `dev` | `dev` |
| `test` | `test` |

4. Click **Save**

### Step 3: Test Your Dev Environment

```bash
# Switch to dev and push
git checkout dev
git push origin dev

# Visit: https://dev.YOUR_PROJECT.pages.dev
```

---

## Automated Setup

### Option 1: Run Setup Script

```bash
# Make script executable
chmod +x scripts/setup-dev-environments.sh

# Run setup script
./scripts/setup-dev-environments.sh
```

### Option 2: Run Commands Manually

```bash
# Create and push dev branch
git checkout -b dev
git add .
git commit -m "Setup dev branch"
git push origin dev

# Create and push test branch
git checkout -b test
git add .
git commit -m "Setup test branch"
git push origin test
```

---

## Environment URLs

After setup, you'll have:

| Branch | URL | Purpose |
|--------|-----|---------|
| `main` | `YOUR_PROJECT.pages.dev` | Production |
| `dev` | `dev.YOUR_PROJECT.pages.dev` | Development |
| `test` | `test.YOUR_PROJECT.pages.dev` | Testing |
| `feature/*` | Auto-preview URLs | Feature testing |

---

## Cloudflare Dashboard Setup Checklist

- [ ] Go to Cloudflare Pages project
- [ ] Click Settings → Branches
- [ ] Add `dev` branch with subdomain `dev`
- [ ] Add `test` branch with subdomain `test`
- [ ] Save configuration
- [ ] Test dev environment URL
- [ ] Verify production still works

---

## Environment Variables Setup

After creating branches, configure environment variables:

1. Go to: Settings → Environment Variables
2. For `main` branch (Production):
   ```
   DATABASE_URL=postgresql://user:password@host:port/chore_champ
   CLOUDFLARE_ACCESS_URL=https://access.your-domain.com
   CLOUDFLARE_ACCESS_CLIENT_ID=your-client-id
   CLOUDFLARE_ACCESS_CLIENT_SECRET=your-client-secret
   GEMINI_API_KEY=your-api-key
   ```

3. For `dev` and `test` branches: Leave blank (uses local mode)

---

## Quick Reference

### Switch to Dev
```bash
git checkout dev
git push origin dev
# Visit: dev.YOUR_PROJECT.pages.dev
```

### Switch to Test
```bash
git checkout test
git push origin test
# Visit: test.YOUR_PROJECT.pages.dev
```

### Switch to Production
```bash
git checkout main
git push origin main
# Visit: YOUR_PROJECT.pages.dev
```

### Create Feature Branch
```bash
git checkout -b feature/xyz-123
git push origin feature/xyz-123
# Auto-preview URL created
```

---

## Troubleshooting

### Branches Not Showing in Cloudflare

1. Verify branches exist in GitHub:
   ```bash
   git branch -a
   git push origin --force --set-upstream origin dev
   git push origin --force --set-upstream origin test
   ```

2. Wait 2-3 minutes for Cloudflare to detect branches

3. Refresh Cloudflare Pages dashboard

### URLs Not Working

1. Check branch name matches exactly (`dev`, `test`, `main`)
2. Verify subdomain names in Cloudflare settings
3. Clear browser cache
4. Try in incognito mode

---

## Next Steps

1. ✅ **Create branches**: Run commands above
2. ✅ **Configure Cloudflare**: Follow checklist
3. ✅ **Test dev environment**: Visit URL
4. ✅ **Set up environment variables**: For production
5. ✅ **Start developing**: Use dev/test branches

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: ✅ Ready for Configuration
