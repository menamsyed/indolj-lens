/**
 * Utility functions for safe cell parsing, number formatting, and currency display
 * Safe for React Native Hermes & JSC engines without locale dependencies
 */

export function parseNumber(val: string | number | null | undefined): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  
  const str = String(val).trim();
  if (!str) return 0;

  // Remove thousand separator commas first
  const cleanStr = str.replace(/,/g, '');

  // Extract the numeric portion (supports optional minus sign, digits, and optional decimal)
  const match = cleanStr.match(/-?\d+(?:\.\d+)?/);
  if (!match) return 0;

  const parsed = parseFloat(match[0]);
  return isNaN(parsed) ? 0 : parsed;
}

export function formatCurrency(val: number | string): string {
  return `Rs.${formatAmountAbbreviated(val)}`;
}

// Rounds off decimal figures to whole integers and formats with standard comma grouping
export function formatAmountAbbreviated(val: number | string): string {
  const num = parseNumber(val);
  const sign = num < 0 ? '-' : '';
  const rounded = Math.round(Math.abs(num));
  return sign + rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatDateYYYYMMDD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// First letter of up to the first two words of a name (e.g. "app cashier" -> "AC"),
// falling back to "?" for an empty/missing name.
export function getInitials(name: string | null | undefined): string {
  const words = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  return words.slice(0, 2).map((w) => w[0]!.toUpperCase()).join('');
}

export default {
  parseNumber,
  formatCurrency,
  formatAmountAbbreviated,
  formatDateYYYYMMDD,
  getInitials,
};
