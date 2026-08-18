import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { getScreenMetrics, ScreenMetrics } from '../utils/responsive';

// Reactive to rotation/split-screen/fold — unlike the plain `Dimensions.get('window')`
// snapshot `responsive.ts`'s functions fall back to, this forces `metrics` (and
// therefore any `createStyles(colors, metrics)` memo keyed on it) to recompute when
// the window actually changes size.
export function useResponsive(): ScreenMetrics {
  const { width, height } = useWindowDimensions();
  return useMemo(() => getScreenMetrics(width, height), [width, height]);
}

export default useResponsive;
