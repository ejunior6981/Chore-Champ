# 🚀 Push Current Code to Test Branch

## Quick Command

Run this script to push your current code to the test branch:

```bash
./scripts/push-to-both.sh
```

This will push to both **dev** and **test** branches automatically.

---

## Alternative: Individual Branch Pushes

### Push to Dev Only
```bash
./scripts/push-to-dev.sh
```

### Push to Test Only
```bash
./scripts/push-to-test.sh
```

### Push to Production (Main)
```bash
git checkout main
git push origin main
```

---

## What Happens

When you run `./scripts/push-to-both.sh`:

1. ✅ Stages all your changes
2. ✅ Commits with current message
3. ✅ Creates `dev` branch (if doesn't exist)
4. ✅ Pushes to `dev` branch
5. ✅ Creates `test` branch (if doesn't exist)
6. ✅ Pushes to `test` branch

---

## After Pushing

### Your Cloudflare URLs

| Branch | URL | Purpose |
|--------|-----|---------|
| `main` | `YOUR_PROJECT.pages.dev` | Production |
| `dev` | `dev.YOUR_PROJECT.pages.dev` | Development |
| `test` | `test.YOUR_PROJECT.pages.dev` | Testing |

### Next Steps

1. **Configure Cloudflare Pages** (web UI):
   - Go to: https://dash.cloudflare.com/profile/accounts/*/pages/projects/YOUR_PROJECT
   - Settings → Branches
   - Add `dev` and `test` branch configurations

2. **Test your dev environment**:
   - Visit: `dev.YOUR_PROJECT.pages.dev`

3. **Test your test environment**:
   - Visit: `test.YOUR_PROJECT.pages.dev`

---

## Local Development

Before pushing, test locally:

```bash
# Start local development server
npm run dev

# Visit: http://localhost:5173
```

---

## Current Status

✅ App is ready with full features
✅ Local database configured
✅ Sample data loaded
✅ All features enabled
✅ Ready to push to test

---

## Quick Reference

| Action | Command |
|--------|---------|
| Push to dev & test | `./scripts/push-to-both.sh` |
| Push to dev only | `./scripts/push-to-dev.sh` |
| Push to test only | `./scripts/push-to-test.sh` |
| Push to production | `git checkout main && git push origin main` |
| Start local dev | `npm run dev` |
| View local app | `http://localhost:5173` |

---

**Ready to push?** Run: `./scripts/push-to-both.sh`
