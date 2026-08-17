# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

IndoljMerchantApp is a bare React Native CLI (not Expo) mobile app for merchants on the Indolj POS platform — login/session management and a live sales dashboard, talking to a real backend at `http://salesdemo.indoljpos.com`.

Stack: React Native 0.86.2, React 19, TypeScript 5.8 (strict, via `@react-native/typescript-config`), Yarn 1 (`packageManager: yarn@1.22.22`), Node >= 22.11.

## Commands

```bash
yarn install                 # install JS deps
bundle install && bundle exec pod install --project-directory=ios   # first-time / after native dep changes (iOS)

yarn start                   # Metro bundler
yarn android                 # build + run on Android
yarn ios                     # build + run on iOS

yarn lint                    # eslint . (config: @react-native/eslint-config)
yarn test                    # jest (preset: @react-native/jest-preset)
yarn test __tests__/App.test.tsx   # run a single test file
yarn test -t "renders correctly"   # run tests matching a name
npx tsc --noEmit             # typecheck (no dedicated package.json script exists)
```

There is only one test file (`__tests__/App.test.tsx`, a smoke render test) — this codebase does not currently have hook/unit test coverage for `src/`.

## Architecture

### App shell & navigation

`index.js` → `App.tsx` nests providers: `SafeAreaProvider` → `ToastProvider` → `AuthProvider` → `NavigationContainer` → `RootNavigator`.

`RootNavigator` (`src/navigation/RootNavigator.tsx`) is a state-driven switch, not imperative navigation: it renders `SplashScreen` while `AuthContext.isHydrating`, then `AppStackWrapper` or `AuthStackWrapper` based on `AuthContext.isAuthenticated`. There is no "logged out mid-session" navigation call anywhere — flipping the context state is what changes the visible stack.

### Container hook pattern

Screens/components hold JSX only; state, validation, and API calls live in a co-located hook in `src/hooks/`. Example: `LoginScreen`/`LoginForm` are presentation, `useLoginContainer` owns form state, validation, biometric flow, and calls `AuthContext.login`. When adding a screen with any logic, follow this split rather than putting state/effects in the screen component.

### Auth & session (`src/context/AuthContext.tsx`)

- The login endpoint returns a **4-element tuple**, not an object: `LoginResponseTuple = [AuthToken, UserProfile, statusCode, permissions[]]` (see `docs/auth.md`). Code accesses it by index (`tuple[0]`, `tuple[1]`, `tuple[3]`) — there are no named fields on the wire.
- On login, `AuthContext` pushes the token into the Axios client via `setClientAuthToken` (in `src/api/client.ts`, module-level variable, not a header set per-call), persists token/user/permissions/tuple to `AsyncStorage` under the `STORAGE_KEYS` in `AuthContext.tsx`, and separately saves email/password/token to the iOS Keychain / Android Keystore via `src/utils/secureStorage.ts` (`react-native-keychain`) for biometric re-login.
- Session hydration on cold start reads `AsyncStorage` and re-arms the Axios token; `isHydrating` gates the splash screen.
- `logout()` sets an `EXPLICIT_LOGOUT` flag in `AsyncStorage` — this is what suppresses the automatic biometric prompt on next app launch (see `useLoginContainer`'s cold-start effect). Don't remove this flag handling when touching logout/biometric code, it's the guard against auto-relogin after an intentional sign-out.
- `hasPermission(name)` checks the flat `permissions: string[]` from the tuple's 4th element.

### API layer

- `src/api/client.ts`: single Axios instance, bearer token injected via request interceptor from the module-level token set by `setClientAuthToken`. In `__DEV__`, requests/responses/errors are also mirrored to Reactotron (`ReactotronConfig.js`).
- `src/api/config/routes.ts`: `BASE_URL` + a frozen `ENDPOINTS` map — add new endpoints here, don't inline URL strings in services.
- `src/api/services/*.ts` (`authService`, `branchService`, `widgetService`): one function per endpoint, each normalizes Axios errors into a plain `Error` with a server-provided or status-derived message. Several responses are **index-based tuples** (login: 4-element; branch settings: 3-element, see `docs/branch-and-widgets.md`) rather than objects — check `docs/auth.md` / `docs/branch-and-widgets.md` before assuming a response shape.

### Dashboard data (`src/hooks/useWidgetsData.ts`)

Fires ~11 widget endpoints in parallel per date-range/branch change via a `Promise.allSettled` (with a manual polyfill for Hermes/JSC engines that lack it), so one failing widget doesn't blank the rest of the dashboard — each result is applied independently with an `if (status === 'fulfilled')` fallback to an empty/null default. It also does the currency/percentage/growth derivations for the ~15 dashboard cards in `src/components/dashboard/`. `src/utils/formatters.ts` has `parseNumber()` — always parse widget/matrix cell values through it before doing arithmetic or display formatting, since numeric fields can arrive as strings.

### Styling

Centralized tokens in `src/styles/{colors,theme,typography}.ts`. Components use `StyleSheet.create()` exclusively — no inline style objects. Check `src/components/common/` (`CustomButton`, `CustomInput`, `CustomPillInput`, `Checkbox`, `ToggleSwitch`, `SkeletonLoader`, `VectorIcon`, `SplashScreen`) for an existing primitive before adding a new one.

### Docs

`docs/` has the maintained specs — check these before re-deriving contracts from scratch:
- `docs/auth.md` — login request/response shapes
- `docs/branch-and-widgets.md` — branch settings + all widget endpoint contracts
- `docs/dashboard-api-integration-deep-dive.md` — end-to-end call flow for the dashboard
- `docs/total-sales-widget-spec.md`, `docs/app-scope.md`, `docs/phased-roadmap.md`

### Where the docs diverge from the actual code

`CONTEXT.md` and `docs/architecture.md` describe some target-state pieces that aren't in the repo yet — don't assume they exist: no `src/stores/` (no Zustand), no React Query, no `MetricTile.tsx`/`DataTable.tsx`/`useDashboardFilters.ts`, no `ForgotPasswordScreen`/`OrdersScreen`/`InventoryScreen`. Current global state is just `AuthContext` + `ToastContext`, plain `useState`/`useEffect` in container hooks, and `AsyncStorage`/Keychain for persistence. Similarly, `.antigravity/rules/react-native.md` and `.antigravity/rules/stack-reference.md` describe an Expo + pnpm + Zustand + React Query + NestJS-monorepo template that does not match this project (bare RN CLI, Yarn, single app, no backend in this repo) — don't follow those two files' framework/library choices here.

## Project conventions (from `.antigravityrules`)

- No `any` — explicit interfaces/types for props, state, navigation params, API responses.
- Named exports for components/hooks/utils; default export reserved for entry/screen components required by the navigation library.
- `Platform.select()` for small iOS/Android differences; `.ios.tsx`/`.android.tsx` files for larger divergence.
- Don't hand-edit generated native project files under `android/`/`ios/` without noting why (signing, permissions, icons, etc.) — most of that tree is generated/managed by the RN CLI and CocoaPods/Gradle.
