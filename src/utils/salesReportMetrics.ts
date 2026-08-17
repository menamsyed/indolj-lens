import { SalesMetricEntry, InsightsTotalEntry } from '../api/services/widgetService';
import { parseNumber } from './formatters';

export interface ExtractedSalesMetrics {
  grossSale: number;
  refund: number;
  cancelled: number;
  cancelledOrderCount: number;
  foc: number;
  discount: number;
  netSale: number;
  tax: number;
  saleIncTax: number;
  deliveryCharges: number;
  serviceCharges: number;
  total: number;
}

const EMPTY_METRICS: ExtractedSalesMetrics = {
  grossSale: 0,
  refund: 0,
  cancelled: 0,
  cancelledOrderCount: 0,
  foc: 0,
  discount: 0,
  netSale: 0,
  tax: 0,
  saleIncTax: 0,
  deliveryCharges: 0,
  serviceCharges: 0,
  total: 0,
};

export function findByCaseInsensitiveName<T extends { name: string }>(
  items: T[] | null | undefined,
  name: string
): T | undefined {
  if (!Array.isArray(items)) return undefined;
  return items.find((item) => item?.name?.toLowerCase() === name.toLowerCase());
}

// sales-report's `items`/`previous` (from fetchSalesReport) are arrays of {name, value} pairs
// (e.g. "Gross Sale", "Net Sale") — not an object with those as direct keys. Every consumer of
// a sales-report response must go through this extractor rather than reading properties off it.
export function extractSalesMetrics(items: SalesMetricEntry[] | null | undefined): ExtractedSalesMetrics {
  if (!Array.isArray(items) || items.length === 0) return EMPTY_METRICS;
  const value = (name: string): number => parseNumber(findByCaseInsensitiveName(items, name)?.value);
  return {
    grossSale: value('Gross Sale'),
    refund: value('Refund'),
    cancelled: value('Cancelled'),
    cancelledOrderCount: value('Cancelled Order Count'),
    foc: value('FOC'),
    discount: value('Discount'),
    netSale: value('Net Sale'),
    tax: value('Tax'),
    saleIncTax: value('Sale Inc Tax'),
    deliveryCharges: value('Delivery Charges'),
    serviceCharges: value('Service Charges'),
    total: value('Total'),
  };
}

export function extractInsightsTotal(total: InsightsTotalEntry[] | null | undefined, name: string): number {
  return parseNumber(findByCaseInsensitiveName(total, name)?.value);
}

// donut entry names come back lowercase/unstandardized ("dinein", "takeaway", "delivery") and never
// include a `percentage` field on the wire — normalize the key and compute the share client-side.
export function normalizeDonutKey(name: string | null | undefined): string {
  return String(name || '').toLowerCase().replace(/[\s_-]+/g, '');
}

export function findDonutEntry<T extends { name: string }>(
  donut: T[] | null | undefined,
  key: string
): T | undefined {
  if (!Array.isArray(donut)) return undefined;
  return donut.find((item) => normalizeDonutKey(item?.name) === key);
}

// Generic "this item's share of the group's total" — used for payment-wise, donut breakdowns, etc.,
// none of which carry a `percentage` field on the wire.
export function computeSharePercentage<T extends { value: number | string }>(
  items: T[] | null | undefined,
  target: T | undefined
): number {
  if (!target || !Array.isArray(items) || items.length === 0) return 0;
  const total = items.reduce((sum, item) => sum + parseNumber(item.value), 0);
  if (total <= 0) return 0;
  return Math.round((parseNumber(target.value) / total) * 100);
}

const KNOWN_CHANNEL_LABELS: Record<string, string> = {
  dinein: 'Dine In',
  delivery: 'Delivery',
  takeaway: 'Takeaway',
  pickup: 'Pickup',
};

// The API sends lowercase/unstandardized channel names ("dinein", "takeaway") and occasionally an
// empty-name placeholder entry with all-zero values — map to a display label, falling back to a
// capitalized version of whatever name is present for channels outside the known set.
export function formatChannelLabel(name: string | null | undefined): string {
  const key = normalizeDonutKey(name);
  if (KNOWN_CHANNEL_LABELS[key]) return KNOWN_CHANNEL_LABELS[key];
  const raw = String(name || '').trim();
  return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : 'Other';
}

// Fixed palette assigned by array index — used for payment-wise/donut segments where the API's
// own `color` field (when present) doesn't reliably differ between entries.
export const CHART_PALETTE = ['#27AE60', '#2980B9', '#F39C12', '#8E44AD', '#E74C3C', '#1ABC9C'];

export function paletteColor(index: number): string {
  return CHART_PALETTE[index % CHART_PALETTE.length];
}

export interface OrderChannelItem {
  key: string;
  label: string;
  count: number;
  percentage: number;
}

// Shared by the Overview tab's Order Insights card and the per-branch Branches-tab cards — both
// consume a `sales-insights` donut array and need the same real-channel-list + share% treatment.
export function extractOrderChannels(
  donut: { name: string; value: number | string }[] | null | undefined
): OrderChannelItem[] {
  if (!Array.isArray(donut)) return [];
  return donut
    .filter((d) => d?.name && String(d.name).trim() !== '')
    .map((d) => ({
      key: normalizeDonutKey(d.name),
      label: formatChannelLabel(d.name),
      count: parseNumber(d.value),
      percentage: computeSharePercentage(donut, d),
    }));
}

export default {
  findByCaseInsensitiveName,
  extractSalesMetrics,
  extractInsightsTotal,
  normalizeDonutKey,
  findDonutEntry,
  computeSharePercentage,
  formatChannelLabel,
  paletteColor,
  CHART_PALETTE,
  extractOrderChannels,
};
