import apiClient from '../client';
import { ENDPOINTS } from '../config/routes';

export interface WidgetQueryParams {
  range?: number; // 12 or 24
  from: string;   // YYYY-MM-DD
  to: string;     // YYYY-MM-DD
  branch_id?: string | number;
}

// Every /widgets/* response is wrapped as { status, message, details: <payload> } —
// (sales-report additionally carries a sibling `previous` array). All fetchers below
// unwrap `.details` before returning; nothing upstream should ever see the envelope.

export interface SalesMetricEntry {
  name: string;
  value: number | string;
  image?: string;
}

export interface SalesReportResponse {
  items: SalesMetricEntry[];
  previous: SalesMetricEntry[];
}

export interface InsightsDonutEntry {
  name: string;
  value: number | string;
  value2?: number | string;
}

export interface InsightsTotalEntry {
  name: string;
  value: number | string;
}

export interface SalesInsightsResponse {
  donut: InsightsDonutEntry[];
  total: InsightsTotalEntry[];
}

export interface PaymentWiseItem {
  name: string;
  value: number | string;
  color?: string;
  image?: string;
}

export interface PartyWiseItem {
  name: string;
  value: number | string;
  orders: number;
  percentage: number;
}

export interface MatrixTableResponse {
  thead: string[];
  tbody: (string | number)[][];
  total?: number | string;
}

export interface DayOfWeekItem {
  name: string; // e.g. "Mon"
  value: number;
}

export interface MonthSalesItem {
  name: string; // e.g. "June 2026"
  value: number;
}

export interface SalesSummaryBarEntry {
  name: string;
  value: number | string;
  value2?: number | string;
}

export interface SalesSummaryTotalEntry {
  name: string;
  value: number | string;
}

export interface SalesSummaryResponse {
  bar: Record<string, SalesSummaryBarEntry>;
  total: SalesSummaryTotalEntry[];
}

export interface WidgetDescriptor {
  method: string;
  prefix: string;
  endpoint: string;
  app_type: string;
  web_type: string;
  sequence: string;
  heading: string;
  params: string[];
}

function buildQueryString(params: WidgetQueryParams): string {
  const parts: string[] = [
    `range=${encodeURIComponent(String(params.range || 12))}`,
    `from=${encodeURIComponent(params.from)}`,
    `to=${encodeURIComponent(params.to)}`,
  ];
  if (params.branch_id !== undefined && params.branch_id !== null && params.branch_id !== 'all') {
    parts.push(`branch_id=${encodeURIComponent(String(params.branch_id))}`);
  }
  return parts.join('&');
}

// 1. Widget Registry GET Contract
export async function fetchWidgetRegistry(): Promise<WidgetDescriptor[]> {
  const response = await apiClient.get<{ details?: WidgetDescriptor[] }>(ENDPOINTS.WIDGETS.GET_API_DETAILS);
  return Array.isArray(response.data?.details) ? response.data.details : [];
}

// 2. Sales Overview (POST /widgets/sales-report) — details & previous are arrays of {name, value}
export async function fetchSalesReport(params: WidgetQueryParams): Promise<SalesReportResponse> {
  const q = buildQueryString(params);
  const response = await apiClient.post<{ details?: SalesMetricEntry[]; previous?: SalesMetricEntry[] }>(
    `${ENDPOINTS.WIDGETS.SALES_REPORT}?${q}`
  );
  return {
    items: Array.isArray(response.data?.details) ? response.data.details : [],
    previous: Array.isArray(response.data?.previous) ? response.data.previous : [],
  };
}

// 3. Order Insights (POST /widgets/sales-insights)
export async function fetchSalesInsights(params: WidgetQueryParams): Promise<SalesInsightsResponse> {
  const q = buildQueryString(params);
  const response = await apiClient.post<{ details?: Partial<SalesInsightsResponse> }>(
    `${ENDPOINTS.WIDGETS.SALES_INSIGHTS}?${q}`
  );
  return {
    donut: Array.isArray(response.data?.details?.donut) ? response.data!.details!.donut! : [],
    total: Array.isArray(response.data?.details?.total) ? response.data!.details!.total! : [],
  };
}

// 4. Payment Wise Sales (POST /widgets/sales-payment-wise) — no `percentage` field on the wire, compute client-side
export async function fetchSalesPaymentWise(params: WidgetQueryParams): Promise<PaymentWiseItem[]> {
  const q = buildQueryString(params);
  const response = await apiClient.post<{ details?: PaymentWiseItem[] }>(`${ENDPOINTS.WIDGETS.PAYMENT_WISE}?${q}`);
  return Array.isArray(response.data?.details) ? response.data.details : [];
}

// 5. Party Wise Sales (POST /widgets/sales-party-wise)
export async function fetchSalesPartyWise(params: WidgetQueryParams): Promise<PartyWiseItem[]> {
  const q = buildQueryString(params);
  const response = await apiClient.post<{ details?: PartyWiseItem[] }>(`${ENDPOINTS.WIDGETS.PARTY_WISE}?${q}`);
  return Array.isArray(response.data?.details) ? response.data.details : [];
}

// 6. New Order List (POST /widgets/new-order-list) — the live widget registry (`get-api-details`)
// declares only `branch_id` as a param for this endpoint, and it's verified live: passing `from`/
// `to` (even an unrelated 2020 date range) returns identical rows. It doesn't filter by date —
// don't send `range`/`from`/`to`, they're silently ignored.
export async function fetchNewOrderList(params: WidgetQueryParams): Promise<MatrixTableResponse> {
  const q = params.branch_id !== undefined && params.branch_id !== null && params.branch_id !== 'all'
    ? `branch_id=${encodeURIComponent(String(params.branch_id))}`
    : '';
  const response = await apiClient.post<{ details?: MatrixTableResponse }>(
    `${ENDPOINTS.WIDGETS.NEW_ORDER_LIST}${q ? `?${q}` : ''}`
  );
  return response.data?.details || { thead: [], tbody: [] };
}

// 7. Day of Week Sales (POST /widgets/day-of-week)
export async function fetchDayOfWeekSales(params: WidgetQueryParams): Promise<DayOfWeekItem[]> {
  const q = buildQueryString(params);
  const response = await apiClient.post<{ details?: DayOfWeekItem[] }>(`${ENDPOINTS.WIDGETS.DAY_OF_WEEK}?${q}`);
  return Array.isArray(response.data?.details) ? response.data.details : [];
}

// 8. Month Sales (POST /widgets/month-sales)
export async function fetchMonthSales(params: WidgetQueryParams): Promise<MonthSalesItem[]> {
  const q = buildQueryString(params);
  const response = await apiClient.post<{ details?: MonthSalesItem[] }>(`${ENDPOINTS.WIDGETS.MONTH_SALES}?${q}`);
  return Array.isArray(response.data?.details) ? response.data.details : [];
}

// 9. Date Branch Sales (POST /widgets/date-branch-sales)
export async function fetchDateBranchSales(params: WidgetQueryParams): Promise<unknown> {
  const q = buildQueryString(params);
  const response = await apiClient.post<{ details?: unknown }>(`${ENDPOINTS.WIDGETS.DATE_BRANCH_SALES}?${q}`);
  return response.data?.details ?? {};
}

// 10. Sales Summary (POST /widgets/sales-summary) — the widget registry's designated "chartbar" endpoint
export async function fetchSalesSummary(params: WidgetQueryParams): Promise<SalesSummaryResponse> {
  const q = buildQueryString(params);
  const response = await apiClient.post<{ details?: Partial<SalesSummaryResponse> }>(
    `${ENDPOINTS.WIDGETS.SALES_SUMMARY}?${q}`
  );
  return {
    bar: response.data?.details?.bar || {},
    total: Array.isArray(response.data?.details?.total) ? response.data!.details!.total! : [],
  };
}

// 11. Hourly Sales (POST /widgets/hourly-sales) — each hour maps to an array of amounts to sum, not index [0]
export async function fetchHourlySales(params: WidgetQueryParams): Promise<Record<string, number[]>> {
  const q = buildQueryString(params);
  const response = await apiClient.post<{ details?: Record<string, number[]> }>(`${ENDPOINTS.WIDGETS.HOURLY_SALES}?${q}`);
  return response.data?.details || {};
}

// 12. Hourly Order (POST /widgets/hourly-order)
export async function fetchHourlyOrder(params: WidgetQueryParams): Promise<Record<string, number[]>> {
  const q = buildQueryString(params);
  const response = await apiClient.post<{ details?: Record<string, number[]> }>(`${ENDPOINTS.WIDGETS.HOURLY_ORDER}?${q}`);
  return response.data?.details || {};
}

// 13. Branch Wise Sales (POST /widgets/branch-wise-sales)
export async function fetchBranchWiseSales(params: WidgetQueryParams): Promise<MatrixTableResponse> {
  const q = buildQueryString(params);
  const response = await apiClient.post<{ details?: MatrixTableResponse }>(`${ENDPOINTS.WIDGETS.BRANCH_WISE}?${q}`);
  return response.data?.details || { thead: [], tbody: [] };
}

// 14. Item Wise Sales (POST /widgets/item-wise-sales)
export async function fetchItemWiseSales(params: WidgetQueryParams): Promise<MatrixTableResponse> {
  const q = buildQueryString(params);
  const response = await apiClient.post<{ details?: MatrixTableResponse }>(`${ENDPOINTS.WIDGETS.ITEM_WISE}?${q}`);
  return response.data?.details || { thead: [], tbody: [] };
}

// 15. Category Wise Sales (POST /widgets/category-wise-sales)
export async function fetchCategoryWiseSales(params: WidgetQueryParams): Promise<MatrixTableResponse> {
  const q = buildQueryString(params);
  const response = await apiClient.post<{ details?: MatrixTableResponse }>(`${ENDPOINTS.WIDGETS.CATEGORY_WISE}?${q}`);
  return response.data?.details || { thead: [], tbody: [] };
}

// 16. Top Discounts (POST /widgets/top-discounts)
export async function fetchTopDiscounts(params: WidgetQueryParams): Promise<unknown[]> {
  const q = buildQueryString(params);
  const response = await apiClient.post<{ details?: unknown[] }>(`${ENDPOINTS.WIDGETS.TOP_DISCOUNTS}?${q}`);
  return Array.isArray(response.data?.details) ? response.data.details : [];
}

// 17. Online Cards Widget (POST /widgets/cards-widget)
export async function fetchCardsWidget(params: WidgetQueryParams): Promise<unknown> {
  const q = buildQueryString(params);
  const response = await apiClient.post<{ details?: unknown }>(`${ENDPOINTS.WIDGETS.CARDS_WIDGET}?${q}`);
  return response.data?.details ?? {};
}

export default {
  fetchWidgetRegistry,
  fetchSalesReport,
  fetchSalesInsights,
  fetchSalesPaymentWise,
  fetchSalesPartyWise,
  fetchNewOrderList,
  fetchDayOfWeekSales,
  fetchMonthSales,
  fetchDateBranchSales,
  fetchSalesSummary,
  fetchHourlySales,
  fetchHourlyOrder,
  fetchBranchWiseSales,
  fetchItemWiseSales,
  fetchCategoryWiseSales,
  fetchTopDiscounts,
  fetchCardsWidget,
};
