# Fixes Web — Front-End Technical Documentation

> **Last Updated:** 2026-06-17
> **Scope:** Full Frontend Architecture (App Router, Components, Hooks, Lib, Contexts)

---

## 1. Directory Blueprint & Organization Strategy

The application adopts a **Hybrid Architecture**: Feature-based routing via the Next.js App Router, and Function-based abstraction for everything else (`lib/`, `hooks/`, `components/`).

### Root Structure
- `app/` - Core routing and page layouts (Client, Admin, Agency, Marketing).
- `components/` - Isolated UI building blocks.
- `contexts/` - Global React state providers (Auth, Sockets, Notifications).
- `hooks/` - Reusable custom React hooks.
- `lib/` - Stateless utility functions, API wrappers, and strict TypeScript definitions.

---

## 2. Panel Deep Dives (The `app/` Directory)

### 2.1 Client Portal (`app/dashboard`)
The command center for homeowners posting jobs and tracking quotes.
- **`layout.tsx`:** 
  - **Structure:** Implements a responsive sidebar (`hidden lg:flex`) and an off-canvas mobile menu toggled via state `sidebarOpen`.
  - **Context:** Wraps children in `<NotificationsProvider>` for real-time bell alerts.
- **`page.tsx` (Dashboard Overview):** 
  - **State:** `@state {Job[]} jobs` (Paginated summary), `@state {boolean} isLoading`.
  - **Interactions:** Listens to `app:refresh_data` window events to trigger silent, instantaneous refreshes without blocking the UI.
- **`jobs/page.tsx` (My Jobs):**
  - **State:** `@state {JobStatus | 'all'} statusFilter` to toggle between 'Quoted', 'In Progress', 'Completed'.
  - **Methods:** `fetchJobs()` uses `api.getPaginated` dynamically appending `?status=...`.
- **Sub-routes:** `/dashboard/jobs/[id]` (Job Detail), `/dashboard/find-talent`, `/dashboard/profile`.

### 2.2 Super Admin Panel (`app/admin`)
The global oversight tool for internal staff.
- **`layout.tsx`:** 
  - **Auth Logic:** Enforces strict gatekeeping. `isFullAdmin` must be true. If `user.isCleaningAdmin` is true but `isFullAdmin` is false, they are redirected to `/cleaning-admin`.
  - **Styling:** Features a distinct blue theme (`#2563EB`) to differentiate from client portals.
- **`page.tsx` (Admin Overview):** 
  - **State:** `@state {AdminStats} stats` (Total Revenue, Active Jobs, Pending Verifications).
  - **Methods:** `load(silent)` fires off `api.get('/api/admin/stats')`.
  - **Interactions:** Employs a robust background polling system (`setInterval` every `30,000ms`) rather than persistent sockets to preserve database connection limits.
- **Sub-routes:** 
  - `/admin/users` (Client/Tradie tables)
  - `/admin/waitlist-leads` (Lead generation tracking)
  - `/admin/disputes` (Dispute management)
  - `/admin/bug-reports` 
  - `/admin/commission`.

### 2.3 Cleaning Agency Panel (`app/cleaning-admin`)
A dedicated portal for Agency Managers to monitor cleaner fleets and job dispatches.
- **`layout.tsx`:** 
  - **Context:** Wraps the experience in `<CleaningAdminRealtimeProvider>` to establish a persistent Socket.io connection. 
  - **Styling:** Styled with a teal theme (`#0d9488`). Features a `CleaningAdminInbox` component injected into the header.
- **`page.tsx` (Operations Dashboard):**
  - **State:** `@state {DashboardStats} stats` (Online Cleaners, Pending Dispatch, Revenue).
  - **Interactions:** Utilizes `useCleaningAdminSubscription(['dashboard', 'jobs', 'cleaners'], () => fetchDashboard())` to automatically ingest socket payloads and redraw the UI in real-time.
- **Sub-routes:** `/cleaning-admin/cleaners`, `/cleaning-admin/invites`, `/cleaning-admin/rates`, `/cleaning-admin/revenue`.

### 2.4 Landing & Static Pages
- **`app/page.tsx`:** The entry point. Imports heavily from `components/upwork` (`<HeroSection />`, `<CategoryTabs />`, `<HowItWorks />`, `<PricingPlans />`, `<Testimonials />`, `<TrustedBy />`, `<BrandManifesto />`).
- **`app/about-us/page.tsx` & `app/careers/page.tsx`:**
  - **Configuration:** Employs explicit `export const metadata: Metadata` objects for optimal SEO.
  - **Styling:** Utilizes `next/image` with calculated inline `aspectRatio` styles to prevent Cumulative Layout Shift (CLS). Content is predictably wrapped in `<main className="min-h-screen">` followed by `<Header />` and `<Footer />`.

---

## 3. The `lib/` Directory (Core Utilities)

The `lib` folder acts as the stateless engine of the application.

### `lib/api.ts`
The universal network layer.
- **Methods:** Wraps Axios with `api.get`, `api.post`, `api.put`, etc.
- **Interceptors:** Features a complex JWT refresh mechanism. Automatically catches `401 Unauthorized` responses, locks a mutex, silently attempts to `/auth/refresh` using `localStorage`, and replays queued requests transparently.

### `lib/types.ts`
The source of truth for all data models. Over 600 lines of strict definitions.
- **Interfaces:** Extensively defines `User`, `TradieProfile`, `Job`, `Quote`, `ScopeChange`, and `AiAnalysisLog`.
- **Enums/Unions:** Strictly types `TradieCategory` (e.g., `'electrical' | 'plumbing' | 'cleaning'`), `JobStatus` (e.g., `'analyzing' | 'quoted' | 'completed'`), and `PropertyType` (`'studio' | 'townhouse'`).

### `lib/constants.ts`
Centralizes string mappings and constants to avoid magic strings.
- **Mappings:** `JOB_STATUS_LABELS`, `JOB_STATUS_COLORS` (e.g., `quoted: 'bg-amber-100 text-amber-700'`).
- **Calculations:** Contains `PROPERTY_TYPE_MULTIPLIERS` which dynamically adjusts base quotes based on property scale.

### `lib/australianTime.ts`
Timezone management logic.
- **Purpose:** Prevents cross-state scheduling conflicts by forcing date calculations into explicit Australian timezones (AEST/AEDT, AWST, ACST).

---

## 4. The `hooks/` Directory

### `use-toast.ts`
A custom, zero-dependency implementation for managing ephemeral notification states.
- **State:** Uses a reducer pattern to manage `toasts: ToasterToast[]`. Limits active toasts to `TOAST_LIMIT = 1`.
- **Methods:** Exposes `toast({ ... })`, `dismiss()`, and `update()`. Auto-removes after `TOAST_REMOVE_DELAY`.

### `use-mobile.ts`
- **Method:** Listens to `window.matchMedia('(max-width: 768px)')`.
- **Purpose:** Returns a boolean allowing complex UI components (like Sidebars or Drawers) to conditionally render based on viewport width.

---

## 5. The `contexts/` Directory (Global State)

We avoid Redux, favoring highly specialized React Contexts to prevent prop-drilling.

### `auth-context.tsx`
- **State:** `@state {User | null} user`, `@state {TradieProfile | null} profile`, `@state {boolean} isLoading`.
- **Methods:** `login()`, `logout()`, `registerClient()`, `refreshUser()`.
- **Lifecycle:** Boots on initial load, parses JWT from `localStorage`, validates the session against `/api/auth/me`, and manages Socket.io `reconnectSocket()` logic upon successful login.

### `cleaning-admin-realtime-context.tsx`
- **Purpose:** Manages the isolated Socket.io instance specifically for Agency Managers.
- **State:** Buffers `recentEvents` and counts `unreadAlertCount`.

### `notifications-context.tsx`
- **Purpose:** Paginates and caches the user's notification bell history.

---

## 6. Component Library (`components/`)

Components follow strict rules regarding Props, State, and Documentation.

### 6.1 `components/ui/` (The Primitives)
Contains 50+ Headless UI primitives (built on Radix UI) styled with Tailwind.
- **Examples:** `<Dialog />`, `<Select />`, `<Accordion />`.
- **Philosophy:** These components contain zero business logic. They purely accept props and render accessible DOM nodes.

### 6.2 `components/admin/` & `components/upwork/`
Feature-specific components containing heavy business logic.

**Example: `CleaningAdminInbox.tsx`**
- **Props/Context:** Pulls `recentEvents` directly from `useCleaningAdminRealtime()`.
- **Methods:** 
  - `timeAgo(iso)` calculates string approximations (e.g., "5m ago").
  - `handleNavigate(event)` routes the admin directly to the entity that triggered the alert via `useRouter`.
- **Styling:** Uses dynamic CSS variables for severity formatting (`border-l-red-500` for Critical, `border-l-teal-500` for Info).

**Example: `PostJobWizard.tsx`**
- **Props:** `@prop {string} preselectedCategory`
- **State:** Tracks 15+ local states ranging from `title` and `description` to `images` array and `scheduledFor` times.
- **Interactions:** Manages the direct-to-Cloudinary image upload flow using `react-dropzone` logic.

---

## 7. Styling, CSS, and Tailwind Architecture

We adhere to a Utility-First architecture utilizing **Tailwind CSS v4** combined with CSS custom properties.

### 7.1 Brand Palette & Variables (`globals.css`)
Semantic variable naming replaces hardcoded hex codes to ensure consistency.
```css
:root {
  --upwork-green: #14a800;       /* Primary Actions, Success States */
  --upwork-green-dark: #108a00;  /* Hover States for CTAs */
  --upwork-navy: #001e00;        /* Headings, Primary Typography */
  --upwork-gray: #5e6d55;        /* Subtitles, Muted Text */
  --upwork-border: #d5e0d5;      /* Dividers, Card Borders */
}
```

### 7.2 Component-Specific Styling Rules (BEM Equivalency)
We emulate traditional BEM methodology (`block__element--modifier`) by grouping Tailwind states conditionally inside template literals or `clsx`:
```tsx
/* Dynamic Active/Inactive Button States */
<button
  className={`px-4 py-3.5 rounded-xl border transition-all ${
    isActive
      ? 'bg-(--upwork-navy) text-white border-(--upwork-navy)' /* Modifier: Active */
      : 'bg-white text-(--upwork-navy) hover:border-(--upwork-navy)' /* Default/Hover */
  }`}
>
```

### 7.3 Responsive Breakpoints
Our mobile-first standard relies strictly on standard Tailwind breakpoints:
- **Mobile (`<640px`):** Default standard (e.g., `flex-col`, `w-full`).
- **Tablet (`sm: >=640px`):** Grid expansions (e.g., `sm:grid-cols-2`).
- **Desktop (`md: >=768px`):** Used for advanced list views (e.g., `md:grid-cols-3`).
- **Large Desktop (`lg: >=1024px`):** Layout shifts (e.g., toggling permanent sidebars via `hidden lg:flex`).
