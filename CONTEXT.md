# CONTEXT.md — Project Context & Architecture Master Record

> Last verified against the actual source tree on 2026-08-17 (branch `feature/indolj-lens`, after "Add dark mode, bottom tab navigation, and dashboard filter redesign"). Where earlier versions of this file described target-state tooling that was never adopted, that's been removed — see "Known dead code / divergences" for what's still genuinely in flux.

## Project Overview & Objectives

**IndoljMerchantApp** — in-repo rebrand **"Indolj Lens"** (see `app.json` `displayName`, and several in-app strings) — is a bare React Native CLI mobile app for merchants on the Indolj POS platform: multi-tenant login (a merchant "slug" typed at login resolves to `http://{slug}.indoljpos.com`), biometric re-login, and a live sales dashboard (Overview / Branches / Settings tabs) talking to a real per-merchant backend.

> **Detailed Specification Records**:
> - 📄 [docs/auth.md](docs/auth.md) — login request/response contract
> - 📄 [docs/branch-and-widgets.md](docs/branch-and-widgets.md) — branch settings + widget endpoint contracts
> - 📄 [docs/dashboard-api-integration-deep-dive.md](docs/dashboard-api-integration-deep-dive.md) — end-to-end dashboard call flow
> - 📄 [docs/total-sales-widget-spec.md](docs/total-sales-widget-spec.md), [docs/app-scope.md](docs/app-scope.md), [docs/phased-roadmap.md](docs/phased-roadmap.md)
> - 📄 [docs/POS_DASHBOARD_WORKFLOW.md](docs/POS_DASHBOARD_WORKFLOW.md) / [docs/pos-workflow.md](docs/pos-workflow.md) — two overlapping reverse-engineering guides for the **legacy** Indolj POS app this dashboard is being ported from (endpoint contracts, call graph, response→UI field mapping, old-app pitfalls). `POS_DASHBOARD_WORKFLOW.md` (860 lines) is the longer/more current of the two; `pos-workflow.md` (422 lines) is an earlier draft with substantial overlap.
> - 📄 [docs/architecture.md](docs/architecture.md) — describes some target-state pieces not in this repo; see divergence note below.

---

## System Architecture & Tech Stack

### Technology Stack (verified against `package.json`)
- **Framework**: React Native `0.86.2` — bare React Native CLI, **not Expo**
- **Runtime**: React `19.2.3`, Hermes
- **Language**: TypeScript `5.8.3` (strict, via `@react-native/typescript-config`)
- **Package manager**: Yarn 1 (`yarn@1.22.22`), Node `>= 22.11`
- **Navigation**: `@react-navigation/native` + `native-stack` + `bottom-tabs` — the bottom tab bar is fully custom-drawn (animated SVG notch + floating active-icon bubble), not the stock tab bar UI
- **HTTP**: `axios`, single shared instance — **no React Query / TanStack Query**
- **State**: React Context (`AuthContext`, `ThemeContext`, `ToastContext`) + plain `useState`/`useEffect` inside container hooks — **no Zustand, no Redux, no other global store library**
- **Persistence**: `@react-native-async-storage/async-storage` (session, theme preference, flags) + `react-native-keychain` (Keychain/Keystore, for biometric credential replay)
- **Biometrics**: `react-native-biometrics`
- **Charts**: `react-native-gifted-charts` (`BarChart`)
- **Icons**: hand-drawn SVGs via `react-native-svg` — no icon font/library dependency
- **Date picker**: `@react-native-community/datetimepicker` (Custom date-range mode in the filter sheet)
- **Dev tooling**: `reactotron-react-native` (dev-only, mirrors every API request/response/error), ESLint (`@react-native/eslint-config`), Jest (`@react-native/jest-preset`)
- **Native**: Android — Gradle, `applicationId`/`namespace` = `com.indoljmerchantapp`. iOS — CocoaPods, Xcode workspace; **`PRODUCT_BUNDLE_IDENTIFIER` is still the unmodified RN template default** (see divergences below).

### Architectural Pattern
- **Container hook pattern**: screens/components hold JSX only; all state, validation, and API calls live in a co-located hook in `src/hooks/` (e.g. `LoginScreen`/`LoginForm` are presentation, `useLoginContainer` owns everything else).
- **State-driven navigation**: `RootNavigator` is a plain conditional render on `AuthContext` state (`isHydrating` → splash, `isAuthenticated` → app stack vs. auth stack), not imperative `navigation.replace()` calls.
- **Context for cross-cutting concerns, hooks for data**: `AuthContext` (session), `ThemeContext` (light/dark palette), `ToastContext` (transient notifications) are the only three providers; every data-fetching concern is a local hook (`useWidgetsData`, `useBranches`, `useBranchWiseSummaries`), not a global store.

---

## Directory Structure (actual)

```
IndoljMerchantApp/
├── docs/                              # Domain & architecture specs (see list above)
├── src/
│   ├── api/
│   │   ├── client.ts                  # Single Axios instance; per-request baseURL swap for multi-tenant routing
│   │   ├── config/routes.ts           # BASE_URL, buildMerchantBaseUrl(), ENDPOINTS map
│   │   └── services/                  # authService, branchService, widgetService (17 typed fetchers)
│   ├── components/
│   │   ├── CustomTabBar.tsx           # Dead re-export shim — real impl is navigation/CustomTabBar.tsx
│   │   ├── CurvedTabBarBackground.tsx # Dead, unreferenced
│   │   ├── auth/LoginForm.tsx
│   │   ├── common/                    # CustomButton, CustomPillInput, Checkbox, ToggleSwitch, SkeletonLoader,
│   │   │                              # VectorIcon, SplashScreen (+ CustomInput.tsx, dead/unreferenced)
│   │   └── dashboard/                 # ~19 components: header, filter bar/FAB/bottom-sheet, logout modal,
│   │                                  # matrix/summary drill-down views, one card per dashboard section
│   ├── context/
│   │   ├── AuthContext.tsx            # Session + multi-tenant merchant-host routing
│   │   ├── ThemeContext.tsx           # Light/dark palette, persisted preference
│   │   └── ToastContext.tsx           # Animated toast notifications
│   ├── hooks/                         # useLoginContainer, useWidgetsData, useDateBranchFilter,
│   │                                  # useBranches, useBranchWiseSummaries
│   ├── navigation/                    # RootNavigator, Auth/AppStackWrapper, AppTabNavigator, CustomTabBar
│   ├── screens/                       # LoginScreen, DashboardScreen, BranchesScreen, SettingsScreen
│   │                                  # (+ DashboardScreenPlaceholder.tsx, dead/unreferenced)
│   ├── styles/                        # colors.ts (light+dark), theme.ts, typography.ts
│   ├── types/                         # auth.ts, dashboard.ts
│   └── utils/                         # formatters, dateRange, salesReportMetrics, secureStorage, asyncSafe
├── __tests__/App.test.tsx             # Single smoke render test — no hook/unit coverage for src/
├── android/ ios/                      # Native projects
├── App.tsx                            # Provider tree + NavigationContainer
└── package.json
```

---

## Architecture Detail

### App shell & providers
`App.tsx` nests: `SafeAreaProvider` → `ThemeProvider` → `ToastProvider` → `AuthProvider` → `NavigationContainer` → `RootNavigator`.

### Navigation
`RootNavigator`: `isHydrating` → `SplashScreen`; else `isAuthenticated ? AppStackWrapper : AuthStackWrapper`.
- `AuthStackWrapper` — single `Login` screen.
- `AppStackWrapper` — a native-stack wrapper around one screen, `Main`, which is `AppTabNavigator`.
- `AppTabNavigator` — bottom tabs (`Branches`, `Dashboard`, `Settings`), rendered with a custom `tabBar` prop pointing at `navigation/CustomTabBar.tsx`: an animated SVG notch cutout + a floating "FAB" bubble that holds the active tab's icon, fully theme-aware. (`components/CustomTabBar.tsx` is a one-line re-export left over from an earlier location; `components/CurvedTabBarBackground.tsx` is an unrelated, unreferenced earlier notch implementation — both are dead code, not the live tab bar.)

### Container hook pattern
`LoginScreen`/`LoginForm` → `useLoginContainer`; `DashboardScreen` → `useWidgetsData` + `useDateBranchFilter`; `BranchesScreen` → `useBranches` + `useBranchWiseSummaries` + `useDateBranchFilter`. Screens/components are JSX-only consumers of these hooks' return values.

### Theming
`ThemeContext` (`src/context/ThemeContext.tsx`) hydrates a persisted `isDarkMode` bool (`@indolj_dark_mode_enabled` in AsyncStorage) and exposes `colors` = `lightColors` or `darkColors` from `styles/colors.ts` — both share one `Colors` shape so no consumer branches on theme itself. Toggled from `SettingsScreen`. The de facto pattern for any themed screen/component is:
```ts
const { colors } = useTheme();
const styles = useMemo(() => createStyles(colors), [colors]);
```
`StyleSheet.create()` is still used (per the project convention), just produced by a `createStyles(colors)` factory re-invoked on theme change rather than as a single static module constant. A `colors` static default (light palette only) is still exported from `styles/colors.ts` for any leftover non-reactive usage, but new/touched code should go through `useTheme().colors`.

### Auth & multi-tenant session (`src/context/AuthContext.tsx`)
Builds on the 4-element tuple login (`docs/auth.md`) with per-merchant routing:
- `LoginCredentials` carries a `merchantSlug` (the Login screen's "Merchant" field) alongside the wire DTO fields — the slug is never sent in the POST body, only used for routing.
- `buildMerchantBaseUrl(slug)` (`api/config/routes.ts`) resolves to `http://{slug}.indoljpos.com`; `AuthContext.login()` calls `setClientMerchantHost()` (a module-level var in `api/client.ts`, mirroring `setClientAuthToken`) **before** issuing the login POST, so the login request itself is addressed to the right tenant.
- The slug persists to `STORAGE_KEYS.MERCHANT_SLUG` and re-arms the client host on cold-start hydration.
- 4-tuple response shape, AsyncStorage keys, the `EXPLICIT_LOGOUT` guard, and `hasPermission()` are unchanged from `docs/auth.md`.
- **Biometric re-login** (`useLoginContainer` + `react-native-biometrics`): gated by sensor availability + `BIOMETRIC_ENABLED` + `!EXPLICIT_LOGOUT`, auto-prompts ~400ms after cold-start mount. On success it first tries replaying the cached 4-tuple straight from AsyncStorage (no network call); if that's absent, it re-POSTs login using credentials pulled from Keychain/Keystore (`utils/secureStorage.ts`).

### API layer
`api/client.ts` — one Axios instance; the request interceptor sets `config.baseURL = currentMerchantHost || BASE_URL` on every call (not just the Authorization header), plus Reactotron mirroring in `__DEV__`. `api/config/routes.ts` — `BASE_URL` + `buildMerchantBaseUrl()` + a frozen `ENDPOINTS` map. `api/services/widgetService.ts` has 17 typed fetchers for `/widgets/*`; every response is unwrapped from a `{status, message, details}` envelope (`sales-report` additionally carries a sibling `previous` array) — nothing upstream of the service layer should see the raw envelope. `authService`/`branchService` are as documented in `docs/auth.md` / `docs/branch-and-widgets.md`.

### Dashboard data & hooks
- `useWidgetsData` — two-phase fetch: `get-api-details` + `get-branch` awaited first, then 10 widget endpoints via a `Promise.allSettled` (Hermes/JSC-safe polyfill in `utils/asyncSafe.ts`) so one failing widget doesn't blank the rest of the screen. `utils/salesReportMetrics.ts` + `utils/formatters.ts` do all the name-keyed extraction, percentage, currency, and growth-vs-previous-period derivation feeding ~15 dashboard cards.
- `useDateBranchFilter` — shared filter *shape* (date preset + branch + bottom-sheet open state), but instantiated **independently per screen** — Dashboard and Branches each hold their own copy; no filter state is shared between tabs.
- `useBranches` / `useBranchWiseSummaries` — lighter hooks backing the Branches tab; reuse the same registry+branches priority-fetch pattern without the full widget set.
- `useLoginContainer` — form state, validation, and the biometric cold-start flow described above.

### Screens
- **DashboardScreen** — hero total-sales card, 12-tile Sales Overview grid, Order Insights, Payment Breakdown, Party-wise Sales, Sales Trend bar chart, and 5 "tap to view report" navigation cards that swap in full-screen drill-down sub-views (`SaleSummaryView`, `MatrixReportView`) via local component state — not separate navigator routes.
- **BranchesScreen** — per-branch sales cards via `useBranchWiseSummaries`. Its own branch filter is currently a no-op (always lists/shows every branch) — this is a deliberate, commented-in-source match to the legacy reference app's behavior, not a bug.
- **SettingsScreen** — profile card, dark-mode toggle, logout.
- **LoginScreen** — animated time-of-day greeting + steaming-bowl header, hosts `LoginForm` (merchant slug / email / password / biometric toggle / fingerprint button).
- `DashboardScreenPlaceholder.tsx` — dead code, no longer wired into navigation.

### Styling
`src/styles/colors.ts` exports `lightColors`/`darkColors` (identical key shape, typed as `Colors`); `border.light`/`border.dark` are two distinct border **weights** used side by side in the app (not a light/dark-theme pair — both exist in each palette with their own value). `typography.ts`/`theme.ts` are unchanged in shape — spacing/radius/typography tokens — and components typically import `typography`/`fontWeights` directly rather than through the `theme` aggregate.

### Components
- `components/common/` — `CustomButton`, `CustomPillInput` (the primary form input: pill-shaped, icon + suffix), `Checkbox`, `ToggleSwitch` (simple + theme variant with a sun/moon icon morph), `SkeletonLoader`, `VectorIcon` (~30 hand-drawn SVG icons), `SplashScreen`. Check here before adding a new primitive. (`CustomInput.tsx` also lives here but is unreferenced — superseded by `CustomPillInput`.)
- `components/auth/` — `LoginForm` only.
- `components/dashboard/` — ~19 components: `DashboardHeader`; the filter cluster `FloatingFilterBar` + `FilterFAB` + `FilterBottomSheet` (date/branch picker, with a Custom-range mode using the native date picker); `LogoutConfirmModal`; drill-down views `MatrixReportView` + `SaleSummaryView`; and one card per dashboard section (`BranchSummaryCard`, `SalesOverviewCard`, `OrderInsightsCard`, `PaymentBreakdownCard`, `PartyWiseSalesCard`, `SalesTrendCard`, `BranchWiseSalesCard`, `ItemWiseSalesCard`, `CategoryWiseSalesCard`, `OnlineOrdersCard`, `HourlySalesChart`, `OverviewMetricsGrid`, `ReportNavigationCard`).

---

## Known dead code / divergences (as of 2026-08-17)

- **Dead files**, unreferenced anywhere: `src/screens/DashboardScreenPlaceholder.tsx`, `src/components/CurvedTabBarBackground.tsx`, `src/components/common/CustomInput.tsx`.
- **iOS bundle identifier was never customized**: `ios/IndoljMerchantApp.xcodeproj/project.pbxproj`'s `PRODUCT_BUNDLE_IDENTIFIER` is still the RN template default (`org.reactjs.native.example.$(PRODUCT_NAME...)`). Android's `applicationId`/`namespace` (`com.indoljmerchantapp`) was set correctly.
- **Rebrand in flight**: `app.json`'s `displayName` and several in-app strings already say "Indolj Lens" (the current branch is `feature/indolj-lens`), but the package name, native project names, and bundle IDs still say `IndoljMerchantApp`.
- **Pre-existing `tsc --noEmit` errors** (5, unrelated to any specific feature): implicit-`any` on the Reactotron import in `api/client.ts`; a missing `NodeJS` namespace type in `ToastContext.tsx`.
- **`types/dashboard.ts`'s `SaleSummaryRecord`** only declares `tokenNo`/`time`/`branch`; `DashboardScreen`'s actual mapped records also carry `orderType`/`saleAmount`. Not a compiler error (assigned via `.map()`, not an object literal), but the type doesn't reflect real usage.
- **`docs/architecture.md` and `.antigravity/rules/react-native.md` / `stack-reference.md` describe a different template** (Zustand, React Query, `src/stores/`, `src/components/ui/`, Expo, pnpm, a NestJS-monorepo layout) that this project does not use — treat those as inapplicable here, not as a roadmap.

---

## Development & Build Workflows

| Action | Command |
| --- | --- |
| Install deps | `yarn install` |
| iOS pods (first-time / after native dep changes) | `bundle install && bundle exec pod install --project-directory=ios` |
| Start Metro | `yarn start` |
| Run Android | `yarn android` |
| Run iOS | `yarn ios` |
| Lint | `yarn lint` |
| Unit tests | `yarn test` |
| Typecheck | `npx tsc --noEmit` |

---

## Current Roadmap / Next Steps

### Phase 1: Foundation & Project Structure (Complete)
- [x] React Native CLI bootstrap (v0.86.2 / React 19)
- [x] Central design system (`src/styles/`) with light + dark palettes
- [x] POS Dashboard UI components and hand-drawn vector icon system

### Phase 2: Navigation, Auth & POS Dashboard (Complete)
- [x] Multi-tenant merchant-slug login + 4-element tuple session persistence
- [x] Biometric re-login (fingerprint/Face ID via Keychain/Keystore-cached credentials)
- [x] Bottom-tab navigation (Branches / Dashboard / Settings) with a custom animated tab bar
- [x] Dark mode (`ThemeContext`, persisted preference, Settings toggle)
- [x] Live POS Dashboard: ~15 widget-backed cards + 5 drill-down report views, backed by `branchService.ts` / `widgetService.ts` / `useWidgetsData.ts`

### Phase 3: Order Management & Push Notifications (Not started)
- [ ] Real-time incoming order alerts & sound notifications
- [ ] Order status acceptance & fulfillment dispatch flow
