/**
 * API Routes and Server Endpoint Configurations
 * Strictly aligned with http://salesdemo.indoljpos.com specification and docs/branch-and-widgets.md.
 */

export const DEFAULT_MERCHANT_SLUG = 'salesdemo';
const MERCHANT_DOMAIN_SUFFIX = '.indoljpos.com';

// Merchants are addressed as http://{merchant-slug}.indoljpos.com — the slug is
// whatever the user types in the Login screen's "Merchant" field.
export function buildMerchantBaseUrl(merchantSlug: string): string {
  const slug = (merchantSlug || DEFAULT_MERCHANT_SLUG).trim().toLowerCase();
  return `http://${slug}${MERCHANT_DOMAIN_SUFFIX}`;
}

export const BASE_URL = buildMerchantBaseUrl(DEFAULT_MERCHANT_SLUG);

export const ENDPOINTS = {
  LOGIN: '/auth/login',
  GET_BRANCH: '/settings/get-branch',
  WIDGETS: {
    GET_API_DETAILS: '/widgets/get-api-details',
    SALES_REPORT: '/widgets/sales-report',
    SALES_INSIGHTS: '/widgets/sales-insights',
    PAYMENT_WISE: '/widgets/sales-payment-wise',
    PARTY_WISE: '/widgets/sales-party-wise',
    NEW_ORDER_LIST: '/widgets/new-order-list',
    DAY_OF_WEEK: '/widgets/day-of-week',
    MONTH_SALES: '/widgets/month-sales',
    DATE_BRANCH_SALES: '/widgets/date-branch-sales',
    SALES_SUMMARY: '/widgets/sales-summary',
    HOURLY_SALES: '/widgets/hourly-sales',
    HOURLY_ORDER: '/widgets/hourly-order',
    BRANCH_WISE: '/widgets/branch-wise-sales',
    ITEM_WISE: '/widgets/item-wise-sales',
    CATEGORY_WISE: '/widgets/category-wise-sales',
    TOP_DISCOUNTS: '/widgets/top-discounts',
    CARDS_WIDGET: '/widgets/cards-widget',
  },
} as const;

export default {
  BASE_URL,
  ENDPOINTS,
};
