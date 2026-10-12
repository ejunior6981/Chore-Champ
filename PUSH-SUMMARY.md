# 🚀 Push Current Code to Test

## Quick Start

**Run this command to push your current code to test:**

```bash
./push-to-test.sh
```

This will push to both **dev** and **test** branches automatically.

---

## What You Have

✅ Full Chore Champ app implemented
✅ Local IndexedDB database configured  
✅ Sample data loaded (4 users, 4 chores, 4 rewards)
✅ All features enabled and working
✅ Development server running

---

## Your Cloudflare URLs

After pushing, your app will be available at:

| Branch | URL | Purpose |
|--------|-----|---------|
| `main` | `YOUR_PROJECT.pages.dev` | Production |
| `dev` | `dev.YOUR_PROJECT.pages.dev` | Development |
| `test` | `test.YOUR_PROJECT.pages.dev` | Testing |

---

## Next Steps

1. **Run push script**: `./push-to-test.sh`
2. **Configure Cloudflare**: Settings → Branches (web UI)
3. **Test dev environment**: `dev.YOUR_PROJECT.pages.dev`
4. **Test test environment**: `test.YOUR_PROJECT.pages.dev`

---

## Available Commands

```bash
# Push to dev and test (recommended)
./push-to-test.sh

# Push to dev only
./push-to-dev.sh

# Manual git commands
git add .
git commit -m "Your message"
git checkout -b dev && git push -u origin dev
git checkout -b test && git push -u origin test

# Push to production
git checkout main && git push origin main
```

---

**Ready?** Run: `./push-to-test.sh`
