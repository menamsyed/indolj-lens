# Indolj Merchant POS — Total Sales Widget Technical Specification

This document provides a complete technical specification of how the **Total Sales Widget** (`BranchSummaryCard.tsx`) is structured, which backend APIs it consumes, and how data maps from backend responses to React Native UI components.

---

## 1. Widget Overview (`BranchSummaryCard.tsx`)

The **Total Sales Widget** is the primary hero banner displayed at the top of the POS Dashboard. It summarizes key financial metrics and customer/order volume for the selected branch and time period.

### UI Structure & Elements
- **Header Row**:
  - Banner Title: `"TOTAL SALES"`
  - Subtitle Date Label: `dateString` (e.g. `"Thursday, 11 Aug 2026"`)
  - Growth Chip: `overallGrowth` (e.g. `▲ +0.00%`)
- **Main Hero Sales Figure**:
  - Large formatted Net Sales string (`netSalesAmount`), e.g., `"Rs. 38,120"`
- **4 Sub-Metric Grid Tiles**:
  1. **Orders**: `ordersCount` (Icon: `store`)
  2. **Prediction Sales**: `predictionSales` (Icon: `chart`)
  3. **Customer Count**: `customerCount` (Icon: `user`)
  4. **Discount Amount**: `discountAmount` (Icon: `percent`)

---

## 2. API Endpoints Consumed

The Total Sales Widget aggregates data from **2 backend endpoints**:

### Endpoint 1: `POST /widgets/sales-report`
- **Service Function**: `fetchSalesReport(params)` in `src/api/services/widgetService.ts`
- **HTTP Method**: `POST`
- **Request URL Example**:
  ```http
  POST http://salesdemo.indoljpos.com/widgets/sales-report?range=12&from=2026-08-11&to=2026-08-11&branch_id=2
  ```
- **Backend Response Payload**:
  ```json
  {
    "gross_sale": 44242,
    "refund": 0,
    "cancelled": 13306,
    "cancelled_order_count": 2,
    "foc": 2410,
    "discount": 4572,
    "net_sale": 38120.2,
    "tax": 4972.2,
    "sale_inc_tax": 43092.4,
    "delivery_charges": 0,
    "service_charges": 0,
    "total": 43092.4,
    "previous": {
      "net_sale": 35000,
      "total": 72360
    }
  }
  ```

---

### Endpoint 2: `POST /widgets/sales-insights`
- **Service Function**: `fetchSalesInsights(params)` in `src/api/services/widgetService.ts`
- **HTTP Method**: `POST`
- **Request URL Example**:
  ```http
  POST http://salesdemo.indoljpos.com/widgets/sales-insights?range=12&from=2026-08-11&to=2026-08-11&branch_id=2
  ```
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

---

## 3. Detailed Data Mapping Table

| Component Prop (`BranchSummaryCardProps`) | API Endpoint Source | Backend Response JSON Path | Data Transformation / Formatter | Example Output Value |
| :--- | :--- | :--- | :--- | :--- |
| **`dateString`** | Local Filter State | Preset / System Date | `formatDate(new Date())` | `"Thursday, 11 Aug 2026"` |
| **`netSalesAmount`** | `POST /widgets/sales-report` | `salesReport.net_sale` | `formatCurrency(parseNumber(salesReport.net_sale))` | `"Rs. 38,120"` |
| **`ordersCount`** | `POST /widgets/sales-insights` | `insights.total[0].total_orders` | Direct integer mapping | `4` |
| **`predictionSales`** | `POST /widgets/sales-report` | `salesReport.previous.total` | Value in Thousands (`val / 1000`) + `"K"` | `"72.36K"` |
| **`customerCount`** | `POST /widgets/sales-insights` | `insights.total[0].total_customers` | Direct integer mapping | `0` |
| **`discountAmount`** | `POST /widgets/sales-report` | `salesReport.discount` | `formatCurrency(parseNumber(salesReport.discount))` | `"4.572"` |
| **`overallGrowth`** | `POST /widgets/sales-report` | `salesReport.net_sale` vs `salesReport.previous.net_sale` | `((current - previous) / previous) * 100` | `"+0.00%"` |

---

## 4. End-to-End Code Flow Implementation

### 1. API Call Definition (`src/api/services/widgetService.ts`)
```typescript
export async function fetchSalesReport(params: WidgetQueryParams): Promise<SalesReportResponse> {
  const q = buildQueryString(params);
  const response = await apiClient.post<SalesReportResponse>(`${ENDPOINTS.WIDGETS.SALES_REPORT}?${q}`);
  return response.data;
}

export async function fetchSalesInsights(params: WidgetQueryParams): Promise<unknown> {
  const q = buildQueryString(params);
  const response = await apiClient.post(`${ENDPOINTS.WIDGETS.SALES_INSIGHTS}?${q}`);
  return response.data;
}
```

### 2. Container Hook Transformation (`src/hooks/useWidgetsData.ts`)
```typescript
const [reportData, insightsData] = await Promise.allSettled([
  fetchSalesReport(query),
  fetchSalesInsights(query),
]);

if (reportData.status === 'fulfilled') {
  setSalesReport(reportData.value);
}

// Derived properties passed to UI
const totalSalesAmount = salesReport?.net_sale
  ? formatCurrency(parseNumber(salesReport.net_sale))
  : 'Rs. 0';

const discountVal = salesReport?.discount
  ? formatCurrency(parseNumber(salesReport.discount))
  : '0';
```

### 3. Screen Prop Binding (`src/screens/DashboardScreen.tsx`)
```tsx
<BranchSummaryCard
  dateString="Thursday, 11 Aug 2026"
  netSalesAmount={totalSalesAmount}
  ordersCount={4}
  predictionSales="72.36K"
  customerCount={0}
  discountAmount={discountVal}
  overallGrowth="+0.00%"
  isLoading={isLoading}
/>
```

### 4. Presentation Component (`src/components/dashboard/BranchSummaryCard.tsx`)
```tsx
export function BranchSummaryCard({
  dateString,
  netSalesAmount,
  ordersCount,
  predictionSales,
  customerCount,
  discountAmount,
  overallGrowth,
  isLoading,
}: BranchSummaryCardProps): React.JSX.Element {
  if (isLoading) {
    return <SkeletonLoader ... />;
  }

  return (
    <View style={styles.cardContainer}>
      <Text style={styles.bannerTitle}>TOTAL SALES</Text>
      <Text style={styles.dateSubtitle}>{dateString}</Text>
      <Text style={styles.growthText}>▲ {overallGrowth}</Text>

      <Text style={styles.bigSalesValue}>{netSalesAmount}</Text>

      <View style={styles.tilesGrid}>
        <View style={styles.tileCard}>
          <Text style={styles.tileLabel}>Orders</Text>
          <Text style={styles.tileValue}>{ordersCount}</Text>
        </View>
        <View style={styles.tileCard}>
          <Text style={styles.tileLabel}>Prediction Sales</Text>
          <Text style={styles.tileValue}>{predictionSales}</Text>
        </View>
        <View style={styles.tileCard}>
          <Text style={styles.tileLabel}>Customer Count</Text>
          <Text style={styles.tileValue}>{customerCount}</Text>
        </View>
        <View style={styles.tileCard}>
          <Text style={styles.tileLabel}>Discount Amount</Text>
          <Text style={styles.tileValue}>{discountAmount}</Text>
        </View>
      </View>
    </View>
  );
}
```

---

## 5. Edge Case Guardrails & Utilities

1. **`parseNumber` Safety**:
   Backend numbers may be returned as numeric values (`38120.2`) or strings (`"38120.2"`). Using `parseNumber()` prevents runtime Javascript errors.
2. **Skeleton Loader**:
   When `isLoading = true`, `BranchSummaryCard` automatically displays animated skeleton place-holders while API requests resolve.
