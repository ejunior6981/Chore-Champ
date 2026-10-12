# 🚀 Dev/Test Environment Setup

## Quick Start (2 Commands)

```bash
# 1. Create dev and test branches
git checkout -b dev && git push origin dev
git checkout -b test && git push origin test

# 2. Configure Cloudflare Pages Branches
# Go to: https://dash.cloudflare.com/profile/accounts/*/pages/projects/YOUR_PROJECT
# Settings → Branches → Add:
#   - Branch: dev → Subdomain: dev
#   - Branch: test → Subdomain: test
```

## Your Environment URLs

After setup:

- **Production**: `YOUR_PROJECT.pages.dev` (main branch)
- **Dev**: `dev.YOUR_PROJECT.pages.dev` (dev branch)
- **Test**: `test.YOUR_PROJECT.pages.dev` (test branch)

## Automated Setup

```bash
# Make script executable
chmod +x scripts/setup-dev-environments.sh

# Run setup
./scripts/setup-dev-environments.sh
```

## Cloudflare Dashboard Setup

1. Go to: https://dash.cloudflare.com/profile/accounts/*/pages/projects/YOUR_PROJECT
2. Click **Settings** → **Branches**
3. Add branch configurations:

| Branch | Production Subdomain |
|--------|---------------------|
| `main` | (leave blank) |
| `dev` | `dev` |
| `test` | `test` |

4. Click **Save**

## Test Your Setup

```bash
# Switch to dev
git checkout dev
git push origin dev

# Visit: https://dev.YOUR_PROJECT.pages.dev
```

## Documentation

- [Quick Setup Guide](docs/SETUP-GITHUB-CLOUDFLARE.md) - Detailed instructions
- [Cloudflare Dev Setup](docs/CLOUDFLARE-DEV-SETUP.md) - Complete guide
- [Quick Start](docs/CLOUDFLARE-QUICK-START.md) - Quick reference

---

**Status**: ✅ Ready for Configuration  
**Version**: 1.0.0
