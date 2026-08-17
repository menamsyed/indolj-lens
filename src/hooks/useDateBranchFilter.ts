import { useState } from 'react';
import { BranchItem } from '../api/services/branchService';
import { computeDateRangeForPreset } from '../utils/dateRange';
import { BranchOption, DateRangePreset } from '../types/dashboard';

// "All Branches" sentinel prepended to whatever real branch list a screen has fetched — shared so
// the picker's options are built identically wherever it's used.
export function buildBranchOptionsList(branches: BranchItem[]): BranchOption[] {
  return Array.isArray(branches) && branches.length > 0
    ? [
        { id: 'all', name: 'All Branches', isAll: true },
        ...branches.map((b) => ({ id: String(b?.id || ''), name: b?.name || 'Branch' })),
      ]
    : [{ id: 'all', name: 'All Branches', isAll: true }];
}

const DEFAULT_DATE_RANGE: DateRangePreset = 'Today';
const DEFAULT_BRANCH: BranchOption = { id: 'all', name: 'All Branches', isAll: true };

export interface CustomDateRange {
  from: Date;
  to: Date;
}

export interface UseDateBranchFilterResult {
  selectedDateRange: DateRangePreset;
  selectedBranch: BranchOption;
  displayDateLabel: string;
  from: string;
  to: string;
  isFilterSheetOpen: boolean;
  isDateDefault: boolean;
  isBranchDefault: boolean;
  activeFilterCount: number;
  openFilterSheet: () => void;
  closeFilterSheet: () => void;
  applyFilters: (range: DateRangePreset, branch: BranchOption, customLabel?: string, customRange?: CustomDateRange) => void;
}

// Shared date-range/branch filter logic for screens that need their own independent copy of it
// (Dashboard and Branches each hold their own instance — no state is shared between them).
// Deliberately doesn't take/derive a branch options list: the caller's branch list usually comes
// from a data hook (useWidgetsData/useBranches) that itself needs `selectedDateRange`/
// `selectedBranch` as input, so building that list here would create a circular dependency.
export function useDateBranchFilter(): UseDateBranchFilterResult {
  const [selectedDateRange, setSelectedDateRange] = useState<DateRangePreset>(DEFAULT_DATE_RANGE);
  const [customDateLabel, setCustomDateLabel] = useState<string>('');
  const [customFromDate, setCustomFromDate] = useState<Date | null>(null);
  const [customToDate, setCustomToDate] = useState<Date | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<BranchOption>(DEFAULT_BRANCH);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState<boolean>(false);

  const applyFilters = (
    range: DateRangePreset,
    branch: BranchOption,
    customLabel?: string,
    customRange?: CustomDateRange
  ): void => {
    setSelectedDateRange(range);
    setSelectedBranch(branch);
    if (range === 'Custom' && customLabel && customRange) {
      setCustomDateLabel(customLabel);
      setCustomFromDate(customRange.from);
      setCustomToDate(customRange.to);
    } else {
      setCustomDateLabel('');
      setCustomFromDate(null);
      setCustomToDate(null);
    }
  };

  const displayDateLabel = selectedDateRange === 'Custom' && customDateLabel
    ? customDateLabel
    : selectedDateRange;

  const { from, to } = computeDateRangeForPreset(
    selectedDateRange,
    customFromDate ?? undefined,
    customToDate ?? undefined
  );

  const isDateDefault = selectedDateRange === DEFAULT_DATE_RANGE;
  const isBranchDefault = selectedBranch.id === DEFAULT_BRANCH.id;

  return {
    selectedDateRange,
    selectedBranch,
    displayDateLabel,
    from,
    to,
    isFilterSheetOpen,
    isDateDefault,
    isBranchDefault,
    activeFilterCount: (isDateDefault ? 0 : 1) + (isBranchDefault ? 0 : 1),
    openFilterSheet: () => setIsFilterSheetOpen(true),
    closeFilterSheet: () => setIsFilterSheetOpen(false),
    applyFilters,
  };
}

export default useDateBranchFilter;
