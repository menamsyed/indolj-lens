# CONTEXT.md — Project Context & Architecture Master Record

## Project Overview & Objectives

**IndoljMerchantApp** is a React Native mobile application designed for merchant management, order processing, and store operations within the Indolj platform ecosystem. 

The primary objectives of this codebase are:
- Provide merchants with a fast, reliable mobile interface for managing incoming orders, menus/inventory, and store status.
- Ensure high performance and smooth UI response times across both Android and iOS devices.
- Establish a clean, maintainable, modular codebase following best practices for React Native, TypeScript, and modern mobile app architecture.

> **Detailed Specification Records**:
> - 📄 **Application Scope & Vision**: [docs/app-scope.md](file:///Users/macbook/indolj-space%20/IndoljMerchantApp/docs/app-scope.md)
> - 📄 **Authentication Specification**: [docs/auth.md](file:///Users/macbook/indolj-space%20/IndoljMerchantApp/docs/auth.md)
> - 📄 **Branch Settings & Dynamic Widget APIs**: [docs/branch-and-widgets.md](file:///Users/macbook/indolj-space%20/IndoljMerchantApp/docs/branch-and-widgets.md)
> - 📄 **Dashboard API Integration Deep Dive**: [docs/dashboard-api-integration-deep-dive.md](file:///Users/macbook/indolj-space%20/IndoljMerchantApp/docs/dashboard-api-integration-deep-dive.md)
> - 📄 **Technical Architecture & Coding Standards**: [docs/architecture.md](file:///Users/macbook/indolj-space%20/IndoljMerchantApp/docs/architecture.md)
> - 📄 **Phased Implementation Roadmap**: [docs/phased-roadmap.md](file:///Users/macbook/indolj-space%20/IndoljMerchantApp/docs/phased-roadmap.md)

---

## System Architecture & Tech Stack

### Technology Stack
- **Framework**: [React Native](https://reactnative.dev) `0.86.2` (Bare Workflow / React Native CLI)
- **Runtime**: React `19.2.3` with New Architecture / Hermes JS engine support
- **Language**: [TypeScript](https://www.typescriptlang.org/) `5.8.3` (Strict mode)
- **UI & Layout**: Native components, `react-native-safe-area-context` (`^5.5.2`)
- **Native Platforms**: 
  - **Android**: Gradle `8.x`, Kotlin `1.9+`, Hermes enabled
  - **iOS**: CocoaPods, Swift `5+`, Ruby Gemfile setup (`CocoaPods 1.15.2`)
- **Testing**: Jest `29.6.3`, `react-test-renderer` `19.2.3`, `@types/jest`

### Architectural Pattern
- **Component-Driven Modular Architecture**: Clean separation between presentation components, state stores, custom hooks, and service layers.
- **Unidirectional Data Flow**: State updates flow predictably via domain stores (e.g. Zustand) and React Query for server synchronization.
- **Layered Structure**:
  1. **Presentation Layer**: Screens, UI Primitives (`components/ui`), Layout wrappers.
  2. **Domain/State Layer**: Custom hooks, state stores (`stores/`), state selectors.
  3. **Data Layer**: API service abstractions, storage wrappers (`AsyncStorage` / `SecureStore`).
  4. **Native Layer**: Platform-specific bridges (`android/`, `ios/`).

---

## Directory Structure

```
IndoljMerchantApp/
├── .antigravity/                # Architectural & coding standard rulesets
├── docs/                        # Domain & architecture specification records
│   ├── app-scope.md             # Product vision, personas, and module capabilities
│   ├── auth.md                  # Auth API contract, DTOs, 4-element tuple response
│   ├── branch-and-widgets.md    # Branch Settings & Dynamic Widget APIs
│   ├── dashboard-api-integration-deep-dive.md # Master API integration & call flow guide
│   ├── architecture.md          # Container pattern, Stack wrappers, state design
│   └── phased-roadmap.md        # 3-phase implementation roadmap
├── src/                         # Target application source tree
│   ├── api/                     # Axios client, routes config, widget & auth services
│   ├── components/              # Presentation UI components & POS widget cards
│   ├── context/                 # AuthContext session provider
│   ├── hooks/                   # Container hooks (useWidgetsData)
│   ├── navigation/              # AuthStackWrapper, AppStackWrapper, RootNavigator
│   ├── screens/                 # Screen wrappers (DashboardScreen, LoginScreen)
│   ├── styles/                  # Centralized design tokens & typography
│   └── types/                   # TypeScript interfaces & DTO contracts
├── __tests__/                   # Jest unit & integration tests
├── android/                     # Android native project files & Gradle configuration
├── ios/                         # iOS native project files & Xcode workspace
├── CONTEXT.md                   # Project context master record
├── App.tsx                      # Primary React component entry point
├── package.json                 # Node dependencies, scripts, and target engines
└── tsconfig.json                # TypeScript compilation options
```

---

## Key Technical Decisions & Conventions

### 1. Code Style & TypeScript Standards
- **Strict Typing**: No `any` types permitted. All props, state, navigation parameters, and API responses must have explicit interfaces or type aliases.
- **Container Pattern (UI & Logic Separation)**: Keep UI presentation and logical implementation separate.
- **Component Styling**: Always use `StyleSheet.create()` or centralized design tokens (`styles/theme.ts`). Inline style objects are forbidden.

### 2. State Management & Data Fetching (Lean Architecture)
- **API Data Fetching**: Standard **Axios** client wrapper with modular API services (`widgetService.ts`, `branchService.ts`, `authService.ts`) and container hooks (`useWidgetsData.ts`).
- **Global Auth & Client State**: **AuthContext** for session lifecycle and **AsyncStorage** for persistent local session storage.

---

## Development & Build Workflows

### Local Development Commands
| Action | Command |
| --- | --- |
| **Start Metro Bundler** | `yarn start` |
| **Run Android App** | `yarn android` |
| **Run iOS App** | `yarn ios` |
| **Run Unit Tests** | `yarn test` |
| **Run Linter** | `yarn lint` |

---

## Current Roadmap / Next Steps

### Phase 1: Foundation & Project Structure (Complete)
- [x] Initial React Native CLI bootstrap (v0.86.2 / React 19)
- [x] Establish root project context (`CONTEXT.md`) and AI rules (`.antigravityrules`)
- [x] Central design system and theme (`src/styles/colors.ts`, `src/styles/typography.ts`)
- [x] POS Dashboard UI components and vector icons system

### Phase 2: Navigation, Auth & POS Dashboard (Complete)
- [x] Configure Auth Context & 4-element login tuple persistence
- [x] Build POS Dashboard with 11 responsive widgets matching legacy app design
- [x] Live backend API integration (`branchService.ts`, `widgetService.ts`, `useWidgetsData.ts`)

### Phase 3: Order Management & Push Notifications
- [ ] Real-time incoming order alerts & sound notifications
- [ ] Order status acceptance & fulfillment dispatch flow
