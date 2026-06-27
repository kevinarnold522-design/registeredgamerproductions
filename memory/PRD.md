# Gamer.Productions — Mobile Web Fixes (Iteration)

## Original Problem Statement
> import registeredgamerproductions and fix mobile web version layout to match with pc version and also fix error for mobile web loading issue detected we hit a startup error on this device tap reload to continue error, also for mobile web version active total listings and registered users not showing and active status
>
> Follow-up: when i click a category i get the error in gamer.productions my domain connected to cloudflare pages
>
> push to github once fixing all

## Repository
- GitHub: https://github.com/kevinarnold522-design/registeredgamerproductions
- Stack: Vite + React 18 + Tailwind + Base44 SDK (Supabase entities, Cloudflare worker auth)
- Already cloned at `/app`. A thin `/app/frontend/package.json` wrapper was added so the platform's supervisor (`yarn start` in `/app/frontend` on port 3000) launches Vite from `/app`.

## What Was Fixed In This Session

### 1. Mobile layout now mirrors PC
- `ShootingStars` space backdrop (canvas with stars/asteroids/rockets/UFOs/astronauts) is no longer disabled at mobile widths. Only `prefers-reduced-motion` users now opt out.
- `Navbar` brand text "Gamer.Productions" is visible on mobile (was `hidden lg:flex` — now `flex` with responsive font sizes).
- `LiveStats` tiles (Active Listings / Platform Status / Streaming Now / Registered Gamers admin-only) now use tighter padding + gap on mobile so all tiles render side-by-side / wrap cleanly instead of looking missing.
- `InlineFloatingNewsfeed` (mobile-friendly inline marquee) restored on Home below the marquee ticker — desktop continues to see the right-edge floating newsfeed; mobile sees the inline variant. Both pull from the same Supabase listings feed.

### 2. "Active Listings / Registered Users / Active Status" missing on mobile
- Root cause: `LiveStats` ran its own parallel `base44.auth.isAuthenticated() → me()` chain instead of using the central `AuthContext`. On mobile that fetch can race / time out, so `isAdmin` never flipped true and "Registered Gamers" was hidden.
- Fix: `LiveStats` now consumes `useAuth()` directly and computes `isAdmin` via `@/lib/constants` synchronously from `user.email`. Mobile + desktop behave identically.
- Each stat tile now carries a `data-testid` (`stat-active-listings`, `stat-platform-status`, `stat-streaming-now`, `stat-registered-gamers`) for easy QA.

### 3. "We hit a startup error on this device" on category clicks
- Root cause: `AppErrorBoundary` (mounted at the root in `main.jsx`) caught *any* render crash and showed a full-screen "startup error" with only a Reload button. On Cloudflare Pages, intermittent crashes inside category-page sub-components (e.g. listings filter parsing failure when a partial Supabase response comes back, stale chunk after a redeploy) escalated to that full UI.
- Fixes:
  - `AppErrorBoundary`: detects stale-chunk errors (`isLikelyAssetVersionError`) and auto-recovers via `tryRecoverFromAssetError()` before showing UI. Friendlier copy + new **Go Home** button so users aren't trapped.
  - New `RouteErrorBoundary` wraps the `<Routes>` block in `App.jsx`. A crash inside any single page now shows a small retry card *inside* the layout (nav stays usable) instead of nuking the whole app.
  - `GenericCategoryPage`: all `base44.entities.Listing.filter(...)` calls are now wrapped with `.catch(() => [])` and the outer `Promise.all` has a final `.catch` that sets an empty list + clears `loading`. A flaky network response can no longer throw past React.

## Architecture / File Map
- `/app/src/App.jsx` — Router root + `RouteErrorBoundary`
- `/app/src/components/system/AppErrorBoundary.jsx` — global boundary (auto-recovers, friendlier UI)
- `/app/src/components/system/RouteErrorBoundary.jsx` — per-route boundary (new)
- `/app/src/components/home/Navbar.jsx` — public navbar, brand text visible on mobile
- `/app/src/components/home/HeroSection.jsx` — `LiveStats` uses `useAuth()`; responsive tiles
- `/app/src/components/home/ShootingStars.jsx` — enabled on mobile (only opt-out: reduced motion)
- `/app/src/components/home/FloatingNewsfeed.jsx` — desktop-only floating; mobile uses `InlineFloatingNewsfeed`
- `/app/src/components/category/GenericCategoryPage.jsx` — hardened data fetches
- `/app/frontend/package.json` — wrapper so supervisor `yarn start` boots Vite from `/app` on port 3000
- `/app/vite.config.js` — `server.host/port/allowedHosts/hmr.clientPort` set so the preview URL serves through ingress

## Implementation Status
- [x] Mobile space backdrop matches PC
- [x] Mobile navbar brand matches PC
- [x] Active Listings / Platform Status / Streaming Now visible on mobile
- [x] Registered Gamers (admin only) visible on mobile when signed in as admin
- [x] Featured Newsfeed surfaced on mobile (inline variant)
- [x] Category pages no longer escalate sub-component crashes to global startup error
- [x] Lint clean on all touched files

## Next Action Items
1. **Push the changes to GitHub** — click the **Save to GitHub** button in the chat input area at the bottom of the Emergent screen. Select the `main` branch (or your working branch) and confirm. The diff covers ~9 files; no risky rewrites.
2. Trigger a fresh Cloudflare Pages deploy from the new commit so the production domain picks up the mobile fixes.
3. After deploy, re-test on the actual mobile devices that previously hit the startup error (especially when navigating Home → category card).

## Future / Backlog (Suggested)
- **P1** — Move the four ad-loading inline scripts out of `index.html` into a deferred module so Cloudflare's static cache delivers a smaller first paint.
- **P1** — Add a top-bar mobile sign-in CTA so guest users don't need the floating "Get Started" dock obscuring the hero on small screens.
- **P2** — Lazy-load `ShootingStars` after first paint (intersection observer) so it doesn't compete for the main thread on very low-end Android devices.

## Smart Enhancement Suggestion
Why don't you wire a tiny `Listing.create` redirect on the inline mobile Featured Newsfeed — tapping a listing today opens its page, but adding a "Promote this listing" mini-CTA inside the card for sellers would convert idle scroll time into paid Featured boosts. Low-effort change, high revenue lift, mirrors how TikTok Shop monetizes its inline feed.
