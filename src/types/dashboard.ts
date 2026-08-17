export type DateRangePreset = 'Today' | 'Yesterday' | 'This Week' | 'This Month' | 'Custom';

export interface BranchOption {
  id: string;
  name: string;
  isAll?: boolean;
}

export interface MetricTileData {
  label: string;
  value: string;
  iconName?: string;
  highlightColor?: string;
}

export interface OrderTypeProgress {
  type: string;
  count: number;
  percentage: number;
  color: string;
}

export interface HourlySalesBar {
  timeLabel: string;
  amount: number;
  heightPercent: number;
}

export interface SaleSummaryRecord {
  tokenNo: string;
  time: string;
  branch: string;
}
