# Stack Reference — Approved Libraries & Minimum Versions

> **Scope:** The approved library matrix, target minimum versions, and opt-in install recipes
> **Related:** `react.md`, `react-native.md`, `nestjs.md`, `ui-design.md`, `integrations.md`, `infrastructure.md`

---

## How to use this file

This is the single source of truth for **which library we use for what**, and the **minimum version to target**. Not every project uses every library — the starter kit installs a lean default set; everything else is **opt-in**, with the install command listed here. Pull what the feature needs; don't pre-install the long tail.

Deviating from an approved choice needs Tech Lead sign-off.

---

## Minimum versions — target "X and above"

Target **these versions or newer** for new code and future upgrades. **The repo's installed versions currently trail these** — the framework upgrade is a separate, deliberate pass. So: write code compatible with these targets, but don't assume they're already installed; check the actual `package.json` before relying on a new-version API.

| Layer | Library | Target (min) | Notes |
|-------|---------|-------------|-------|
| Lang | TypeScript | **6+** | |
| Pkg mgr | pnpm | **10+** | workspaces |
| Web | React | **19+** | |
| Web | Vite | **8+** | |
| Web | React Router | **7+** | |
| Web | Tailwind | **4+** | v4 engine |
| Mobile | Expo SDK | **56+** | RN **0.85+**; never mix SDK majors |
| Backend | NestJS | **11+** | |
| Backend | Prisma | **7+** | new projects (TypeORM = `instant-tasks` legacy only) |
| Data | PostgreSQL | **17+** | |
| Data | Redis | **7+** | BullMQ backend |

Shared across web + mobile: TanStack Query 5+, Zustand 5+, Axios 1.17+, Lucide.

---

## Web — installed by default (lean set)

React, Vite, React Router, TanStack Query, Zustand, Axios, Tailwind (+SCSS), clsx, lucide-react, sonner, `@googlemaps/js-api-loader`. **Plus (added in this pass):** `react-hook-form`, `zod`, `date-fns`, and **shadcn/ui** initialized.

### Web component library — shadcn/ui is the DEFAULT
Build responsive UI faster: **reach for a shadcn/ui component first; hand-build with Tailwind only when shadcn has no suitable component.** shadcn components are copied into the repo (owned/editable per project), not a runtime dependency. Never mix MUI/Ant with Tailwind. See `ui-design.md`.

```bash
# add a shadcn component
pnpm --filter @app/web dlx shadcn@latest add button dialog input
```

### Web — opt-in (install when the feature needs it)
| Need | Library | Install |
|------|---------|---------|
| Data tables (sort/page/filter) | `@tanstack/react-table` | `pnpm --filter @app/web add @tanstack/react-table` |
| Dashboard charts | `recharts` | `pnpm --filter @app/web add recharts` |

---

## Mobile — installed by default (lean set)

expo, expo-router, expo-constants, react-native, safe-area-context, screens, TanStack Query, Zustand, Axios, expo-secure-store, expo-status-bar. **Plus (added in this pass):** `nativewind` (+ tailwind/babel config), `lucide-react-native`, `react-native-reanimated`, `react-native-gesture-handler`.

> Install mobile packages with **`npx expo install <pkg>`** (SDK-matched), not `pnpm add`. Test native features on **real iOS *and* Android** devices before the Beta demo.

### Mobile — opt-in (install per feature)
| Need | Library | Install | Cross-platform caveat |
|------|---------|---------|----------------------|
| Lists (fast) | `@shopify/flash-list` | `npx expo install @shopify/flash-list` | — |
| SVG | `react-native-svg` | `npx expo install react-native-svg` | — |
| Bottom sheets | `@gorhom/bottom-sheet` | `npx expo install @gorhom/bottom-sheet` | needs reanimated + gesture-handler |
| Keyboard avoidance | `react-native-keyboard-controller` | `npx expo install react-native-keyboard-controller` | — |
| Haptics | `expo-haptics` | `npx expo install expo-haptics` | — |
| OAuth (PKCE) | `expo-auth-session` | `npx expo install expo-auth-session` | — |
| Google Sign-In | `@react-native-google-signin/google-signin` | `npx expo install @react-native-google-signin/google-signin` | separate OAuth client IDs per platform; iOS URL-scheme entry |
| Apple Sign-In | `expo-apple-authentication` | `npx expo install expo-apple-authentication` | **iOS only** — guard with `Platform.OS`; App Store mandates it if you offer social login |
| Biometrics | `expo-local-authentication` | `npx expo install expo-local-authentication` | always handle "not enrolled" |
| Camera (default) | `expo-camera` | `npx expo install expo-camera` | even iOS/Android parity; needs permission strings (`mobile-permissions`) |
| Camera (ML/high-FPS) | `react-native-vision-camera` | `npx expo install react-native-vision-camera` | dev client + plugin + reanimated; frame-processor differs per OS |
| Pick from gallery | `expo-image-picker` | `npx expo install expo-image-picker` | permission strings |
| Image display | `expo-image` | `npx expo install expo-image` | — |
| Video | `expo-video` | `npx expo install expo-video` | replaces deprecated expo-av |
| File system | `expo-file-system` | `npx expo install expo-file-system` | — |
| Maps (default) | `react-native-maps` | `npx expo install react-native-maps` | separate keys per platform; minor visual diffs |
| Maps (newer) | `expo-maps` | `npx expo install expo-maps` | Apple on iOS / Google on Android — behaviour differs |
| Location | `expo-location` | `npx expo install expo-location` | permission strings |
| Push | `expo-notifications` | `npx expo install expo-notifications` | APNs + FCM; iOS push only on a **real device** |
| Deep links | `expo-linking` | `npx expo install expo-linking` | — |
| Fast local storage | `react-native-mmkv` | `npx expo install react-native-mmkv` | native module → dev build required (no Expo Go) |
| OTA updates | `expo-updates` | `npx expo install expo-updates` | — |
| Dev build | `expo-dev-client` | `npx expo install expo-dev-client` | — |
| Crash reporting | Instant Tasks RN SDK | (see `error-monitoring.md`) | in-house; Sentry only if client mandates |
| In-app bug reporter | `@koderlabs/tasks-sdk-rn-reporter` | (see `in-app-reporter.md`) | peers `react-native-view-shot` + `react-native-svg`; optional `expo-sensors`/`expo-screen-capture` (injected) → dev build |
| In-app purchases | `react-native-purchases` | `npx expo install react-native-purchases` | RevenueCat; only for IAP/subs |

---

## Backend — installed by default

NestJS, `@nestjs/config`, Prisma, `@nestjs/jwt` + passport-jwt, bcrypt, class-validator/transformer, helmet, `@nestjs/throttler`, BullMQ, `@nestjs/schedule`, `@nestjs/swagger`, nodemailer, AWS SDK v3 (S3 + SES + presigner), stripe.

### Backend — opt-in
| Need | Library | Install |
|------|---------|---------|
| Structured JSON logs + request IDs | `nestjs-pino` (pino) | `pnpm --filter @app/api add nestjs-pino pino-http` |

---

## Testing & tooling (per `testing-*.md`, `infrastructure.md`)

Jest (+ ts-jest) + Supertest (API), standalone Playwright via MCP (web smoke), Maestro (mobile smoke). pnpm workspaces, TypeScript, ESLint + Prettier, GitHub Actions, Docker + Caddy. EAS Build & Submit for mobile releases.

## Rules Summary

- Single source of truth for approved libraries + minimum versions; deviations need Tech Lead sign-off.
- Target the "X and above" minimums for new code, but the repo's installed versions currently trail them — check actual `package.json` before using a new-version API.
- Lean default install set per app; everything else is opt-in with the listed install command — pull per feature, don't pre-install the long tail.
- Web: shadcn/ui is the default component library (component first, hand-built Tailwind only when none fits); never mix MUI/Ant with Tailwind.
- Install mobile packages with `npx expo install`; test native features on real iOS and Android before Beta demo.
- Mind the documented cross-platform caveats (Apple Sign-In iOS-only, push needs a real device, mmkv needs a dev build, maps keys per platform).
