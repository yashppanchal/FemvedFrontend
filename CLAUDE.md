# FemVed Frontend - Claude Context

## Project Overview
FemVed is a women's health and wellness platform. This is the React frontend, deployed on Netlify.

## Tech Stack
- **React 19** with TypeScript (~5.9)
- **Vite 7** (build tool, dev server)
- **React Router 7** (client-side routing via `createBrowserRouter`)
- **SCSS** (per-component `.scss` files, no CSS modules)
- **react-icons** for icons
- **Package manager: npm** (use `npm`, not bun or yarn)

## Commands
```bash
npm run dev       # Start dev server
npm run build     # TypeScript check + Vite build
npm run lint      # ESLint
npm run preview   # Preview production build
```

## Project Structure
```
src/
  api/           # API layer (client.ts, auth.ts, experts.ts, guided.ts)
  auth/          # Auth context and hook (useAuth.tsx)
  country/       # Country detection context (useCountry.tsx)
  components/    # Shared/reusable UI components (each has .tsx + .scss)
    guided-care-components/  # Components specific to guided care pages
  pages/         # Page-level components
    admin/       # Admin sub-tabs (AdminTabs, CategoriesTab, DomainsTab, etc.)
  routing/       # Route guards (AdminRoute.tsx, ExpertRoute.tsx)
  nav/           # Navigation config (menu.ts)
  styles/        # Global SCSS (_variables.scss, global.scss)
  data/          # Static data (guidedPrograms.ts)
  netlify/functions/  # Netlify serverless functions (country.js)
```

## API
- **Base URL:** `https://api.femved.com/api/v1`
- **Client:** `src/api/client.ts` — use `apiFetch<T>(path, options)` for all API calls
- **Auth:** Bearer token auto-attached from `localStorage` key `femved_tokens`
- **Error handling:** `apiFetch` throws `ApiError` (with `.status` and `.body`) on non-2xx responses
- To skip auth on a request: pass `{ skipAuth: true }` in options

## Authentication
- Context: `useAuth()` from `src/auth/useAuth.tsx`, provided by `<AuthProvider>`
- Roles: `ROLE_ADMIN` (id:1), `ROLE_EXPERT` (id:2), `ROLE_USER` (id:3)
- localStorage keys: `femved_tokens`, `femved_session`, `femved_users`, `femved_auth_user`
- Token expiry checked via `hasValidAccessToken(tokens)`
- Protected routes: wrap with `<AdminRoute>` or `<ExpertRoute>` in `src/routing/router.tsx`

## Country / Localisation
- Context: `useCountry()` from `src/country/useCountry.tsx`, provided by `<CountryProvider>`
- Supported: `IN` (India, +91, INR), `UK` (United Kingdom, +44, GBP), `US` (United States, +1, USD)
- Auto-detected via Netlify function `/.netlify/functions/country` on first visit
- Persisted in `localStorage` key `femved.country`

## Styling Conventions
- Each component has a co-located `.scss` file
- Import global variables via `@use "../styles/variables" as *;` (or adjust path)
- **Design tokens (SCSS variables):**
  - `$primary: #56131b` (deep red)
  - `$primary-hover: #71142a`
  - `$secondary: #a77f60` (warm tan)
  - `$secondary-soft: #e3c8ae`
  - `$white`, `$black: #0f0f10`
  - `$border: rgba($black, 0.12)`
  - `$muted: rgba($black, 0.7)`
- **Fonts:** Inter (body), Baskerville/serif (titles)
- **Layout:** `.container` class caps content at `$container-max-width: 1100px` with `$container-padding-x: 20px`
- Home page (`/`) renders full-width (no `.container` wrapper on `<main>`)

## Routing
- Router defined in `src/routing/router.tsx`
- Nav sections/paths defined in `src/nav/menu.ts` (`NAV_SECTIONS`, `INTERNAL_NAV_ROUTES`)
- Unimplemented routes render `<Placeholder title="..." />` temporarily
- 404 handled by `<NotFound />`

## Layout (App.tsx)
- Sticky header with blur — adds `layout__header--scrolled` class when user scrolls
- Page transition fade/slide animation on route change (`PageTransition` component, 180ms)
- Provider order: `<CountryProvider>` wraps `<AuthProvider>`

## Deployment
- Platform: **Netlify**
- Redirects: `public/_redirects` (SPA fallback)
- Netlify config: `netlify.toml` — functions directory is `src/netlify/functions`

## Backend API
- Full API reference: see `API_REFERENCE.md` in repo root
- Base URL (prod): https://api.femved.com/api/v1
- Base URL (dev): https://api.femved.com/api/v1
- Auth: JWT Bearer tokens (access + refresh rotation)
- Swagger UI: https://api.femved.com/
