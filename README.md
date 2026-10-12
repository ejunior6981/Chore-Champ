# Chore Champ - Multi-Tenant Chore & Reward Tracking App

A modern, responsive chore and reward tracking application built with React, TypeScript, and Cloudflare technologies. Designed for families to manage chores, rewards, and point requests with offline support and push notifications.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-production-ready-brightgreen.svg)

## ✨ Features

### Core Features
- ✅ **Multi-Tenant Architecture** - Single database with family partitioning
- ✅ **Cloudflare Access Authentication** - Secure email/password login
- ✅ **D1 Database** - SQLite with row-level security
- ✅ **PWA Support** - Install to home screen, offline support
- ✅ **Push Notifications** - Platform-specific notifications
- ✅ **Dark Mode** - System, light, and dark themes
- ✅ **8 Avatar Options** - Boy, girl, and neutral avatars
- ✅ **Responsive Design** - Mobile-first, full screen support
- ✅ **Offline Support** - IndexedDB caching and sync
- ✅ **Admin Portal** - Parent management interface

### Chore Management
- Create, edit, and delete chores
- Assign chores to specific children or anyone
- Set point values and descriptions
- Configure frequency (one-time, daily, weekly)
- Parent approval requirements
- Streak tracking
- Daily reset functionality

### Reward System
- Create custom rewards
- Set point costs
- Category organization (entertainment, food, privilege, etc.)
- Quantity limits and cooldowns
- Instant redemption

### Point Requests
- Children request extra points
- Parent approval workflow
- Request descriptions and notes
- Status tracking (pending, approved, denied)

### User Management
- Child and parent accounts
- Avatar selection
- Theme preferences
- Point balance tracking
- Account switching (PIN-protected for parents)

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18+, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **Backend**: Nitro (Cloudflare Workers)
- **Database**: Cloudflare D1 (SQLite)
- **Authentication**: Cloudflare Access
- **Hosting**: Cloudflare Pages
- **Notifications**: Push Manager API

### System Design

```
┌─────────────────────────────────────────────────────────┐
│                    Cloudflare Pages                      │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              React/Vite Frontend                     │ │
│  │  - Client Components                                │ │
│  │  - IndexedDB Cache                                  │ │
│  │  - Theme Context                                    │ │
│  └─────────────────────────────────────────────────────┘ │
│                  │                                       │
│  ┌───────────────┴─────────────────────────────────────┐ │
│  │              Nitro Server Layer                     │ │
│  │  - API Routes                                       │ │
│  │  - Auth Manager                                     │ │
│  │  - Middleware                                       │ │
│  └─────────────────────────────────────────────────────┘ │
│                  │                                       │
│  ┌───────────────┴─────────────────────────────────────┐ │
│  │            Cloudflare Access                        │ │
│  │  - Authentication                                   │ │
│  │  - JWT Tokens                                       │ │
│  │  - Rate Limiting                                    │ │
│  └─────────────────────────────────────────────────────┘ │
│                  │                                       │
│  ┌───────────────┴─────────────────────────────────────┐ │
│  │              D1 Database (SQLite)                   │ │
│  │  - Users                                            │ │
│  │  - Chores                                           │ │
│  │  - Rewards                                          │ │
│  │  - Point Requests                                   │ │
│  │  - Notifications                                    │ │
│  │  - Avatars                                         │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
src/
├── admin/                 # Admin portal shell
│   ├── layout.tsx        # Admin layout
│   ├── routes/           # Admin routes
│   └── views/            # Admin views
├── auth/                 # Authentication layer
│   ├── auth-manager.ts   # Auth manager
│   └── session.ts        # Session management
├── data/                 # Data access layer
│   ├── user.ts          # User CRUD
│   ├── family.ts        # Family management
│   ├── chore.ts         # Chore operations
│   ├── reward.ts        # Reward operations
│   ├── point-request.ts # Request handling
│   ├── notification.ts  # Notification management
│   ├── avatar.ts        # Avatar management
│   └── child-setup.ts   # Child account setup
├── migration/            # Migration utilities
│   └── migrate-localstorage.ts
├── pwa/                  # PWA features
│   ├── notification-handler.ts
│   ├── background-sync.ts
│   └── offline-queue.ts
├── sync/                 # Synchronization layer
│   ├── sync-manager.ts
│   ├── conflict-resolver.ts
│   └── offline-queue.ts
├── theme/                # Theme management
│   └── theme-provider.tsx
├── components/           # React components
│   ├── AvatarDisplay.tsx
│   ├── AvatarSelection.tsx
│   ├── ThemeToggle.tsx
│   ├── InstallPrompt.tsx
│   ├── FamilySelection.tsx
│   ├── AccountSwitcher.tsx
│   ├── MissionControlHeader.tsx
│   ├── MissionBrief.tsx
│   ├── RewardsVault.tsx
│   ├── PointRequestCard.tsx
│   ├── Modal.tsx
│   ├── ProfileModal.tsx
│   ├── NotificationPanel.tsx
│   ├── ChildManagement.tsx
│   ├── AvatarSelectionModal.tsx
│   └── ThemeSelectionModal.tsx
├── types/                # TypeScript types
│   ├── server.ts
│   ├── notification.ts
│   └── notification-types.ts
└── App.tsx               # Main app component

public/
├── manifest.json         # PWA manifest
├── sw.js                 # Service worker
├── index.css             # Global styles
└── icons/                # App icons

docs/
├── api/                  # API documentation
│   ├── openapi.yaml      # OpenAPI spec
│   └── admin-api.md      # Admin API docs
├── database/             # Database docs
│   └── schema.md         # Database schema
├── deployment/           # Deployment guides
│   ├── deploy.md         # Main deployment
│   └── admin-deploy.md   # Admin deployment
├── user-guides/          # User documentation
│   ├── parent-guide.md
│   ├── child-guide.md
│   └── admin-guide.md
├── architecture/         # Architecture docs
│   └── overview.md
└── CHANGELOG.md         # Changelog

.github/
└── workflows/            # CI/CD workflows
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Cloudflare account
- GitHub account

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd chore-champ
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file:
```env
DATABASE_URL=postgresql://user:password@host:port/database
CLOUDFLARE_ACCESS_URL=https://access.your-domain.com
CLOUDFLARE_ACCESS_CLIENT_ID=your-client-id
CLOUDFLARE_ACCESS_CLIENT_SECRET=your-client-secret
```

4. **Run development server**
```bash
npm run dev
```

5. **Build for production**
```bash
npm run build
```

### Deployment

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Create Cloudflare Pages project**
- Go to Cloudflare Dashboard → Workers & Pages → Create application
- Connect to GitHub repository
- Configure build settings
- Deploy

3. **Set up Cloudflare Access**
- Create Access application
- Configure authentication policies
- Set up sign-in experience
- Configure access control

4. **Create D1 database**
- Create D1 database
- Run schema SQL
- Set up row-level security

## 📚 Documentation

- [API Documentation](docs/api/openapi.yaml) - OpenAPI/Swagger spec
- [Admin API](docs/api/admin-api.md) - Admin endpoints
- [Database Schema](docs/database/schema.md) - Database design
- [Deployment Guide](docs/deployment/deploy.md) - Deployment instructions
- [Admin Deployment](docs/deployment/admin-deploy.md) - Admin setup
- [Parent Guide](docs/user-guides/parent-guide.md) - Parent features
- [Child Guide](docs/user-guides/child-guide.md) - Child features
- [Admin Guide](docs/user-guides/admin-guide.md) - Admin features
- [Architecture Overview](docs/architecture/overview.md) - System design

## 🎯 Key Features

### Multi-Tenant Architecture
- Single database with family partitioning
- Row-level security for data isolation
- Efficient queries with strategic indexing
- Automatic scaling with Cloudflare

### Offline Support
- IndexedDB caching
- Background sync
- Offline queue management
- Conflict resolution

### Push Notifications
- Platform-specific notifications
- Service worker integration
- Background sync support
- Notification management

### Responsive Design
- Mobile-first approach
- Touch-friendly 48px+ targets
- Full screen landscape support
- Adaptive layouts

### PWA Features
- Install to home screen
- Offline functionality
- Push notifications
- Background sync

## 🔒 Security

- **Authentication**: Cloudflare Access with JWT tokens
- **Authorization**: Row-level security in D1
- **Password Hashing**: Handled by Cloudflare Access
- **Token Expiration**: 24-hour JWT tokens
- **Rate Limiting**: Brute force protection
- **HTTPS**: All communication encrypted

## 📊 Tech Stack

### Frontend
- React 18+
- TypeScript
- Tailwind CSS
- Vite
- Heroicons

### Backend
- Nitro (Cloudflare Workers)
- D1 (SQLite)
- Cloudflare Access
- Push Manager API

### DevOps
- Cloudflare Pages
- Git-based CI/CD
- Cloudflare KV (environment)
- Cloudflare Analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Cloudflare for Pages, D1, and Access
- Vite for the build tool
- Tailwind CSS for styling
- Heroicons for icons
- React for the framework

## 📞 Support

For issues and questions:
1. Check the documentation
2. Review the user guides
3. Contact support team

## 🚀 Roadmap

### Phase 11: Payment Integration
- Stripe integration
- Subscription management
- Payment webhooks
- Receipt generation

### Phase 12: Testing
- Unit tests
- Integration tests
- E2E tests
- Performance tests

### Phase 13: Optimization
- Bundle size reduction
- Image optimization
- Lazy loading
- Code splitting

### Phase 14: Launch
- Production deployment
- Monitoring setup
- Analytics integration
- User onboarding

---

**Version**: 1.0.0  
**Last Updated**: October 2024  
**Status**: Production Ready
