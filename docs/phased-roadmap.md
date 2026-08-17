# Indolj Merchant POS — Phased Implementation Roadmap

This document outlines the 3-phase execution roadmap for building the Indolj Merchant POS React Native application.

---

## Phase 1: Knowledge Grounding & Documentation (Completed)

### Objective
Document application vision, define architectural rules, establish domain specifications, and structure reference markdown documentation in the project repository.

### Deliverables
- [x] Application Scope & Vision ([docs/app-scope.md](file:///Users/macbook/indolj-space%20/IndoljMerchantApp/docs/app-scope.md))
- [x] Authentication Specification ([docs/auth.md](file:///Users/macbook/indolj-space%20/IndoljMerchantApp/docs/auth.md))
- [x] Technical Architecture & Coding Standards ([docs/architecture.md](file:///Users/macbook/indolj-space%20/IndoljMerchantApp/docs/architecture.md))
- [x] Phased Implementation Roadmap ([docs/phased-roadmap.md](file:///Users/macbook/indolj-space%20/IndoljMerchantApp/docs/phased-roadmap.md))
- [x] Project Master Record ([CONTEXT.md](file:///Users/macbook/indolj-space%20/IndoljMerchantApp/CONTEXT.md))
- [x] AI Operational Rules ([.antigravityrules](file:///Users/macbook/indolj-space%20/IndoljMerchantApp/.antigravityrules))

---

## Phase 2: UI Alpha Implementation (Next Step)

### Objective
Build the complete frontend UI component library, theme tokens, container hooks, screen layouts, and stack navigation wrappers using clean mock state.

### Key Milestones
1. **Design System & Theme (`src/styles/theme.ts`)**:
   - Palette (brand, surface, text, alerts), typography, spacing, and radius tokens.

2. **Shared UI Primitives (`src/components/common/`)**:
   - `CustomInput`: Accessible text input with label, error states, and secure text toggle.
   - `CustomButton`: Interactive button with loading indicators and active opacity.
   - `Checkbox`: Controlled checkbox toggle for parameters (`remember_me`).

3. **Container Hook Pattern (`src/hooks/`)**:
   - `useLoginContainer`: Container hook managing form inputs, validation rules, error banners, and mock submission.

4. **Screen Layouts (`src/screens/` & `src/components/auth/`)**:
   - `LoginForm`: Presentation component consuming `useLoginContainer`.
   - `LoginScreen`: Full screen layout with safe area, keyboard handling, and branded header.

5. **Stack Navigation Wrappers (`src/navigation/`)**:
   - `AuthStackWrapper`: Unauthenticated stack navigator for Login flow.
   - `AppStackWrapper`: Authenticated stack navigator for POS operations.
   - `RootNavigator`: State-driven navigator switching between Auth and App stacks.

---

## Phase 3: Beta Integration (Final Step)

### Objective
Wire live backend API contracts, state persistence, error handling, and end-to-end POS operational flows.

### Key Milestones
1. **Axios Client & Auth Service (`src/api/`)**:
   - Base URL configuration (`http://salesdemo.indoljpos.com`) and routes definition in `src/api/config/routes.ts`.
   - Central Axios client wrapper (`src/api/client.ts`).
   - `authService.ts` executing `loginUser` contract returning 4-tuple array `[AuthToken, UserProfile, number, string[]]`.

2. **Global Auth Context & Local Storage (`src/context/AuthContext.tsx`)**:
   - Authentication provider with local session persistence via `@react-native-async-storage/async-storage`.
   - Granular permission check helper `hasPermission(name)`.

3. **Testing & QA Verification**:
   - Jest unit tests for hooks, components, and services (`yarn test`).
   - ESLint static analysis (`yarn lint`).
