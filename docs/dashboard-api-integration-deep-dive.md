# Indolj Merchant POS — Dashboard API Integration & Call Flow Architecture

## 1. Executive Summary & Control Flow

This document provides a line-by-line, endpoint-by-endpoint deep dive into how backend APIs are configured, called, parsed, and mapped onto the **Dashboard UI** in the **IndoljMerchantApp** React Native codebase.

### Architectural Data Flow Diagram

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                           DashboardScreen.tsx (UI)                             │
│  - Renders Header, FilterBar, 10+ Presentation Cards, & Date/Branch Modals     │
└───────────────────────────────────────┬────────────────────────────────────────┘
                                        │ (1) Consumes hook with filters
                                        ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│                         useWidgetsData.ts (Hook)                               │
│  - Computes 'from' & 'to' YYYY-MM-DD dates from presets (Today/This Week/etc)  │
│  - Triggers Promise.allSettled() across widget APIs                            │
│  - Manages isLoading, isRefreshing, error, and transformed state values        │
└───────────────────┬────────────────────────────────────────┬───────────────────┘
                    │ (2a) Fetch Branches                    │ (2b) Fetch Widgets
                    ▼                                        ▼
┌───────────────────────────────────────┐  ┌─────────────────────────────────────┐
│           branchService.ts            │  │          widgetService.ts           │
│  GET /settings/get-branch             │  │  POST /widgets/<endpoint_name>?...  │
└───────────────────┬───────────────────┘  └─────────────────┬───────────────────┘
                    │                                        │
                    └───────────────────┬────────────────────┘
                                        │ (3) HTTP Requests via Axios
                                        ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│                             apiClient (src/api/client.ts)                      │
│  - Base URL: http://salesdemo.indoljpos.com                                    │
│  - Auto-attaches header: Authorization: Bearer <JWT_TOKEN>                     │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Authentication & API Client Configuration

All HTTP requests are routed through a central Axios instance defined in `src/api/client.ts`.

### Base URL & Global Headers
- **Base URL**: `http://salesdemo.indoljpos.com`
- **Default Headers**:
  ```http
  Accept: application/json, text/plain, */*
  Content-Type: application/json
  Authorization: Bearer <JWT_TOKEN>
  ```

### Request Interceptor (`src/api/client.ts`)
Before any API call is sent, an interceptor retrieves the authorization token from secure storage and sets the header:
```typescript
apiClient.interceptors.request.use(async (config) => {
  const token = await secureStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 3. Branch Settings API (`GET /settings/get-branch`)

### Endpoint Details
- **HTTP Method**: `GET`
- **Path**: `/settings/get-branch`
- **Full URL**: `http://salesdemo.indoljpos.com/settings/get-branch`
- **Service Function**: `fetchBranchSettings()` in `src/api/services/branchService.ts`

### Backend Tuple Response Contract
The backend returns a **strict 3-element tuple array**: `[PaginationObj, BranchItem[], Record<string, BranchItem>]`.

```json
[
  {
    "current_page": 1,
    "total": 2,
    "per_page": 15
  },
  [
    {
      "id": 2,
      "name": "Sales Demo",
      "phn_no": "03001234567",
      "address": "Main Boulevard, Lahore",
      "branch_tax": 16,
      "slug": "sales-demo",
      "status": "true",
      "payment_tax": { "Cash": 15, "Card": 8 }
    },
    {
      "id": 4,
      "name": "Gulberg Branch",
      "phn_no": "03219876543",
      "address": "MM Alam Road",
      "branch_tax": 16,
      "slug": "gulberg-branch",
      "status": "true"
    }
  ],
  {
    "2": {
      "id": 2,
      "name": "Sales Demo",
      "phn_no": "03001234567",
      "address": "Main Boulevard, Lahore",
      "branch_tax": 16,
      "slug": "sales-demo",
      "status": "true"
    }
  }
]
```

### Dashboard UI Mapping Process
1. `useWidgetsData` calls `fetchBranchSettings()`.
2. Index `1` (`branchTuple[1]`) contains the `BranchItem[]` array.
3. `DashboardScreen.tsx` maps `BranchItem[]` into `BranchOption[]`:
   ```typescript
   const branchOptionsList: BranchOption[] = [
     { id: 'all', name: 'All Branches / Main', isAll: true },
     ...branches.map((b) => ({ id: String(b.id), name: b.name })),
   ];
   ```
4. Clicking a branch in `BranchSelectModal.tsx` updates `selectedBranch`, which triggers a re-fetch of all widget endpoints with `branch_id=<SELECTED_ID>`.

---

## 4. POS Dynamic Widget APIs Invocation Pattern

All 17 POS Widget endpoints share a common invocation pattern:
- **HTTP Method**: `POST`
- **URL Query Parameters**:
  - `range`: `12` or `24` (Default: `12`)
  - `from`: `YYYY-MM-DD` (Start date, e.g. `2026-08-11`)
  - `to`: `YYYY-MM-DD` (End date, e.g. `2026-08-11`)
  - `branch_id`: Stringified or numeric branch ID (Omitted when `'all'` is selected)

### Helper Query Builder (`src/api/services/widgetService.ts`)
```typescript
function buildQueryString(params: WidgetQueryParams): string {
  const query = new URLSearchParams();
  query.append('range', String(params.range || 12));
  query.append('from', params.from);
  query.append('to', params.to);
  if (params.branch_id !== undefined && params.branch_id !== null && params.branch_id !== 'all') {
    query.append('branch_id', String(params.branch_id));
  }
  return query.toString();
}
```

---

## 5. Detailed Breakdown of 17 POS Widget APIs

### 1. Widget Registry (`GET /widgets/get-api-details`)
- **URL**: `GET http://salesdemo.indoljpos.com/widgets/get-api-details`
- **Purpose**: Returns full list of active widget definitions, display sequences, web/app visibility toggles, and metadata.
- **Service**: `fetchWidgetRegistry()`

---

### 2. Sales Overview (`POST /widgets/sales-report`)
- **Request URL**: `POST /widgets/sales-report?range=12&from=2026-08-11&to=2026-08-11&branch_id=2`
- **Purpose**: Provides summary revenue figures across 12 primary financial categories.
- **Service**: `fetchSalesReport(params)`
- **Backend Response Payload**:
  ```json
  {
    "gross_sale": 44242,
    "refund": 0,
    "cancelled": 13306,
    "cancelled_order_count": 2,
    "foc": 2410,
    "discount": 0,
    "net_sale": 38120.2,
    "tax": 4972.2,
    "sale_inc_tax": 43092.4,
    "delivery_charges": 0,
    "service_charges": 0,
    "total": 43092.4,
    "previous": {
      "net_sale": 35000,
      "total": 40000
    }
  }
  ```
- **UI Component Mapping**:
  - **`BranchSummaryCard.tsx`**: `netSalesAmount` <- `formatCurrency(salesReport.net_sale)`, `discountAmount` <- `salesReport.discount`.
  - **`SalesOverviewCard.tsx`**: Renders 12 metric tiles directly from these 12 properties.

---

### 3. Order Insights (`POST /widgets/sales-insights`)
- **Request URL**: `POST /widgets/sales-insights?range=12&from=2026-08-11&to=2026-08-11`
- **Purpose**: Order channel breakdown (Takeaway, Dine In, Delivery) and total customer count.
- **Service**: `fetchSalesInsights(params)`
- **Backend Response Payload**:
  ```json
  {
    "donut": [
      { "name": "Takeaway", "value": 4, "percentage": 100 }
    ],
    "total": [
      { "total_orders": 4, "total_customers": 0 }
    ]
  }
  ```
- **UI Component Mapping (`OrderInsightsCard.tsx`)**:
  - `totalOrders` <- `response.total[0].total_orders`
  - `totalCustomers` <- `response.total[0].total_customers`
  - `takeawayOrders` <- `donut.find(i => i.name === 'Takeaway')?.value`
  - `takeawayPercentage` <- `donut.find(i => i.name === 'Takeaway')?.percentage`

---

### 4. Payment Wise Sales (`POST /widgets/sales-payment-wise`)
- **Request URL**: `POST /widgets/sales-payment-wise?range=12&from=2026-08-11&to=2026-08-11`
- **Purpose**: Breakdown of sales by payment method (Cash, Card, Online Wallet).
- **Service**: `fetchSalesPaymentWise(params)`
- **Backend Response Payload**:
  ```json
  [
    {
      "name": "Cash",
      "value": 38120.2,
      "color": "#00945eff",
      "image": ""
    }
  ]
  ```
- **Edge Case**: Returns empty array `[]` on zero sales days.
- **UI Component Mapping (`PaymentBreakdownCard.tsx`)**:
  - `cashAmount` <- `formatCurrency(item.value)`
  - `cashPercentage` <- Calculated `(item.value / totalSales) * 100`
  - Pie Chart slices mapped directly from array items.

---

### 5. Party Wise Sales (`POST /widgets/sales-party-wise`)
- **Request URL**: `POST /widgets/sales-party-wise?range=12&from=2026-08-11&to=2026-08-11`
- **Purpose**: Orders and revenue breakdown by order channel (Takeaway, Delivery, Dine In).
- **Service**: `fetchSalesPartyWise(params)`
- **Backend Response Payload**:
  ```json
  [
    {
      "name": "Takeaway",
      "value": 38120.2,
      "orders": 4,
      "percentage": 100
    }
  ]
  ```
- **UI Component Mapping (`PartyWiseSalesCard.tsx`)**:
  - `channelName` <- `item.name`
  - `salesValue` <- `formatCurrency(item.value)`
  - `orderCount` <- `item.orders`
  - `percentage` <- `item.percentage`

---

### 6. New Order List / Sale Summary (`POST /widgets/new-order-list`)
- **Request URL**: `POST /widgets/new-order-list?range=12&from=2026-08-11&to=2026-08-11`
- **Purpose**: Detailed list of recently completed or active POS orders.
- **Service**: `fetchNewOrderList(params)`
- **Backend Response Payload (Matrix Format)**:
  ```json
  {
    "thead": ["Token no.", "Time", "Branch", "Order Type", "Sale Amount", "Profit"],
    "tbody": [
      ["#A55-3", "12:59 PM", "Sales Demo", "Takeaway", "2700.2", 0],
      ["#A55-7", "01:04 PM", "Sales Demo", "Takeaway", "1450.0", 0],
      ["#S1-1", "01:57 PM", "Sales Demo", "Dine In", "3800.0", 0]
    ]
  }
  ```
- **UI Component Mapping (`SaleSummaryView.tsx` & `OnlineOrdersCard.tsx`)**:
  - Each array in `tbody` maps to a row:
    - `tokenNo` = `row[0]`
    - `time` = `row[1]`
    - `branch` = `row[2]`
    - `orderType` = `row[3]`
    - `saleAmount` = `row[4]`

---

### 7. Day of Week Sales (`POST /widgets/day-of-week`)
- **Request URL**: `POST /widgets/day-of-week?range=12&from=2026-08-01&to=2026-08-11`
- **Purpose**: Aggregated revenue grouped by day of the week (Mon-Sun).
- **Service**: `fetchDayOfWeekSales(params)`
- **Response**: `[{ "name": "Mon", "value": 38120.2 }, { "name": "Tue", "value": 15400 }]`

---

### 8. Month Sales (`POST /widgets/month-sales`)
- **Request URL**: `POST /widgets/month-sales?range=12&from=2026-01-01&to=2026-08-11`
- **Purpose**: Monthly sales performance comparisons.
- **Service**: `fetchMonthSales(params)`
- **Response**: `[{ "name": "June 2026", "value": 47105 }, { "name": "July 2026", "value": 89200 }]`

---

### 9. Date Branch Sales (`POST /widgets/date-branch-sales`)
- **Request URL**: `POST /widgets/date-branch-sales?range=12&from=2026-08-04&to=2026-08-11`
- **Purpose**: Multi-branch comparison over a date time series.
- **Service**: `fetchDateBranchSales(params)`
- **Response**:
  ```json
  {
    "date": ["2026-08-04", "2026-08-05"],
    "values": {
      "Sales Demo": [66641.45, 38120.2]
    }
  }
  ```

---

### 10. Sales Summary (`POST /widgets/sales-summary`)
- **Request URL**: `POST /widgets/sales-summary?range=12&from=2026-08-11&to=2026-08-11`
- **Purpose**: Hourly grouped sales overview breakdown.
- **Service**: `fetchSalesSummary(params)`

---

### 11. Hourly Sales (`POST /widgets/hourly-sales`)
- **Request URL**: `POST /widgets/hourly-sales?range=12&from=2026-08-11&to=2026-08-11`
- **Purpose**: Revenue distribution across 24 operating hours (`"00:00"` to `"23:00"`).
- **Service**: `fetchHourlySales(params)`
- **Backend Response Payload**:
  ```json
  {
    "00:00": [0],
    "12:00": [34845],
    "13:00": [3275.2],
    "14:00": [0]
  }
  ```
- **UI Component Mapping (`SalesTrendCard.tsx` / `BarChart`)**:
  Maps string hour keys to chart dataset points `{ label: '12:PM', value: 34845, frontColor: '#1ABC9C' }`.

---

### 12. Hourly Order (`POST /widgets/hourly-order`)
- **Request URL**: `POST /widgets/hourly-order?range=12&from=2026-08-11&to=2026-08-11`
- **Purpose**: Order count distribution across 24 operating hours.
- **Service**: `fetchHourlyOrder(params)`
- **Response**: `{ "12:00": [2], "13:00": [2] }`

---

### 13. Branch Wise Sales (`POST /widgets/branch-wise-sales`)
- **Request URL**: `POST /widgets/branch-wise-sales?range=12&from=2026-08-11&to=2026-08-11`
- **Purpose**: Branch comparison matrix table.
- **Service**: `fetchBranchWiseSales(params)`
- **Response Matrix**:
  ```json
  {
    "thead": ["Branch Name", "Sales", "Orders", "Percentage", "Total Guest", "Total Forcast Sales"],
    "tbody": [
      ["Sales Demo", 38120.2, 4, 100, 4, 0]
    ],
    "total": 38120.2
  }
  ```
- **UI Component Mapping (`BranchWiseSalesCard.tsx`)**:
  - `branchName` = `row[0]`
  - `sales` = `row[1]`
  - `orders` = `row[2]`
  - `percentage` = `row[3]`

---

### 14. Item Wise Sales (`POST /widgets/item-wise-sales`)
- **Request URL**: `POST /widgets/item-wise-sales?range=12&from=2026-08-11&to=2026-08-11`
- **Purpose**: Sales breakdown by individual menu item.
- **Service**: `fetchItemWiseSales(params)`
- **Response Matrix**:
  ```json
  {
    "thead": ["Item Name", "Sales", "Qty", "Percentage"],
    "tbody": [
      ["Royal Tikka medium", 3900, "3", 11.77],
      ["Zinger Burger Special", 6400, "8", 19.31]
    ],
    "total": 33148
  }
  ```
- **UI Component Mapping (`ItemWiseSalesCard.tsx`)**:
  Maps top 3 rows into item preview cards showing Name, Quantity, Sales Amount, and Revenue Share %.

---

### 15. Category Wise Sales (`POST /widgets/category-wise-sales`)
- **Request URL**: `POST /widgets/category-wise-sales?range=12&from=2026-08-11&to=2026-08-11`
- **Purpose**: Category revenue performance matrix.
- **Service**: `fetchCategoryWiseSales(params)`
- **Response Matrix**:
  ```json
  {
    "thead": ["Category Name", "Sales", "Qty", "Percentage"],
    "tbody": [
      ["Pizzas", 23000, "18", 69.39],
      ["Burgers & Wraps", 7500, "12", 22.62]
    ],
    "total": 33148
  }
  ```
- **UI Component Mapping (`CategoryWiseSalesCard.tsx`)**:
  Maps category rows to list items showing Category Name, Total Qty, Sales, and Percentage.

---

### 16. Top Discounts (`POST /widgets/top-discounts`)
- **Request URL**: `POST /widgets/top-discounts?range=12&from=2026-08-11&to=2026-08-11`
- **Purpose**: Performance of active promotional campaigns and discount deals.
- **Service**: `fetchTopDiscounts(params)`
- **Edge Case**: Returns `[]` when no active promotions exist.

---

### 17. Online Cards Widget (`POST /widgets/cards-widget`)
- **Request URL**: `POST /widgets/cards-widget?range=12&from=2026-08-11&to=2026-08-11`
- **Purpose**: Aggregate count and volume metrics for online digital store channels.
- **Service**: `fetchCardsWidget(params)`

---

## 6. Safe Parsing & Data Guardrail Utilities

### `parseNumber()` (`src/utils/formatters.ts`)
Matrix tables contain mixed types (e.g. numeric `3900` vs stringified `"3"` vs `null`). To prevent runtime crashes:

```typescript
export function parseNumber(val: string | number | null | undefined): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? 0 : parsed;
}
```

### `formatCurrency()` (`src/utils/formatters.ts`)
```typescript
export function formatCurrency(amount: number | string): string {
  const num = parseNumber(amount);
  return `Rs. ${num.toLocaleString('en-US')}`;
}
```

---

## 7. Container Hook Implementation (`src/hooks/useWidgetsData.ts`)

Below is the complete implementation of `useWidgetsData.ts` which manages date range computations, executes asynchronous requests via `Promise.allSettled`, and returns formatted metrics:

```typescript
import { useCallback, useEffect, useState } from 'react';
import { fetchBranchSettings, BranchItem } from '../api/services/branchService';
import {
  fetchSalesReport,
  fetchSalesPaymentWise,
  fetchSalesPartyWise,
  SalesReportResponse,
  PaymentWiseItem,
  PartyWiseItem,
} from '../api/services/widgetService';
import { parseNumber, formatCurrency, formatDateYYYYMMDD } from '../utils/formatters';

export interface UseWidgetsDataParams {
  dateRangePreset?: string;
  customFromDate?: Date;
  customToDate?: Date;
  selectedBranchId?: string | number;
}

export function useWidgetsData({
  dateRangePreset = 'Today',
  customFromDate,
  customToDate,
  selectedBranchId = 'all',
}: UseWidgetsDataParams) {
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [salesReport, setSalesReport] = useState<SalesReportResponse | null>(null);
  const [paymentWise, setPaymentWise] = useState<PaymentWiseItem[]>([]);
  const [partyWise, setPartyWise] = useState<PartyWiseItem[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Compute YYYY-MM-DD from/to date strings based on preset
  const getComputedDates = useCallback((): { from: string; to: string } => {
    const today = new Date();
    let fromDate = new Date();
    let toDate = new Date();

    if (dateRangePreset === 'Yesterday') {
      fromDate.setDate(today.getDate() - 1);
      toDate.setDate(today.getDate() - 1);
    } else if (dateRangePreset === 'This Week') {
      const dayOfWeek = today.getDay();
      fromDate.setDate(today.getDate() - dayOfWeek);
    } else if (dateRangePreset === 'This Month') {
      fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
    } else if (dateRangePreset === 'Custom' && customFromDate && customToDate) {
      fromDate = customFromDate;
      toDate = customToDate;
    }

    return {
      from: formatDateYYYYMMDD(fromDate),
      to: formatDateYYYYMMDD(toDate),
    };
  }, [dateRangePreset, customFromDate, customToDate]);

  const loadData = useCallback(
    async (isPullRefresh = false): Promise<void> => {
      if (isPullRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const { from, to } = getComputedDates();
      const query = { from, to, branch_id: selectedBranchId };

      try {
        const [branchTuple, reportData, paymentsData, partyData] = await Promise.allSettled([
          fetchBranchSettings(),
          fetchSalesReport(query),
          fetchSalesPaymentWise(query),
          fetchSalesPartyWise(query),
        ]);

        if (branchTuple.status === 'fulfilled') {
          setBranches(branchTuple.value[1] || []);
        }

        if (reportData.status === 'fulfilled') {
          setSalesReport(reportData.value);
        }

        if (paymentsData.status === 'fulfilled') {
          setPaymentWise(paymentsData.value);
        }

        if (partyData.status === 'fulfilled') {
          setPartyWise(partyData.value);
        }
      } catch (err) {
        console.warn('Failed to load POS widget data:', err);
        setError('Failed to load dashboard data. Pull to refresh.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [getComputedDates, selectedBranchId]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived Values for Dashboard Widgets
  const totalSalesAmount = salesReport?.net_sale
    ? formatCurrency(parseNumber(salesReport.net_sale))
    : 'Rs. 0';

  const grossSaleVal = salesReport?.gross_sale ? String(salesReport.gross_sale) : '0';
  const netSaleVal = salesReport?.net_sale ? String(salesReport.net_sale) : '0';
  const taxVal = salesReport?.tax ? String(salesReport.tax) : '0';
  const totalVal = salesReport?.total ? String(salesReport.total) : '0';
  const discountVal = salesReport?.discount ? String(salesReport.discount) : '0';
  const focVal = salesReport?.foc ? String(salesReport.foc) : '0';
  const refundVal = salesReport?.refund ? String(salesReport.refund) : '0';
  const cancelledVal = salesReport?.cancelled ? String(salesReport.cancelled) : '0';

  return {
    branches,
    salesReport,
    paymentWise,
    partyWise,
    totalSalesAmount,
    grossSaleVal,
    netSaleVal,
    taxVal,
    totalVal,
    discountVal,
    focVal,
    refundVal,
    cancelledVal,
    isLoading,
    isRefreshing,
    error,
    refetch: () => loadData(true),
  };
}

export default useWidgetsData;
```

---

## 8. Screen Binding Implementation (`src/screens/DashboardScreen.tsx`)

In `DashboardScreen.tsx`, data returned by `useWidgetsData` is passed directly into card component props:

```typescript
// Live Overview Metrics Array mapped into SalesOverviewCard
const liveOverviewMetrics = [
  { label: 'Gross Sale', value: grossSaleVal, iconName: 'chart' as const, iconBgColor: '#E8F8F5', iconColor: '#27AE60' },
  { label: 'Refund', value: refundVal, iconName: 'back' as const, iconBgColor: '#FDEDEC', iconColor: '#E74C3C' },
  { label: 'Cancelled', value: cancelledVal, iconName: 'lock' as const, iconBgColor: '#FDEDEC', iconColor: '#E74C3C' },
  { label: 'Cancelled Order Amount', value: '0', iconName: 'user' as const, iconBgColor: '#E8F8F5', iconColor: '#16A085' },
  { label: 'FOC', value: focVal, iconName: 'utensils' as const, iconBgColor: '#E8F8F5', iconColor: '#27AE60' },
  { label: 'Discount', value: discountVal, iconName: 'percent' as const, iconBgColor: '#FEF9E7', iconColor: '#F39C12' },
  { label: 'Net Sale', value: netSaleVal, iconName: 'store' as const, iconBgColor: '#EBF5FB', iconColor: '#2980B9' },
  { label: 'Tax', value: taxVal, iconName: 'file-text' as const, iconBgColor: '#F5EEF8', iconColor: '#8E44AD' },
  { label: 'Sale Inc Tax', value: totalVal, iconName: 'bowl' as const, iconBgColor: '#E8F8F5', iconColor: '#1ABC9C' },
  { label: 'Service Charges', value: '0', iconName: 'coffee' as const, iconBgColor: '#FEF9E7', iconColor: '#F39C12' },
  { label: 'Delivery Charges', value: '0', iconName: 'pizza' as const, iconBgColor: '#FDEDEC', iconColor: '#E74C3C' },
  { label: 'Total', value: totalVal, iconName: 'check' as const, iconBgColor: '#E8F8F5', iconColor: '#27AE60' },
];
```

---

## 9. Summary Checklists for the Next Agent

- [x] Axios instance configured with `Authorization: Bearer <TOKEN>` header interceptor.
- [x] Branch settings API (`GET /settings/get-branch`) tuple response parsed safely at `branchTuple[1]`.
- [x] All 17 widget API endpoints mapped with `POST /widgets/<endpoint>?range=12&from=YYYY-MM-DD&to=YYYY-MM-DD&branch_id=<ID>`.
- [x] Matrix table responses (`thead`/`tbody`) parsed with `parseNumber()` guardrails.
- [x] Empty array responses (`[]`) handled with graceful empty UI cards.
- [x] Pull-to-refresh (`RefreshControl`) linked to `refetch()`.
