import { useEffect, useState } from 'react';
import { BranchItem } from '../api/services/branchService';
import { fetchBranchWiseSales, fetchSalesReport, fetchSalesInsights } from '../api/services/widgetService';
import { formatCurrency, parseNumber } from '../utils/formatters';
import { safeAllSettled } from '../utils/asyncSafe';
import {
  extractSalesMetrics,
  findByCaseInsensitiveName,
  extractOrderChannels,
  OrderChannelItem,
} from '../utils/salesReportMetrics';

export interface BranchSalesSummary {
  branchId: number;
  branchName: string;
  netSale: number;
  netSalesAmount: string;
  discountAmount: string;
  taxAmount: string;
  ordersCount: number;
  customersCount: number;
  channels: OrderChannelItem[];
}

export interface UseBranchWiseSummariesResult {
  summaries: BranchSalesSummary[];
  isLoading: boolean;
}

// Fetches per-branch sales data for the Branches tab. `branch-wise-sales` is the endpoint
// purpose-built for this — a single call returns Sales/Orders/Total Guest for every branch that
// actually had activity in the period (it omits zero-activity branches entirely, matching the
// reference app's behavior). Discount/Tax and the order-type breakdown aren't in that response,
// so those are still fetched per (active) branch from sales-report/sales-insights.
export function useBranchWiseSummaries(
  branches: BranchItem[],
  from: string,
  to: string,
  enabled: boolean
): UseBranchWiseSummariesResult {
  const [summaries, setSummaries] = useState<BranchSalesSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!enabled || !Array.isArray(branches) || branches.length === 0) {
      return;
    }

    let isMounted = true;

    const loadBranchSummaries = async (): Promise<void> => {
      setIsLoading(true);

      try {
        const matrix = await fetchBranchWiseSales({ from, to });
        const nameIdx = matrix.thead.indexOf('Branch Name');
        const salesIdx = matrix.thead.indexOf('Sales');
        const ordersIdx = matrix.thead.indexOf('Orders');
        const guestIdx = matrix.thead.indexOf('Total Guest');

        const activeRows = Array.isArray(matrix.tbody) ? matrix.tbody : [];

        const perBranch = await Promise.all(
          activeRows.map(async (row) => {
            const branchName = String(row[nameIdx] ?? '');
            const branch = findByCaseInsensitiveName(branches, branchName);
            const netSale = parseNumber(row[salesIdx]);
            const ordersCount = parseNumber(row[ordersIdx]);
            const customersCount = guestIdx >= 0 ? parseNumber(row[guestIdx]) : 0;

            let discount = 0;
            let tax = 0;
            let channels: OrderChannelItem[] = [];

            if (branch) {
              const [reportRes, insightsRes] = await safeAllSettled([
                fetchSalesReport({ from, to, branch_id: branch.id }),
                fetchSalesInsights({ from, to, branch_id: branch.id }),
              ]);
              if (reportRes.status === 'fulfilled') {
                const branchMetrics = extractSalesMetrics(reportRes.value?.items);
                discount = branchMetrics.discount;
                tax = branchMetrics.tax;
              }
              if (insightsRes.status === 'fulfilled' && insightsRes.value) {
                channels = extractOrderChannels(insightsRes.value.donut);
              }
            }

            return {
              branchId: branch?.id ?? 0,
              branchName: branch?.name ?? branchName,
              netSale,
              discount,
              tax,
              ordersCount,
              customersCount,
              channels,
            };
          })
        );

        if (isMounted) {
          setSummaries(
            perBranch.map((b) => ({
              branchId: b.branchId,
              branchName: b.branchName,
              netSale: b.netSale,
              netSalesAmount: formatCurrency(b.netSale),
              discountAmount: formatCurrency(b.discount),
              taxAmount: formatCurrency(b.tax),
              ordersCount: b.ordersCount,
              customersCount: b.customersCount,
              channels: b.channels,
            }))
          );
        }
      } catch (err) {
        console.warn('Failed to load branch-wise summaries:', err);
        if (isMounted) setSummaries([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadBranchSummaries();

    return () => {
      isMounted = false;
    };
  }, [branches, from, to, enabled]);

  return { summaries, isLoading };
}

export default useBranchWiseSummaries;
