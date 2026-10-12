# 🚀 Chore Champ - Local Development Setup

> **Status**: ✅ Ready for Local Testing

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Mode](https://img.shields.io/badge/mode-local-green.svg)
![Database](https://img.shields.io/badge/database-indexeddb-blue.svg)

---

## 🎯 Quick Start

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Open in Browser
Visit: **http://localhost:3000**

---

## ✨ What You'll See

### Sample Data Included

The app automatically loads sample data:

**👨‍👩‍👧‍👦 Family Members:**
- **Mom** (Parent) - 500 points
- **Dad** (Parent) - 450 points
- **Alex** (Child) - 200 points
- **Sam** (Child) - 150 points

**📋 Sample Chores:**
- Feed the pets (10 points, daily)
- Take out trash (15 points, weekly)
- Make bed (5 points, daily)
- Clean room (20 points, weekly)

**🎁 Sample Rewards:**
- Extra Screen Time (100 points)
- Choose Dinner (50 points)
- Sleepover (200 points)
- Toy Store Visit (150 points)

---

## 🎮 Features Available

### Core Features
- ✅ Create, edit, delete chores
- ✅ Add custom rewards
- ✅ Request points (as child)
- ✅ Approve requests (as parent)
- ✅ Add manual points
- ✅ Switch family members

### UI/UX Features
- ✅ Light/Dark/System themes
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Full-screen mode
- ✅ Notifications panel
- ✅ Settings menu

### Advanced Features
- ✅ Offline support
- ✅ Push notifications (desktop)
- ✅ Data persistence
- ✅ Avatar selection

---

## 📚 Testing Checklist

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
- [ ] Responsive design (mobile view)
- [ ] Full-screen mode
- [ ] Notifications panel
- [ ] Settings menu
- [ ] Modal interactions

### Data Management
- [ ] Refresh page - data persists
- [ ] Close and reopen app
- [ ] Test offline mode

---

## 🔧 Available Commands

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

---

## 💾 Database Information

### Local Development (Default)
- **Storage**: IndexedDB (browser-based)
- **Setup**: Automatic (no configuration needed!)
- **Database Name**: ChoreChampLocalDB
- **Persistence**: Stored in browser storage

**No database setup required!** The app works out of the box.

---

## 🎨 Customization

### Add Your Own Data

1. **Add Family Members**: Click settings → Add user
2. **Add Chores**: Click + button → Add Chore
3. **Add Rewards**: Click + button → Add Reward
4. **Custom Avatars**: Select from 8 avatar options

### Theme Customization

Click the settings icon to switch between:
- **Light** - Bright and cheerful
- **Dark** - Night mode
- **System** - Follows OS preference

---

## 🐛 Troubleshooting

### App not loading?
```bash
# Clear cache and restart
rm -rf node_modules
npm install
npm run dev
```

### Data not persisting?
- Check browser storage quota
- Try a different browser
- Check browser console for errors

### Service worker not registering?
- Open DevTools → Application → Service Workers
- Click "Update" or "Skip Waiting"
- Refresh the page

---

## 📖 Documentation

- [Local Deployment Guide](docs/LOCAL-DEPLOYMENT.md) - Detailed setup
- [Main README](README.md) - Project overview
- [API Documentation](docs/api/openapi.yaml) - API specs
- [Database Schema](docs/database/schema.md) - Database design

---

## 🚀 Ready to Deploy?

When you've tested everything:

1. ✅ Complete all testing checklist items
2. 📝 Update `.env` for production
3. 🏗️ Build for production: `npm run build`
4. ☁️ Deploy to Cloudflare Pages

See [Deployment Guide](docs/deployment/deploy.md) for details.

---

## 🎉 You're All Set!

The app is ready for local testing. Open **http://localhost:3000** in your browser and start exploring!

---

**Version**: 1.0.0  
**Mode**: Local Development  
**Database**: IndexedDB (automatic)  
**Status**: ✅ Ready for Testing
