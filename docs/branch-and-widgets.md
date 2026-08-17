# Indolj Merchant POS — Branch Settings & Dynamic Widget APIs Specification

## 1. Overview

This document specifies the exact API contracts, tuple response structures, and payload handling for **Branch Management** and **Dynamic POS Dashboard Widgets** on the Indolj Merchant POS platform.

- **Base URL**: `http://salesdemo.indoljpos.com`
- **Global Headers**:
  ```http
  Accept: application/json, text/plain, */*
  Authorization: Bearer <TOKEN>
  Content-Type: application/json
  ```

---

## 2. Branch Settings API Contract

### `GET /settings/get-branch`

Returns a **Strict 3-Element Tuple Array**: `[PaginationObj, Branch[], Record<string, Branch>]`

```typescript
// Element 0: Pagination Object
export interface BranchPagination {
  current_page: number;
  total: number;
  per_page: number;
  [key: string]: unknown;
}

// Element 1: Branch Item Model
export interface Branch {
  id: number;
  name: string;
  phn_no: string;
  address: string | null;
  branch_tax: number;
  slug: string;
  status: string; // e.g. "true"
  payment_tax: Record<string, number>; // e.g. { "Cash": 15, "Card": 8 }
}

// Element 2: Branch Dictionary Keyed by Stringified Branch ID ("1", "2", "4", "8", "10", "11", "12")
export type BranchMap = Record<string, Branch>;

// Tuple Definition
export type BranchSettingsTuple = [
  BranchPagination,
  Branch[],
  BranchMap
];
```

---

## 3. Dynamic POS Widget APIs (Invocation Pattern)

All POS Widget endpoints are invoked via **POST** with URL query parameters:
- `range`: `12` or `24`
- `from`: `YYYY-MM-DD` (e.g. `2026-08-10`)
- `to`: `YYYY-MM-DD` (e.g. `2026-08-10`)
- `branch_id`: Optional stringified or numeric Branch ID filter.

Example Request URL:
```http
POST /widgets/sales-report?range=12&from=2026-08-10&to=2026-08-10&branch_id=2
```

---

## 4. 17 POS Widget Endpoint Specifications

### 1. Widget Registry (`GET /widgets/get-api-details`)
Returns widget registry definitions containing endpoints, web/app display types, sequences, headings, and parameter schemas.

### 2. Sales Overview (`POST /widgets/sales-report`)
Returns sales summary metrics: Gross Sale, Refund, Cancelled, Cancelled Order Count, FOC, Discount, Net Sale, Tax, Sale Inc Tax, Delivery Charges, Service Charges, and Total. Includes `previous` metrics array for period comparison.

### 3. Order Insights (`POST /widgets/sales-insights`)
Returns `{ "donut": [...], "total": [...] }` breaking down order types (Takeaway, Dine In, Delivery) and customer counts.

### 4. Payment Wise Sales (`POST /widgets/sales-payment-wise`)
Returns array of payment methods: `{ "name": "Cash", "value": 38120.2, "image": "", "color": "#00945eff" }`. Returns empty array `[]` when zero sales.

### 5. Party Wise Sales (`POST /widgets/sales-party-wise`)
Returns array of order channel breakdowns: `{ "name": "Takeaway", "value": 38120.2, "orders": 4, "percentage": 100 }`. Returns `[]` when zero sales.

### 6. New Order List (`POST /widgets/new-order-list`)
Returns tabular matrix format:
`{ "thead": ["Token no.", "Time", "Branch", "Order Type", "Sale Amount", "Profit"], "tbody": [["#A55-3", "12:59 PM", "Sales Demo", "Takeaway", "2700.2", 0], ...] }`

### 7. Day of Week Sales (`POST /widgets/day-of-week`)
Returns day breakdown array: `[{ "name": "Mon", "value": 38120.2 }]`.

### 8. Month Sales (`POST /widgets/month-sales`)
Returns monthly comparison array: `[{ "name": "June 2026", "value": 47105 }, ... ]`.

### 9. Date Branch Sales (`POST /widgets/date-branch-sales`)
Returns time-series object: `{ "date": ["2026-08-04", ...], "values": { "Sales Demo": [66641.45, ...] } }`.

### 10. Sales Summary (`POST /widgets/sales-summary`)
Returns `{ "bar": { "11:AM": { "name": "11:AM", "value": 5520, "value2": 1, ... } }, "total": [...] }`.

### 11. Hourly Sales (`POST /widgets/hourly-sales`)
Returns dictionary mapping string hours (`"00:00"` to `"23:00"`) to numeric sales array: `{ "12:00": [34845], "13:00": [3275.2] }`.

### 12. Hourly Order (`POST /widgets/hourly-order`)
Returns dictionary mapping string hours (`"00:00"` to `"23:00"`) to order count array: `{ "12:00": [2], "13:00": [2] }`.

### 13. Branch Wise Sales (`POST /widgets/branch-wise-sales`)
Returns tabular matrix format:
`{ "thead": ["Branch Name", "Sales", "Orders", "Percentage", "Total Guest", "Total Forcast Sales"], "tbody": [["Sales Demo", 38120.2, 4, 100, 4, 0]], "total": 38120.2 }`

### 14. Item Wise Sales (`POST /widgets/item-wise-sales`)
Returns tabular matrix format:
`{ "thead": ["Item Name", "Sales", "Qty", "Percentage"], "tbody": [["Royal Tikka medium", 3900, "3", 11.77], ...], "total": 33148 }`

### 15. Category Wise Sales (`POST /widgets/category-wise-sales`)
Returns tabular matrix format:
`{ "thead": ["Category Name", "Sales", "Qty", "Percentage"], "tbody": [["Pizzas", 23000, "18", 69.39], ...], "total": 33148 }`

### 16. Top Discounts (`POST /widgets/top-discounts`)
Returns array of active top discount performances. Returns `[]` when no active promotions.

### 17. Online Cards Widget (`POST /widgets/cards-widget`)
Returns online order card summary metrics.

---

## 5. Matrix Table & Parsing Guardrails

### A. Number & String Safety (`parseNumber`)
Table `tbody` matrices contain mixed stringified and numeric values (e.g. quantity `"3"` vs `3`).
Safe conversion utility:
```typescript
export function parseNumber(val: string | number | null | undefined): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? 0 : parsed;
}
```

### B. Safe Empty States
Widgets returning empty array `[]` on days with zero sales (`sales-payment-wise`, `sales-party-wise`, `top-discounts`) must render graceful empty state UI components rather than throwing runtime errors.
