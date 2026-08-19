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
import { computeDateRangeForPreset, computePreviousDateRange } from '../utils/dateRange';
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

// Converts "13:00" -> "01:PM", "00:00" -> "12:AM", "09:00" -> "09:AM" to match reference standard
function formatHourLabel(hourStr: string): string {
  const parts = hourStr.split(':');
  const hourNum = parseInt(parts[0], 10);
  if (isNaN(hourNum)) return hourStr;
  
  if (hourNum === 0) return '12:AM';
  if (hourNum === 12) return '12:PM';
  if (hourNum > 12) {
    const h = hourNum - 12;
    return `${h < 10 ? '0' + h : h}:PM`;
  }
  return `${hourNum < 10 ? '0' + hourNum : hourNum}:AM`;
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
  const [prevInsights, setPrevInsights] = useState<SalesInsightsResponse | null>(null);
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

  // sales-insights (Orders/Customers) doesn't return its own `previous` comparison the way
  // sales-report does, so period-over-period growth for Orders/Avg Order Value needs a second
  // fetch against the immediately preceding period of the same length.
  const getPreviousComputedDates = useCallback(
    (): { from: string; to: string } =>
      computePreviousDateRange(dateRangePreset, customFromDate, customToDate),
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
      const prevQuery = { ...getPreviousComputedDates(), branch_id: selectedBranchId };

      try {
        const [, branchTuple] = await safeAllSettled([
          fetchWidgetRegistry(),
          fetchBranchSettings(),
        ]);

        if (branchTuple.status === 'fulfilled' && branchTuple.value?.[2] && typeof branchTuple.value[2] === 'object') {
          setBranches(Object.values(branchTuple.value[2]));
        } else {
          setBranches([]);
        }

        const [
          reportRes,
          insightsRes,
          prevInsightsRes,
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
          fetchSalesInsights(prevQuery),
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

        if (prevInsightsRes.status === 'fulfilled' && prevInsightsRes.value) {
          setPrevInsights(prevInsightsRes.value);
        } else {
          setPrevInsights(null);
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
    [getComputedDates, getPreviousComputedDates, selectedBranchId]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const metrics = extractSalesMetrics(salesReport?.items);
  const prevMetrics = extractSalesMetrics(salesReport?.previous);
  const hasPrevious = Boolean(salesReport?.previous && salesReport.previous.length > 0);

  // TOTAL SALES card and Sales Overview card must read the same metric from the same
  // sales-report response — Gross Sale, confirmed against live data (headline, prev period,
  // and growth% all match Gross Sale exactly, not Net Sale or Total). Previously this fell
  // back to `branchWise.total` (a different endpoint, /widgets/branch-wise-sales), which only
  // coincidentally matched Gross Sale for single-branch accounts.
  const totalSalesAmount = formatCurrency(metrics.grossSale);

  const prevPeriodText = hasPrevious
    ? `prev period: ${formatAmountAbbreviated(prevMetrics.grossSale)}`
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

  // Sum all till/session values for each hour (e.g., "00:00": [13578.9, 42431.36, 74575.47, ...])
  let trendTotalAmount = 0;
  let trendTotalOrders = 0;

  const trendBarData: { value: number; label: string; frontColor?: string }[] = [];

  if (hourlySales && typeof hourlySales === 'object') {
    Object.entries(hourlySales).forEach(([hourKey, valArray]) => {
      const rawAmount = Array.isArray(valArray)
        ? valArray.reduce((sum, v) => sum + parseNumber(v), 0)
        : parseNumber(valArray);
      
      const amount = Math.round(rawAmount * 100) / 100;
      trendTotalAmount += amount;

      const formattedHourLabel = formatHourLabel(hourKey);

      trendBarData.push({
        value: amount,
        label: formattedHourLabel,
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
    : 'Rs. 0';

  const insightsOrdersCount = extractInsightsTotal(insights?.total, 'Total Orders');
  const totalOrdersCount = insightsOrdersCount > 0 ? insightsOrdersCount : trendTotalOrders;
  const totalCustomersCount = extractInsightsTotal(insights?.total, 'Total Customers');
  const orderChannels = extractOrderChannels(insights?.donut);

  const prevOrdersCount = extractInsightsTotal(prevInsights?.total, 'Total Orders');

  const avgOrderValNum = totalOrdersCount > 0 ? metrics.grossSale / totalOrdersCount : 0;
  const avgOrderValueDisplay = `Rs. ${avgOrderValNum.toFixed(2)}`;
  const prevAvgOrderValNum = prevOrdersCount > 0 ? prevMetrics.grossSale / prevOrdersCount : 0;

  const computeGrowth = (current: number, previous: number): string => {
    if (previous <= 0) return '';
    const growth = Math.round(((current - previous) / previous) * 100);
    return `${growth >= 0 ? '+' : ''}${growth}%`;
  };
  const overallGrowth = computeGrowth(metrics.grossSale, prevMetrics.grossSale);
  const salesTaxGrowth = computeGrowth(metrics.tax, prevMetrics.tax);
  const discountGrowth = computeGrowth(metrics.discount, prevMetrics.discount);
  const ordersGrowth = computeGrowth(totalOrdersCount, prevOrdersCount);
  const avgOrderValueGrowth = computeGrowth(avgOrderValNum, prevAvgOrderValNum);

  const totalPaymentAmount = Array.isArray(paymentWise)
    ? paymentWise.reduce((sum, p) => sum + parseNumber(p.value), 0)
    : 0;
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

  const partyChannels = Array.isArray(partyWise)
    ? partyWise.map((p) => ({
        name: p.name,
        salesValue: formatCurrency(p.value),
        orders: p.orders ?? 0,
        percentage: Math.min(100, Math.max(0, p.percentage ?? 0)),
      }))
    : [];

  const totalPartyAmount = Array.isArray(partyWise)
    ? partyWise.reduce((sum, p) => sum + parseNumber(p.value), 0)
    : 0;
  const partyTotalDisplay = formatAmountAbbreviated(totalPartyAmount);

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
    discountGrowth,
    ordersGrowth,
    avgOrderValueGrowth,
    ordersCount: totalOrdersCount,
    avgOrderValueDisplay,
    totalOrdersCount,
    totalCustomersCount,
    orderChannels,
    paymentPieData,
    paymentLegend,
    paymentTotalDisplay,
    partyChannels,
    partyTotalDisplay,
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
