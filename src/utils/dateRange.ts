import { formatDateYYYYMMDD } from './formatters';
import { DateRangePreset } from '../types/dashboard';

export interface ComputedDateRange {
  from: string;
  to: string;
}

export interface RawDateRange {
  fromDate: Date;
  toDate: Date;
}

// Shared by DateRangeModal/FilterBottomSheet-style pickers so the preset list is defined once.
export const DATE_RANGE_PRESETS: DateRangePreset[] = [
  'Today',
  'Yesterday',
  'This Week',
  'This Month',
  'Custom',
];

export function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// A single calendar date if the range is one day, otherwise "date - date"
export function formatDateRangeLabel(fromDate: Date, toDate: Date): string {
  const from = formatDisplayDate(fromDate);
  const to = formatDisplayDate(toDate);
  return from === to ? from : `${from} - ${to}`;
}

// Local-calendar-date computation; all Date objects pinned to local noon to avoid DST/midnight edge cases
export function computeRawDateRangeForPreset(
  preset: string,
  customFromDate?: Date,
  customToDate?: Date
): RawDateRange {
  const now = new Date();
  const baseDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);

  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const date = baseDate.getDate();

  let fromDate = new Date(year, month, date, 12, 0, 0);
  let toDate = new Date(year, month, date, 12, 0, 0);

  if (preset === 'Today') {
    fromDate = new Date(year, month, date, 12, 0, 0);
    toDate = new Date(year, month, date, 12, 0, 0);
  } else if (preset === 'Yesterday') {
    fromDate = new Date(year, month, date - 1, 12, 0, 0);
    toDate = new Date(year, month, date - 1, 12, 0, 0);
  } else if (preset === 'This Week') {
    // Week-to-date: Monday of the current week through today (mirrors "This Month" below).
    const dayOfWeek = baseDate.getDay(); // 0 = Sun, 1 = Mon...
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    fromDate = new Date(year, month, date - daysSinceMonday, 12, 0, 0);
    toDate = new Date(year, month, date, 12, 0, 0);
  } else if (preset === 'This Month') {
    fromDate = new Date(year, month, 1, 12, 0, 0);
    toDate = new Date(year, month, date, 12, 0, 0);
  } else if (preset === 'Custom' && customFromDate && customToDate) {
    fromDate = new Date(customFromDate.getFullYear(), customFromDate.getMonth(), customFromDate.getDate(), 12, 0, 0);
    toDate = new Date(customToDate.getFullYear(), customToDate.getMonth(), customToDate.getDate(), 12, 0, 0);
  }

  return { fromDate, toDate };
}

// Shared by useWidgetsData and useBranchWiseSummaries so both hooks fetch the same date window
export function computeDateRangeForPreset(
  preset: string,
  customFromDate?: Date,
  customToDate?: Date
): ComputedDateRange {
  const { fromDate, toDate } = computeRawDateRangeForPreset(preset, customFromDate, customToDate);

  return {
    from: formatDateYYYYMMDD(fromDate),
    to: formatDateYYYYMMDD(toDate),
  };
}

// The immediately preceding period of the same length as the selected preset — e.g. "Today"
// (1 day) -> yesterday, "This Week" (Mon-to-date, N days) -> the N days before that. Mirrors
// how sales-report's own `previous` array behaves (confirmed against live data: for a 1-day
// "Today" query, its previous is yesterday). Endpoints like sales-insights don't return their
// own previous comparison, so callers needing period-over-period growth for those fetch this
// range as a second request.
export function computePreviousDateRange(
  preset: string,
  customFromDate?: Date,
  customToDate?: Date
): ComputedDateRange {
  const { fromDate, toDate } = computeRawDateRangeForPreset(preset, customFromDate, customToDate);
  const spanDays = Math.round((toDate.getTime() - fromDate.getTime()) / 86400000) + 1;

  const prevFromDate = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate() - spanDays, 12, 0, 0);
  const prevToDate = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate() - spanDays, 12, 0, 0);

  return {
    from: formatDateYYYYMMDD(prevFromDate),
    to: formatDateYYYYMMDD(prevToDate),
  };
}

export default {
  computeDateRangeForPreset,
  computePreviousDateRange,
  computeRawDateRangeForPreset,
  formatDateRangeLabel,
  DATE_RANGE_PRESETS,
  formatDisplayDate,
};
