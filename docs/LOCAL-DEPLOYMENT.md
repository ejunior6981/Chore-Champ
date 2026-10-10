# Local Development Setup Guide

## Quick Start

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Set Up Environment

The app comes with a `.env` file already configured for local development using IndexedDB (no database setup needed).

If you want to use SQLite instead:
```bash
# Copy the example file
cp .env.example .env

# Edit .env and set your DATABASE_URL
```

### Step 3: Start Development Server

```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

## What You'll See

### Sample Data Included

The app automatically loads sample data when you first start it:

**Family Members:**
- Mom (Parent) - 500 points
- Dad (Parent) - 450 points
- Alex (Child) - 200 points
- Sam (Child) - 150 points

**Sample Chores:**
- Feed the pets (10 points, daily)
- Take out trash (15 points, weekly)
- Make bed (5 points, daily)
- Clean room (20 points, weekly)

**Sample Rewards:**
- Extra Screen Time (100 points)
- Choose Dinner (50 points)
- Sleepover (200 points)
- Toy Store Visit (150 points)

## Testing Checklist

### Core Features
- [ ] Create new chores
- [ ] Edit existing chores
- [ ] Add new rewards
- [ ] Request points (as child)
- [ ] Approve requests (as parent)
- [ ] Add manual points
- [ ] Switch between family members

### UI/UX
- [ ] Light/Dark/System theme switching
- [ ] Responsive design (try mobile view)
- [ ] Full-screen mode
- [ ] Notifications panel
- [ ] Settings menu

### Data Management
- [ ] Refresh page - data persists
- [ ] Close and reopen app
- [ ] Test offline mode (disconnect internet)

## Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run typecheck
```

## Database Information

### Local Development (Default)
- **Storage**: IndexedDB (browser-based)
- **Setup**: Automatic (no configuration needed)
- **Database Name**: ChoreChampLocalDB
- **Persistence**: Stored in browser storage

### SQLite Option (Optional)
If you want to use SQLite for local development:

1. Install the package:
```bash
npm install better-sqlite3
```

2. Update `.env`:
```env
DATABASE_URL=sqlite:./local-chore-champ.db
```

3. The database will be created automatically on first run.

## Configuration

### vite.config.ts
The Vite configuration is set up for:
- Local development on `localhost:3000`
- Production builds with source maps
- Component tagging for Dyad

### tailwind.config.js
Theme configuration with:
- Light mode: `#f8fafc` background
- Dark mode: `#0f172a` background
- Primary color: Indigo (`#6366f1`)

### tsconfig.json
TypeScript configuration with:
- ES module support
- Strict mode enabled
- JSX support

## Service Worker

The app includes a service worker for:
- Offline support
- Push notifications
- Caching strategies

**Note**: Service workers only work in HTTPS or localhost. They won't work on http://localhost in some browsers.

## Notifications

### Desktop
1. Click the bell icon in the header
2. Allow notifications when prompted
3. Test with a sample notification

### Mobile (via Desktop)
- Open DevTools → Application → Service Workers
- Register the service worker
- Request notification permissions

## Troubleshooting

### "Cannot read properties of undefined"
- Clear browser cache
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Service worker not registering
- Open DevTools → Application → Service Workers
- Click "Update" or "Skip Waiting"
- Refresh the page

### Theme not switching
- Check browser console for errors
- Try clearing localStorage
- Restart the dev server

### Data not persisting
- Check browser storage quota (usually 5-10MB)
- Try a different browser
- Check browser console for errors

## Before Deploying to Cloudflare

### 1. Complete Testing
- [ ] All core features work
- [ ] Responsive design tested
- [ ] Offline mode works
- [ ] Notifications work

### 2. Clean Up
```bash
# Remove sample data if needed
# Edit App.tsx to remove sample data initialization
```

### 3. Update Environment
Update `.env` with production credentials:
```env
DATABASE_URL=postgresql://user:password@host:port/database
CLOUDFLARE_ACCESS_URL=https://access.your-domain.com
CLOUDFLARE_ACCESS_CLIENT_ID=your-client-id
CLOUDFLARE_ACCESS_CLIENT_SECRET=your-client-secret
```

### 4. Build for Production
```bash
npm run build
```

Check `dist/` folder for build artifacts.

### 5. Deploy
- Push to GitHub
- Create Cloudflare Pages project
- Configure build settings
- Deploy

## Next Steps

1. ✅ Test locally
2. ✅ Verify all features
3. ⏭️ Update for production
4. ⏭️ Build and deploy
5. ⏭️ Set up Cloudflare Access
6. ⏭️ Create D1 database

## Resources

- [Project README](../README.md)
- [API Documentation](../docs/api/openapi.yaml)
- [Database Schema](../docs/database/schema.md)
- [Deployment Guide](../docs/deployment/deploy.md)

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Ready for Local Testing ✅
