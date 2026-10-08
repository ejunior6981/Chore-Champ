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
- **PWA** with service worker for offline support and installability
- **Push Manager API** for browser push notifications (no external library needed)

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

### PWA & Push Notifications
- Use **native Push Manager API** for push notifications (no external library needed)
- Service worker should be registered in the app component or via client-side code
- Push notification data should be sent to the service worker via the push event
- Handle notification clicks to open the app or specific pages
- Service worker handles push events, not the main app thread

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

<!-- nitro:start -->

## Nitro Server Layer

This project has a Nitro server layer for backend API routes. A `nitro.config.ts` at the app root sets `serverDir: "./server"` — do not move or remove it.

### vite.config.ts

`vite.config.ts` already imports `nitro` from `"nitro/vite"` and registers `nitro()` as the LAST entry in the `plugins` array. Do not move it earlier — it must run after Vite's module-transform middleware, otherwise Nitro's SPA fallback intercepts Vite internal URLs (`/src/*.tsx`, `/@vite/client`, `/@react-refresh`, `/@fs/*`) and returns `index.html`, breaking the preview.

### API Route Conventions

- Write routes in `server/routes/api/` (NEVER top-level `/api/`).
- Dynamic routes: `[param].ts`. Method-specific: `hello.get.ts`, `hello.post.ts`.
- Runtime config: `useRuntimeConfig()` (env vars prefixed with `NITRO_`).

### Imports — read carefully

Imports come from two different sources:

- `defineHandler` and `useRuntimeConfig` are imported from **`"nitro"`**.
- **Every request/response helper comes from `"nitro/h3"`** — Nitro v3 re-exports h3 utilities through that subpath. Common ones: `readBody`, `readValidatedBody`, `getQuery`, `getRouterParam`, `getRouterParams`, `createError`, `sendError`, `setResponseStatus`, `getRequestHeaders`, `getRequestURL`, `setCookie`, `getCookie`, `deleteCookie`.

Worked example — `server/routes/api/todos.post.ts`:

```ts
import { defineHandler } from "nitro";
import { readBody, createError } from "nitro/h3";

export default defineHandler(async (event) => {
  const body = await readBody<{ title?: string }>(event);
  if (!body?.title) {
    throw createError({ statusCode: 400, statusMessage: "title is required" });
  }
  return { ok: true, title: body.title };
});
```

### Server-side packages

Any package used inside `server/` (database drivers like `@neondatabase/serverless`, auth SDKs, third-party API clients) must be in `package.json`. Add it before writing the first server file that imports it. NEVER import these from `src/` — code under `src/` ships to the browser, so importing server packages there leaks them and usually breaks the build.

### Common mistakes

- `import { readBody } from "nitro"` → wrong. h3 utilities are not exported from `"nitro"`. Use `"nitro/h3"`.
- `import { readBody } from "h3"` → wrong. Even though Nitro is built on h3, you import through `"nitro/h3"` (the version Nitro re-exports), not `"h3"` directly.
- `nitro()` placed before `react()` in `plugins` → wrong. Must be the LAST entry, otherwise the SPA fallback intercepts Vite internals.
- Omitting `nitro()` from `vite.config.ts` entirely → `/api/*` returns `index.html` instead of JSON.
- Importing server-only packages or referencing server-only env vars (`process.env.DATABASE_URL`, secrets) from `src/` → wrong. The Vite client bundle is public; this leaks them. Server code lives in `server/` only.

<!-- nitro:end -->
