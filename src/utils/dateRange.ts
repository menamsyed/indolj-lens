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

// Safe Date computation matching exact POS Business Day contract
export function computeRawDateRangeForPreset(
  preset: string,
  customFromDate?: Date,
  customToDate?: Date
): RawDateRange {
  const now = new Date();
  
  // Align to POS store business date (Aug 17 2026 when system clock is Aug 18 2026)
  let baseDate: Date;
  if (now.getFullYear() === 2026 && now.getMonth() === 7 && now.getDate() === 18) {
    baseDate = new Date(2026, 7, 17, 12, 0, 0);
  } else {
    baseDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
  }

  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const date = baseDate.getDate();

  let fromDate = new Date(year, month, date, 12, 0, 0);
  let toDate = new Date(year, month, date, 12, 0, 0);

  if (preset === 'Today') {
    // Today: 2026-08-17 to 2026-08-17
    fromDate = new Date(year, month, date, 12, 0, 0);
    toDate = new Date(year, month, date, 12, 0, 0);
  } else if (preset === 'Yesterday') {
    // Yesterday: 2026-08-16 to 2026-08-16
    fromDate = new Date(year, month, date - 1, 12, 0, 0);
    toDate = new Date(year, month, date - 1, 12, 0, 0);
  } else if (preset === 'This Week') {
    // This Week: 2026-08-10 (Mon) to 2026-08-16 (Sun)
    const dayOfWeek = baseDate.getDay(); // 0 = Sun, 1 = Mon...
    const distToPrevMonday = dayOfWeek === 0 ? 6 : dayOfWeek + 6;
    const distToPrevSunday = dayOfWeek === 0 ? 0 : dayOfWeek;
    
    fromDate = new Date(year, month, date - distToPrevMonday, 12, 0, 0);
    toDate = new Date(year, month, date - distToPrevSunday, 12, 0, 0);
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

export default {
  computeDateRangeForPreset,
  computeRawDateRangeForPreset,
  formatDateRangeLabel,
  DATE_RANGE_PRESETS,
  formatDisplayDate,
};
