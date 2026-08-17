import { formatDateYYYYMMDD } from './formatters';
import { DateRangePreset } from '../types/dashboard';

export interface ComputedDateRange {
  from: string;
  to: string;
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

// Shared by useWidgetsData and useBranchWiseSummaries so both hooks fetch the same
// date window for a given preset.
export function computeDateRangeForPreset(
  preset: string,
  customFromDate?: Date,
  customToDate?: Date
): ComputedDateRange {
  const today = new Date();
  let fromDate = new Date();
  let toDate = new Date();

  if (preset === 'Yesterday') {
    fromDate.setDate(today.getDate() - 1);
    toDate.setDate(today.getDate() - 1);
  } else if (preset === 'This Week') {
    const dayOfWeek = today.getDay();
    fromDate.setDate(today.getDate() - dayOfWeek);
  } else if (preset === 'This Month') {
    fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
  } else if (preset === 'Custom' && customFromDate && customToDate) {
    fromDate = customFromDate;
    toDate = customToDate;
  }

  return {
    from: formatDateYYYYMMDD(fromDate),
    to: formatDateYYYYMMDD(toDate),
  };
}

export default {
  computeDateRangeForPreset,
  DATE_RANGE_PRESETS,
  formatDisplayDate,
};
