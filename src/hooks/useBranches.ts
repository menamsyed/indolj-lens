import { useCallback, useEffect, useState } from 'react';
import { fetchBranchSettings, BranchItem } from '../api/services/branchService';
import { fetchWidgetRegistry } from '../api/services/widgetService';
import { safeAllSettled } from '../utils/asyncSafe';

export interface UseBranchesResult {
  branches: BranchItem[];
  isLoading: boolean;
  refetch: () => void;
}

// Lightweight branch-list fetch for screens (e.g. the Branches tab) that only need the branch
// list, not the full Overview widget set that useWidgetsData also fetches. Mirrors that hook's
// priority phase (get-api-details + get-branch fetched together, ahead of anything else) without
// duplicating its heavier per-widget calls.
export function useBranches(): UseBranchesResult {
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const load = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const [, branchTuple] = await safeAllSettled([
        fetchWidgetRegistry(),
        fetchBranchSettings(),
      ]);

      // [0]=pagination (scoped to caller's own branch), [1]=same scoped single-branch array,
      // [2]=full branch dictionary keyed by id — this is the actual "all branches" source.
      if (branchTuple.status === 'fulfilled' && branchTuple.value?.[2] && typeof branchTuple.value[2] === 'object') {
        setBranches(Object.values(branchTuple.value[2]));
      } else {
        setBranches([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { branches, isLoading, refetch: load };
}

export default useBranches;
