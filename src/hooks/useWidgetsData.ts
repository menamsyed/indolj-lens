import { useCallback, useEffect, useState } from 'react';
import { colors } from '../styles/colors';
import { fetchBranchSettings, BranchItem } from '../api/services/branchService';
import {
  fetchWidgetRegistry,
  fetchSalesReport,
  fetchSalesInsights,
  fetchSalesPaymentWise,
  fetchSalesPartyWise,
  fetchHourlySales,
  fetchHourlyOrder,
  fetchBranchWiseSales,
  fetchItemWiseSales,
  fetchCategoryWiseSales,
  fetchNewOrderList,
  SalesReportResponse,
  SalesInsightsResponse,
  PaymentWiseItem,
  PartyWiseItem,
  MatrixTableResponse,
} from '../api/services/widgetService';
import { parseNumber, formatCurrency, formatAmountAbbreviated } from '../utils/formatters';
import { computeDateRangeForPreset } from '../utils/dateRange';
import { safeAllSettled } from '../utils/asyncSafe';
import {
  extractSalesMetrics,
  extractInsightsTotal,
  computeSharePercentage,
  extractOrderChannels,
  paletteColor,
} from '../utils/salesReportMetrics';

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
  const [insights, setInsights] = useState<SalesInsightsResponse | null>(null);
  const [paymentWise, setPaymentWise] = useState<PaymentWiseItem[]>([]);
  const [partyWise, setPartyWise] = useState<PartyWiseItem[]>([]);
  const [hourlySales, setHourlySales] = useState<Record<string, number[]>>({});
  const [hourlyOrders, setHourlyOrders] = useState<Record<string, number[]>>({});
  const [branchWise, setBranchWise] = useState<MatrixTableResponse | null>(null);
  const [itemWise, setItemWise] = useState<MatrixTableResponse | null>(null);
  const [categoryWise, setCategoryWise] = useState<MatrixTableResponse | null>(null);
  const [newOrderList, setNewOrderList] = useState<MatrixTableResponse | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Compute YYYY-MM-DD from/to date strings based on preset
  const getComputedDates = useCallback(
    (): { from: string; to: string } =>
      computeDateRangeForPreset(dateRangePreset, customFromDate, customToDate),
    [dateRangePreset, customFromDate, customToDate]
  );

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
        // Priority phase — get-api-details + get-branch always fire first and are awaited before
        // any other widget call goes out, matching the reference call graph (Endpoint A/B ahead of
        // every Endpoint C). The registry isn't consumed for dynamic dispatch yet, but is fetched
        // here so it stays first in the actual request order.
        const [, branchTuple] = await safeAllSettled([
          fetchWidgetRegistry(),
          fetchBranchSettings(),
        ]);

        // [0]=pagination (scoped to caller's own branch), [1]=same scoped single-branch array,
        // [2]=full branch dictionary keyed by id — this is the actual "all branches" source.
        if (branchTuple.status === 'fulfilled' && branchTuple.value?.[2] && typeof branchTuple.value[2] === 'object') {
          setBranches(Object.values(branchTuple.value[2]));
        } else {
          setBranches([]);
        }

        const [
          reportRes,
          insightsRes,
          paymentsRes,
          partyRes,
          hourlySalesRes,
          hourlyOrdersRes,
          branchWiseRes,
          itemWiseRes,
          categoryWiseRes,
          newOrdersRes,
        ] = await safeAllSettled([
          fetchSalesReport(query),
          fetchSalesInsights(query),
          fetchSalesPaymentWise(query),
          fetchSalesPartyWise(query),
          fetchHourlySales(query),
          fetchHourlyOrder(query),
          fetchBranchWiseSales(query),
          fetchItemWiseSales(query),
          fetchCategoryWiseSales(query),
          fetchNewOrderList(query),
        ]);

        if (reportRes.status === 'fulfilled' && reportRes.value) {
          setSalesReport(reportRes.value);
        } else {
          setSalesReport(null);
        }

        if (insightsRes.status === 'fulfilled' && insightsRes.value) {
          setInsights(insightsRes.value);
        } else {
          setInsights(null);
        }

        if (paymentsRes.status === 'fulfilled' && Array.isArray(paymentsRes.value)) {
          setPaymentWise(paymentsRes.value);
        } else {
          setPaymentWise([]);
        }

        if (partyRes.status === 'fulfilled' && Array.isArray(partyRes.value)) {
          setPartyWise(partyRes.value);
        } else {
          setPartyWise([]);
        }

        if (hourlySalesRes.status === 'fulfilled' && hourlySalesRes.value) {
          setHourlySales(hourlySalesRes.value || {});
        } else {
          setHourlySales({});
        }

        if (hourlyOrdersRes.status === 'fulfilled' && hourlyOrdersRes.value) {
          setHourlyOrders(hourlyOrdersRes.value || {});
        } else {
          setHourlyOrders({});
        }

        if (branchWiseRes.status === 'fulfilled' && branchWiseRes.value) {
          setBranchWise(branchWiseRes.value);
        } else {
          setBranchWise(null);
        }

        if (itemWiseRes.status === 'fulfilled' && itemWiseRes.value) {
          setItemWise(itemWiseRes.value);
        } else {
          setItemWise(null);
        }

        if (categoryWiseRes.status === 'fulfilled' && categoryWiseRes.value) {
          setCategoryWise(categoryWiseRes.value);
        } else {
          setCategoryWise(null);
        }

        if (newOrdersRes.status === 'fulfilled' && newOrdersRes.value) {
          setNewOrderList(newOrdersRes.value);
        } else {
          setNewOrderList(null);
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

  // sales-report's `items`/`previous` are arrays of {name, value} pairs (e.g. "Gross Sale"),
  // not an object with those as direct keys — extractSalesMetrics does the name-based lookup.
  const metrics = extractSalesMetrics(salesReport?.items);
  const prevMetrics = extractSalesMetrics(salesReport?.previous);
  const hasPrevious = Boolean(salesReport?.previous && salesReport.previous.length > 0);

  // "Total Sales" headline is sourced from the dedicated branch-wise-sales widget's own `total`
  // field — it's the endpoint purpose-built for this figure — falling back to sales-report's Net
  // Sale only if that widget failed. sales-report's netSale remains authoritative for the "Net
  // Sale" grid tile and for period-over-period growth below (branch-wise-sales has no `previous`).
  const branchWiseTotal = parseNumber(branchWise?.total);
  const netSaleNum = branchWiseTotal > 0 ? branchWiseTotal : metrics.netSale;
  const totalSalesAmount = formatCurrency(netSaleNum);

  const prevPeriodText = hasPrevious
    ? `prev period: ${formatAmountAbbreviated(prevMetrics.total)}`
    : '';

  const grossSaleVal = formatCurrency(metrics.grossSale);
  const netSaleVal = formatCurrency(metrics.netSale);
  const taxVal = formatCurrency(metrics.tax);
  const totalVal = formatCurrency(metrics.total);
  const discountVal = formatCurrency(metrics.discount);
  const focVal = formatCurrency(metrics.foc);
  const refundVal = formatCurrency(metrics.refund);
  const cancelledVal = formatCurrency(metrics.cancelled);
  const cancelledOrderCountVal = String(metrics.cancelledOrderCount);
  const saleIncTaxVal = formatCurrency(metrics.saleIncTax);
  const serviceChargesVal = formatCurrency(metrics.serviceCharges);
  const deliveryChargesVal = formatCurrency(metrics.deliveryCharges);

  // Compute Hourly Sales Trend Metrics & BarChart Dataset — each hour maps to an array of amounts
  // (till/session breakdown), not a single-element array; sum it rather than reading index [0].
  // Computed before the orders-count fallback below, which needs `trendTotalOrders`.
  let trendTotalAmount = 0;
  let trendTotalOrders = 0;

  const trendBarData: { value: number; label: string; frontColor?: string }[] = [];

  if (hourlySales && typeof hourlySales === 'object') {
    Object.entries(hourlySales).forEach(([hourKey, valArray]) => {
      const amount = Array.isArray(valArray)
        ? valArray.reduce((sum, v) => sum + parseNumber(v), 0)
        : parseNumber(valArray);
      trendTotalAmount += amount;
      trendBarData.push({
        value: amount,
        label: hourKey,
        frontColor: amount > 0 ? colors.chart.turquoise : undefined,
      });
    });
  }

  if (hourlyOrders && typeof hourlyOrders === 'object') {
    Object.values(hourlyOrders).forEach((valArray) => {
      const orders = Array.isArray(valArray)
        ? valArray.reduce((sum, v) => sum + parseNumber(v), 0)
        : parseNumber(valArray);
      trendTotalOrders += orders;
    });
  }

  const finalTrendTotalAmount = formatCurrency(trendTotalAmount);
  const finalTrendTotalOrders = trendTotalOrders;
  const finalTrendAvgOrderAmount = trendTotalOrders > 0
    ? formatCurrency(trendTotalAmount / trendTotalOrders)
    : 'Rs 0';

  // Order Insights (POST /widgets/sales-insights) — `total` is [{name,value}], `donut` entries are
  // lowercase ("dinein"/"takeaway"/"delivery") raw counts with no `percentage` field on the wire.
  // `orders` is the authoritative order count; if that widget failed, fall back to the hourly-order
  // widget's sum (it may under-count if the hourly window is narrower, but it's better than 0).
  const insightsOrdersCount = extractInsightsTotal(insights?.total, 'Total Orders');
  const totalOrdersCount = insightsOrdersCount > 0 ? insightsOrdersCount : trendTotalOrders;
  const totalCustomersCount = extractInsightsTotal(insights?.total, 'Total Customers');

  // Every real channel in the donut (not just Takeaway) — the API also sends an empty-name,
  // all-zero placeholder entry that gets filtered out here.
  const orderChannels = extractOrderChannels(insights?.donut);

  // Calculate Avg Order Value: (net_sale / total_orders)
  const avgOrderValNum = totalOrdersCount > 0 ? netSaleNum / totalOrdersCount : 0;
  const avgOrderValueDisplay = `Rs. ${avgOrderValNum.toFixed(2)}`;

  // Growth calculations vs. the previous period — only computable for fields sales-report
  // actually returns a `previous` value for (Net Sale, Tax). Orders/Avg Order Value have no
  // previous-period figure on the wire (sales-insights doesn't return one), so those trend
  // pills are left blank rather than guessed.
  const computeGrowth = (current: number, previous: number): string => {
    if (!hasPrevious || previous <= 0) return '';
    const growth = Math.round(((current - previous) / previous) * 100);
    return `${growth >= 0 ? '+' : ''}${growth}%`;
  };
  const overallGrowth = computeGrowth(metrics.netSale, prevMetrics.netSale);
  const salesTaxGrowth = computeGrowth(metrics.tax, prevMetrics.tax);

  // Payment Breakdown — no `percentage` field on the wire, computed client-side. The API's own
  // `color` field isn't reliably distinct per method (samples have repeated the same color across
  // Cash and Card), so always assign by a fixed palette instead of trusting it.
  const totalPaymentAmount = Array.isArray(paymentWise)
    ? paymentWise.reduce((sum, p) => sum + parseNumber(p.value), 0)
    : 0;
  // PaymentBreakdownCard prepends its own "Rs." — feed it a bare abbreviated number.
  const paymentTotalDisplay = formatAmountAbbreviated(totalPaymentAmount);

  const paymentPieData = Array.isArray(paymentWise) && paymentWise.length > 0
    ? paymentWise.map((p, idx) => ({
        value: parseNumber(p.value),
        color: paletteColor(idx),
        text: p.name,
      }))
    : [];

  const paymentLegend = Array.isArray(paymentWise)
    ? paymentWise.map((p, idx) => ({
        name: p.name,
        amountDisplay: formatAmountAbbreviated(p.value),
        percentage: computeSharePercentage(paymentWise, p),
        color: paletteColor(idx),
      }))
    : [];

  // Party Wise Sales — this endpoint DOES return real `orders`/`percentage` fields; render every
  // channel it returns (Takeaway, Dine-In, ...) rather than a single hardcoded one.
  const partyChannels = Array.isArray(partyWise)
    ? partyWise.map((p) => ({
        name: p.name,
        salesValue: formatCurrency(p.value),
        orders: p.orders ?? 0,
        percentage: Math.min(100, Math.max(0, p.percentage ?? 0)),
      }))
    : [];

  return {
    branches,
    salesReport,
    insights,
    paymentWise,
    partyWise,
    hourlySales,
    hourlyOrders,
    branchWise,
    itemWise,
    categoryWise,
    newOrderList,
    totalSalesAmount,
    prevPeriodText,
    grossSaleVal,
    netSaleVal,
    taxVal,
    totalVal,
    discountVal,
    focVal,
    refundVal,
    cancelledVal,
    cancelledOrderCountVal,
    saleIncTaxVal,
    serviceChargesVal,
    deliveryChargesVal,
    overallGrowth,
    salesTaxGrowth,
    ordersCount: totalOrdersCount,
    avgOrderValueDisplay,
    totalOrdersCount,
    totalCustomersCount,
    orderChannels,
    paymentPieData,
    paymentLegend,
    paymentTotalDisplay,
    partyChannels,
    trendTotalAmount: finalTrendTotalAmount,
    trendTotalOrders: finalTrendTotalOrders,
    trendAvgOrderAmount: finalTrendAvgOrderAmount,
    trendBarData,
    isLoading,
    isRefreshing,
    error,
    refetch: () => loadData(true),
  };
}

export default useWidgetsData;
