# Chore Champ Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Cloudflare Pages                         │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                   React/Vite Frontend                    │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │ │
│  │  │   Client    │  │   IndexedDB │  │   Theme Context │  │ │
│  │  │   Components│  │   Cache     │  │   Provider      │  │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                       │                                      │
│  ┌────────────────────┴────────────────────────────────────┐ │
│  │                   Nitro Server Layer                    │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │ │
│  │  │   API       │  │   Auth      │  │   Middleware    │  │ │
│  │  │   Routes    │  │   Manager   │  │   Security      │  │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                       │                                      │
│  ┌────────────────────┴────────────────────────────────────┐ │
│  │                   Cloudflare Access                     │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │ │
│  │  │   Auth      │  │   JWT       │  │   Rate Limiting │  │ │
│  │  │   Policies  │  │   Tokens    │  │   Protection     │  │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                       │                                      │
│  ┌────────────────────┴────────────────────────────────────┐ │
│  │                   D1 Database (SQLite)                  │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │ │
│  │  │   Users     │  │   Chores    │  │   Rewards       │  │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │ │
│  │  │   Requests  │  │   Notifs    │  │   Avatars       │  │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### User Registration Flow

1. User visits app
2. Clicks "Sign Up"
3. Enters email, password, name
4. Submits registration form
5. Cloudflare Access validates email format
6. Password hashed and stored in D1
7. Family record created (if first user)
8. JWT token issued with custom claims
9. User redirected to dashboard

### Chore Completion Flow

1. Child marks chore as complete
2. App updates IndexedDB cache
3. Sync manager queues operation
4. When online, syncs to server
5. Server updates D1 database
6. Server sends push notification
7. Service worker displays notification
8. Child earns points

### Point Request Approval Flow

1. Child submits point request
2. Request stored in D1
3. Parent receives notification
4. Parent approves/denies request
5. Server updates request status
6. Points added/deducted from child
7. Notification sent to child

## Security Architecture

### Authentication

- **Cloudflare Access**: Handles authentication and authorization
- **JWT Tokens**: Short-lived (24h) access tokens
- **Custom Claims**: Include family_id, role, permissions
- **Rate Limiting**: Prevents brute force attacks

### Authorization

- **Row-Level Security**: D1 tables partitioned by family_id
- **JWT Validation**: Server validates token on each request
- **Role-Based Access**: Parents have admin privileges

### Data Security

- **Password Hashing**: Handled by Cloudflare Access
- **PIN Encryption**: Parent PIN encrypted in database
- **Token Expiration**: Short-lived JWT tokens
- **HTTPS**: All communication encrypted

## PWA Architecture

### Service Worker

```
Install Event:
- Cache static assets (cache-first)
- Register with Cloudflare

Fetch Event:
- Static assets: Cache-first strategy
- API requests: Network-first with cache fallback
- HTML/JSON: Network-first with cache fallback

Push Event:
- Receive push notification
- Display native notification
- Handle click action

Message Event:
- Handle sync commands
- Process offline queue
```

### Offline Strategy

```
Online:
- Fetch from server
- Cache response
- Update IndexedDB

Offline:
- Serve from cache
- Queue operations
- Sync when online
```

## Notification Architecture

### Push Notification Flow

```
1. Server creates notification record in D1
2. Server sends push via Push Manager API
3. Service worker receives push event
4. Notification displayed in platform
5. User taps notification
6. App opens to relevant screen
```

### Platform-Specific

```
Mobile/Tablet (Installed):
- Native device notifications
- Persistent in notification center
- Works when app is closed

Web Browser:
- Browser notifications
- Shows in browser notification area
- Requires user permission
```

## Admin Portal Architecture

### Admin Access

- **Authentication**: Same as main app
- **Authorization**: Parent role required
- **Routes**: Protected `/admin/*` routes
- **UI**: Separate admin dashboard

### Future Features (Monetization Ready)

- **Payment Processing**: Stripe integration hooks
- **Subscription Management**: Recurring billing hooks
- **Analytics Dashboard**: Usage statistics
- **Family Plans**: Multi-family management
- **Premium Features**: Advanced tracking

## Scalability Considerations

### Database

- **Single D1 Database**: Scales automatically
- **Partitioning**: family_id enables efficient queries
- **Indexing**: Strategic indexes on frequently queried fields
- **RLS**: Row-level security ensures data isolation

### Caching

- **Static Assets**: Cache-first strategy
- **User Data**: Network-first for fresh data
- **API Responses**: Cache with appropriate TTL
- **IndexedDB**: Client-side offline cache

## Performance Considerations

### Load Times

- Static assets cached aggressively
- API responses cached with short TTL
- IndexedDB reduces server load
- Background sync minimizes data transfer

### Mobile Optimization

- Touch-friendly 48px+ targets
- Responsive layouts
- Optimized images
- Minimal bundle size

## Monitoring and Observability

### Metrics to Track

- **API Response Times**: P95, P99 latencies
- **Database Queries**: Slow query logs
- **Error Rates**: Client and server errors
- **User Engagement**: Daily active users
- **Performance**: Core Web Vitals

### Logging

- **Client Logs**: Browser console
- **Server Logs**: Nitro server logs
- **Database Logs**: D1 query logs
- **Network Logs**: Request/response logs

## Deployment Architecture

### Cloudflare Pages

- **Build System**: Vite with TypeScript
- **Output**: dist/ directory
- **Build Command**: npm run build
- **Deploy**: Git-based continuous deployment

### Database

- **Provider**: Cloudflare D1 (SQLite)
- **Connection**: Managed connection string
- **Backups**: Point-in-time recovery
- **Region**: User-proximity deployment

### Authentication

- **Provider**: Cloudflare Access
- **Token**: JWT with custom claims
- **Expiration**: 24 hours
- **Refresh**: Automatic refresh tokens

## Tech Stack

### Frontend

- **Framework**: React 18+
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **Build**: Vite

### Backend

- **Runtime**: Nitro (Cloudflare Workers)
- **Database**: D1 (SQLite)
- **Auth**: Cloudflare Access
- **Hosting**: Cloudflare Pages

### DevOps

- **CI/CD**: Cloudflare Pages
- **Version Control**: Git
- **Environment**: Cloudflare KV
- **Monitoring**: Cloudflare Analytics

## Future Enhancements

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
