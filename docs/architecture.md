# Indolj Merchant POS — Technical Architecture & Coding Standards

## 1. Core Architectural Pillars

```
                               ┌───────────────────────────┐
                               │       RootNavigator       │
                               └─────────────┬─────────────┘
                                             │
                      ┌──────────────────────┴──────────────────────┐
                      │                                             │
           ┌──────────▼──────────┐                       ┌──────────▼──────────┐
           │  AuthStackWrapper   │                       │   AppStackWrapper   │
           │  (Unauthenticated)  │                       │    (Authenticated)  │
           └──────────┬──────────┘                       └──────────┬──────────┘
                      │                                             │
             ┌────────▼────────┐                           ┌────────▼────────┐
             │   LoginScreen   │                           │ DashboardScreen │
             └────────┬────────┘                           └────────┬────────┘
                      │                                             │
             ┌────────▼────────┐                           ┌────────▼────────┐
             │    LoginForm    │                           │  OrderGrid/UI   │
             └────────┬────────┘                           └────────┬────────┘
                      │                                             │
            ┌─────────▼─────────┐                         ┌─────────▼─────────┐
            │ useLoginContainer │                         │ useDashboardCont. │
            └───────────────────┘                         └───────────────────┘
```

---

## 2. Container Hook Pattern (UI & Logic Separation)

To maintain clean architecture and high testability, UI components and business/logical execution are strictly decoupled:

- **Presentation Layer (`src/components/` & `src/screens/`)**:
  - Contains JSX markup, layout, and styling.
  - Zero direct state management, validation logic, or API fetching inside UI components.
  - Consumes props provided by a dedicated container hook.

- **Logical Layer (`src/hooks/`)**:
  - Encapsulated inside custom container hooks (e.g. `useLoginContainer`).
  - Manages input state, validation rules, loading/error states, and handler triggers.

---

## 3. Navigation Stack Wrappers

Application routing is encapsulated into two main stack wrappers:

1. **`AuthStackWrapper`**:
   - Manages unauthenticated flow screens (`LoginScreen`, `ForgotPasswordScreen`).
2. **`AppStackWrapper`**:
   - Manages authenticated POS merchant screens (`DashboardScreen`, `OrdersScreen`, `InventoryScreen`).
3. **`RootNavigator`**:
   - State-driven navigator that conditionally switches between `AuthStackWrapper` and `AppStackWrapper` based on `AuthContext.isAuthenticated`.

---

## 4. Lean State & Data Architecture

- **HTTP Client**: Centralized Axios client (`src/api/client.ts`) with base URL configuration and Bearer token injection.
- **Service Layer**: Modular API services (`src/api/services/authService.ts`) executing contract calls and returning typed DTOs.
- **Global Client State**: `AuthContext` for session lifecycle and Zustand (`src/stores/`) for domain UI state.
- **Local Persistence**: `@react-native-async-storage/async-storage` for local token storage and state hydration.

---

## 5. Target File Hierarchy (`src/`)

```
src/
├── api/
│   ├── config/
│   │   └── routes.ts              # Base URL and frozen API route constants
│   ├── client.ts                  # Axios client wrapper with Bearer token injector
│   └── services/
│       ├── authService.ts         # Login API handler & 4-element response tuple parser
│       ├── branchService.ts       # Get-branch API parser (returns 3-element tuple & BranchMap)
│       └── widgetService.ts       # Query-param POST handler for all /widgets/* calls
├── types/
│   ├── auth.ts                    # Strict DTOs, UserProfile, Permission, & 4-element Tuple types
│   └── dashboard.ts               # Widget registry, Filters, Tables, Metrics, & Branch types
├── context/
│   └── AuthContext.tsx            # Global Auth State (Token, User, Permissions, `hasPermission`)
├── hooks/
│   ├── useLoginContainer.ts       # Login form state, validation rules, submission trigger
│   ├── useDashboardFilters.ts     # Date presets (Today, Yesterday, Week, Month) & Branch selection
│   └── useWidgetsData.ts          # Parallel fetching & reactive refetching engine for widgets
├── utils/
│   └── formatters.ts              # Safe parseNumber(), currency formatting, percentage formatting
├── components/
│   ├── common/
│   │   ├── CustomInput.tsx        # Accessible text input with error states
│   │   ├── CustomButton.tsx       # Reusable button with ActivityIndicator loading state
│   │   ├── Checkbox.tsx           # Controlled checkbox component
│   │   ├── MetricTile.tsx         # Reusable stat card (Gross, Net, Tax, Discounts, FOC)
│   │   └── DataTable.tsx          # Dynamic matrix table renderer (thead, tbody, total)
│   ├── auth/
│   │   └── LoginForm.tsx          # Controlled presentation form component
│   └── dashboard/
│       ├── DashboardHeader.tsx    # Cashier profile header ("app cashier") & date badge
│       ├── FilterBar.tsx          # Trigger bar for Branch Selector and Date Range Modals
│       ├── BranchSelectModal.tsx  # Bottom sheet modal for active branch selection
│       ├── DateRangeModal.tsx     # Bottom sheet modal for date range presets
│       └── widgets/
│           ├── SalesOverviewGrid.tsx   # Gross/Net Sales, Tax, Discounts tiles grid
│           ├── OrderInsightsCard.tsx   # Order breakdown & channel percentages
│           ├── SalesSummaryBar.tsx     # Hourly sales/orders visualization
│           └── SalesReportTable.tsx    # Tabular container for Sales/Items/Category/Orders
├── screens/
│   ├── LoginScreen.tsx            # Top-level authentication screen wrapper
│   └── DashboardScreen.tsx        # Main Dashboard view with Pull-to-Refresh & active widget grid
├── styles/
│   └── theme.ts                   # Centralized design tokens (palette, spacing, typography, radius)
└── navigation/
    ├── AuthStackWrapper.tsx       # Unauthenticated stack navigator
    ├── AppStackWrapper.tsx        # Authenticated stack navigator
    └── RootNavigator.tsx          # State-driven root navigator
```

---

## 6. Coding & Component Standards

- **Strict Typing**: Zero `any` types permitted. All props, state, and API contracts must be explicitly typed.
- **Styling Discipline**: Always use `StyleSheet.create()` or theme tokens from `src/styles/theme.ts`. Inline style objects are forbidden.
- **Component Primitives**: Reusable UI elements (`CustomInput`, `CustomButton`, `Checkbox`, `MetricTile`, `DataTable`) located in `src/components/common/`.
- **Matrix Cell Safety**: Always parse table cell matrix values using `parseNumber(val)` before arithmetic or display.

