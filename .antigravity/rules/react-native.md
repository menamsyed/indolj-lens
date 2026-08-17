---
paths:
  - 'apps/mobile/**'
---

# React Native + Expo Standards

> **Scope:** React Native mobile apps — Expo, navigation, native styling, Maestro testing
> **Related:** `react.md`, `typescript.md`, `ui-design.md`

---

## Framework Choice

Use **Expo (managed workflow)** for all new projects. Expo is the React Native team's officially recommended framework. It provides:

- Cloud builds via EAS (no local Xcode/Gradle required)
- Over-the-air updates
- Config plugins for native module access
- Seamless eject to bare workflow if ever needed

Only use bare React Native CLI when the project requires custom native modules that Expo config plugins cannot handle.

## Project Structure

```
apps/mobile/
  app.json                    # Expo config
  app/                        # Expo Router file-based routing (if using Expo Router)
  src/
    components/
      layout/                 # AppShell, TabBar, Drawer — app-level wrappers
      ui/                     # Reusable: Button, Card, Input, Avatar, Badge
      {feature}/              # Feature-specific compound components
    hooks/
      queries/                # React Query hooks — one file per API module
    lib/
      api.ts                  # Axios instance with auth interceptors
      storage.ts              # AsyncStorage / SecureStore wrapper
      constants.ts            # App constants
    navigation/               # Navigation config (if not using Expo Router)
      RootNavigator.tsx
      AuthNavigator.tsx
      MainNavigator.tsx
    screens/                  # Screen components (one per route)
    stores/                   # Zustand stores — one per domain
    styles/
      theme.ts                # Centralized theme (colors, spacing, typography)
  assets/                     # Images, fonts, icons
```

## Naming Conventions

Follow the same conventions as `typescript.md` with these additions:

- **Screen files**: PascalCase with `Screen` suffix — `LoginScreen.tsx`, `ProfileScreen.tsx`
- **Navigator files**: PascalCase with `Navigator` suffix — `AuthNavigator.tsx`, `MainNavigator.tsx`
- **Component files**: PascalCase — `SessionCard.tsx`, `TerminalView.tsx`
- **Hook files**: camelCase with `use` prefix — `useAuth.ts`, `useTerminal.ts`
- **Store files**: kebab-case with `.store.ts` suffix — `auth.store.ts`, `terminal.store.ts`

## Navigation

Use **React Navigation** (or Expo Router for file-based routing):

```typescript
// navigation/RootNavigator.tsx
const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}
```

**Rules:**

- Use native stack navigator (`@react-navigation/native-stack`) for performance
- Conditional rendering for auth vs main flow (not imperative navigation)
- Type-safe navigation params with `RootStackParamList`
- Deep linking config for push notifications and universal links
- Never nest more than 3 levels of navigators

## State Management (Zustand)

Same patterns as `react.md` with mobile-specific storage:

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      login: async (email, password) => {
        /* ... */
      },
      logout: async () => {
        /* ... */
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
```

**Rules:**

- Use `AsyncStorage` for Zustand persistence (not `localStorage`)
- Use `expo-secure-store` for sensitive data (tokens, credentials)
- One store per domain — keep them thin
- Use React Query for server state, Zustand for client-only state

## Data Fetching (React Query)

Same patterns as `react.md`. React Query works identically in React Native:

```typescript
export function useResources(filters?: ResourceFilters) {
  return useQuery({
    queryKey: ['resources', filters],
    queryFn: () => api.get('/resources', { params: filters }),
  });
}
```

**Rules:**

- Never fetch data in `useEffect` — always React Query hooks
- Handle offline/reconnection: set `networkMode: 'offlineFirst'` for offline-first UX
- Use `focusManager` and `onlineManager` from React Query for app state changes

## API Client (lib/api.ts)

Same Axios setup as `react.md` with mobile-specific base URL:

```typescript
const api = axios.create({
  baseURL: Constants.expoConfig?.extra?.apiUrl || 'https://api.example.com/api/v1',
  headers: { 'Content-Type': 'application/json' },
});
```

- Base URL from Expo config (not `import.meta.env`)
- Same interceptor patterns (JWT injection, 401 refresh with mutex)

## Styling

Use **StyleSheet** for all styles — never inline style objects:

```typescript
import { StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface.bg,
    padding: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.heading.fontSize,
    fontWeight: theme.typography.heading.fontWeight,
    color: theme.colors.text.primary,
  },
});
```

**Rules:**

- Centralize theme in `styles/theme.ts` — colors, spacing, typography, shadows
- Reference theme values in StyleSheet — never hardcode colors/sizes
- Use `StyleSheet.create()` for all styles (performance optimization)
- Never use inline style objects directly on components
- Platform-specific styles via `Platform.select()` or `.ios.ts` / `.android.ts` file extensions
- Use `expo-font` for custom fonts — load in app entry before rendering

## Theme Definition

```typescript
// styles/theme.ts
export const theme = {
  colors: {
    brand: { primary: '...', light: '...', dark: '...' },
    surface: { bg: '...', card: '...', sidebar: '...' },
    text: { primary: '...', secondary: '...', muted: '...' },
    accent: { success: '...', warning: '...', error: '...' },
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  typography: {
    heading: { fontSize: 24, fontWeight: '700' as const },
    body: { fontSize: 16, fontWeight: '400' as const },
    caption: { fontSize: 12, fontWeight: '400' as const },
  },
  radius: { sm: 8, md: 12, lg: 16, full: 9999 },
} as const;
```

## Shared Package

`packages/shared` works natively in React Native — Metro bundler handles CJS imports without config. Import types, constants, and enums directly:

```typescript
import { SocketEvents, SessionMeta } from '@app/shared';
```

No bridge config needed (unlike Vite — see `react.md`).

## Platform-Specific Code

```typescript
// Use Platform.select for small differences
const padding = Platform.select({ ios: 44, android: 24, default: 16 });

// Use file extensions for large differences
// components/Header.ios.tsx
// components/Header.android.tsx
```

**Rules:**

- Prefer `Platform.select()` for 1-2 line differences
- Use file extensions (`.ios.tsx`, `.android.tsx`) for platform-specific component implementations
- Never use `Platform.OS === 'ios'` for styling — use `Platform.select()` instead
- Test on both platforms during development, not just before release

## Error Handling

- API errors caught in React Query `onError` or Axios interceptor
- Use a toast/snackbar library for transient error feedback
- Error boundary component for unexpected render crashes
- Handle network errors gracefully — show offline indicator
- Crash reporting via `expo-updates` error recovery or Sentry

## Testing

### Unit Tests (Jest + React Native Testing Library)

```typescript
import { render, fireEvent } from '@testing-library/react-native';
import { LoginScreen } from '../screens/LoginScreen';

test('shows error on invalid login', async () => {
  const { getByPlaceholderText, getByText, findByText } = render(<LoginScreen />);
  fireEvent.changeText(getByPlaceholderText('Email'), 'bad@test.com');
  fireEvent.changeText(getByPlaceholderText('Password'), 'wrong');
  fireEvent.press(getByText('Login'));
  expect(await findByText('Invalid credentials')).toBeTruthy();
});
```

### E2E Tests (Maestro)

Use **Maestro** for E2E testing — standalone CLI, no project dependencies, YAML-based flows:

```yaml
# e2e/login.yaml
appId: com.project.app
---
- launchApp
- tapOn: 'Email'
- inputText: 'test@example.com'
- tapOn: 'Password'
- inputText: 'Test1234!'
- tapOn: 'Login'
- assertVisible: 'Dashboard'
```

**Rules:**

- Jest + React Native Testing Library for unit/component tests (70% of test effort)
- Maestro for E2E tests (10% of test effort) — critical user flows only
- Test on both iOS simulator and Android emulator
- E2E flows: auth, main navigation, primary feature CRUD, offline behavior

## Build & Deploy (EAS)

```bash
# Development build
eas build --profile development --platform all

# Preview build (internal testing)
eas build --profile preview --platform all

# Production build
eas build --profile production --platform all

# OTA update
eas update --branch production --message "Bug fix description"
```

- Use EAS Build for all builds — never build locally in CI
- Use EAS Update for over-the-air JavaScript updates
- Use EAS Submit for App Store / Play Store submission
- Keep `app.json` / `app.config.ts` as the single source of truth for app metadata

## Rules Summary

- Use Expo managed workflow for all new projects; bare CLI only when config plugins cannot handle native modules
- Use native stack navigator (`@react-navigation/native-stack`) for performance
- Use conditional rendering for auth vs main flow — not imperative navigation
- Type navigation params with `RootStackParamList`; never nest more than 3 levels of navigators
- Use `AsyncStorage` for Zustand persistence, `expo-secure-store` for sensitive data (tokens, credentials)
- Use React Query for server state, Zustand for client-only state
- Never fetch data in `useEffect` — always use React Query hooks
- Set `networkMode: 'offlineFirst'` for offline-first UX; use `focusManager` and `onlineManager`
- Base URL from Expo config (`Constants.expoConfig?.extra?.apiUrl`) — not `import.meta.env`
- Use `StyleSheet.create()` for all styles — never inline style objects on components
- Centralize theme in `styles/theme.ts` — never hardcode colors or sizes in components
- Use `Platform.select()` for 1-2 line platform differences; file extensions for larger differences
- Never use `Platform.OS === 'ios'` for styling — use `Platform.select()` instead
- Test on both iOS simulator and Android emulator during development, not just before release
- Use `expo-font` for custom fonts — load in app entry before rendering
- Use Maestro for E2E tests — critical user flows only (auth, navigation, primary CRUD, offline)
- Use EAS Build for all builds — never build locally in CI
- Use EAS Update for over-the-air JavaScript updates
- Keep `app.json` / `app.config.ts` as the single source of truth for app metadata
