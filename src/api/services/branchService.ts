import apiClient from '../client';
import { ENDPOINTS } from '../config/routes';

export interface BranchPagination {
  current_page: number;
  total: number;
  per_page: number;
  [key: string]: unknown;
}

export interface BranchItem {
  id: number;
  name: string;
  phn_no: string;
  address: string | null;
  branch_tax: number;
  slug: string;
  status: string;
  payment_tax?: Record<string, number>;
}

export type BranchMap = Record<string, BranchItem>;

export type BranchSettingsTuple = [
  BranchPagination,
  BranchItem[],
  BranchMap
];

export async function fetchBranchSettings(): Promise<BranchSettingsTuple> {
  const response = await apiClient.get<BranchSettingsTuple>(ENDPOINTS.GET_BRANCH);
  return response.data;
}

export default {
  fetchBranchSettings,
};
