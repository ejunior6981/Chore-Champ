# AI Rules

## Tech Stack
- **React** with TypeScript for the UI framework
- **React Router** for client-side routing, managed in `src/App.tsx`
- **Tailwind CSS** for all styling needs
- **shadcn/ui** for pre-built UI components (all components and dependencies already installed)
- **Radix UI** for accessible primitive components and composables
- **Lucide React** for iconography
- **Vite** as the build tool and dev server
- **Supabase** or **Neon** as database providers (via Nitro server layer when needed)
- **vite-plugin-pwa** for PWA support and service worker management

## Library Usage Rules

### UI Components
- **Always prefer shadcn/ui** components over building custom components from scratch
- Import shadcn/ui components directly; do not edit existing ones — create new components when customization is needed
- Use Radix UI primitives when building custom composite components
- Keep components simple and focused — avoid premature abstractions or over-engineering

### Styling
- **Use Tailwind CSS exclusively** for all styling
- Leverage Tailwind for layout, spacing, colors, typography, and responsive design
- Avoid custom CSS files or CSS-in-JS solutions unless specifically needed

### Routing
- **Manage all routes in `src/App.tsx`**
- Do not use separate routing configuration files
- Keep route definitions clear and organized

### Icons
- Use **Lucide React** for all icon needs
- Import icons as needed: `import { IconName } from 'lucide-react'`

### Server-Side Code
- Enable Nitro server layer only when needed (API routes, database clients, secrets, webhooks)
- For database operations, use the chosen provider (Supabase/Neon) — Nitro may already be in place with Neon
- Keep server-side code minimal and focused on its specific purpose

### Component Architecture
- Create small, focused components
- Avoid premature optimization or abstraction
- Three similar lines of code is better than a helper function for one-time operations
- Components should be self-contained and reusable when possible

### Error Handling
- Handle errors gracefully at system boundaries (user input, external APIs)
- Trust framework guarantees — don't add unnecessary validation or fallbacks
- Don't create defensive code for scenarios that can't happen

### Code Quality
- Keep code simple and readable
- Add comments only where logic isn't self-evident
- Avoid TODO comments and placeholder implementations
- Delete unused code completely — don't leave _vars or partial implementations

### PWA and Push Notifications
- The app supports PWA with `vite-plugin-pwa` for automatic service worker generation and management
- SVG icons are used for PWA (icon-192.svg, icon-512.svg) with the Chore Champ logo
- Push notifications are sent via the service worker using `navigator.serviceWorker.showNotification()`
- Notification permissions are requested on first load and can be toggled via the header button
- Use `@web-push/web-push` for service worker push message handling in production
- PWA install prompts appear automatically when the service worker is registered
- Notification permission state is passed to the Header component for conditional UI
- Browser push notifications appear alongside in-app notifications for a seamless experience
- The service worker handles caching, offline support, and push notification delivery
