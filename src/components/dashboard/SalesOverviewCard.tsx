import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { VectorIcon, IconName } from '../common/VectorIcon';
import { GradientCardHeader } from '../common/GradientCardHeader';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { useTheme } from '../../context/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { Colors } from '../../styles/colors';
import { typography, fontWeights } from '../../styles/typography';
import { ScreenMetrics, moderateScale, scale } from '../../utils/responsive';
import { formatCurrency } from '../../utils/formatters';

export interface OverviewMetricItem {
  label: string;
  value: string | number;
  iconName: IconName;
  iconBgColor?: string;
  iconColor?: string;
  /** Render `value` as-is (no "Rs." currency formatting) — for count fields like "Cancelled Order Count". */
  isCount?: boolean;
}

export interface SalesOverviewCardProps {
  metrics?: OverviewMetricItem[];
  isLoading?: boolean;
}

// Splits a flat list into fixed-size-2 rows so the grid below can render an explicit
// `flexDirection: 'row'` per pair instead of a wrapping percentage-width grid — that's
// what guarantees exactly two columns on every screen size (see chunkPairs usages below).
function chunkPairs<T>(items: T[]): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }
  return rows;
}

const getDefaultMetrics = (colors: Colors): OverviewMetricItem[] => [
  { label: 'Gross Sale', value: '44242', iconName: 'chart', iconBgColor: colors.chart.greenBg, iconColor: colors.chart.green },
  { label: 'Refund', value: '0', iconName: 'back', iconBgColor: colors.status.errorBg, iconColor: colors.status.error },
  { label: 'Cancelled', value: '13306', iconName: 'lock', iconBgColor: colors.status.errorBg, iconColor: colors.status.error },
  { label: 'Cancelled Order Count', value: '0', iconName: 'user', iconBgColor: colors.status.errorBg, iconColor: colors.status.error, isCount: true },
  { label: 'FOC', value: '2410', iconName: 'utensils', iconBgColor: colors.chart.greenBg, iconColor: colors.chart.teal },
  { label: 'Discount', value: '0', iconName: 'percent', iconBgColor: colors.chart.orangeBg, iconColor: colors.chart.orange },
  { label: 'Net Sale', value: '38120.2', iconName: 'store', iconBgColor: colors.brand.tint, iconColor: colors.brand.primary },
  { label: 'Tax', value: '4972.2', iconName: 'file-text', iconBgColor: colors.chart.purpleBg, iconColor: colors.chart.purple },
  { label: 'Sale Inc Tax', value: '43092.4', iconName: 'bowl', iconBgColor: colors.chart.greenBg, iconColor: colors.chart.green },
  { label: 'Service Charges', value: '0', iconName: 'coffee', iconBgColor: colors.chart.amberBg, iconColor: colors.chart.amber },
  { label: 'Delivery Charges', value: '0', iconName: 'pizza', iconBgColor: colors.chart.orangeBg, iconColor: colors.chart.orange },
  { label: 'Total', value: '43092.4', iconName: 'check', iconBgColor: colors.chart.greenBg, iconColor: colors.chart.green },
];

export function SalesOverviewCard({
  metrics,
  isLoading = false,
}: SalesOverviewCardProps): React.JSX.Element {
  const { colors } = useTheme();
  const responsiveMetrics = useResponsive();
  const styles = useMemo(() => createStyles(colors, responsiveMetrics), [colors, responsiveMetrics]);
  const activeMetrics = useMemo(() => metrics ?? getDefaultMetrics(colors), [metrics, colors]);

  const formatTileValue = (item: OverviewMetricItem): string => {
    if (item.isCount) return String(item.value);
    const val = item.value;
    if (typeof val === 'number' || (val !== null && val !== undefined && !String(val).startsWith('Rs.'))) {
      return formatCurrency(val);
    }
    return String(val);
  };

  if (isLoading) {
    return (
      <View style={styles.cardShadowWrapper}>
        <View style={styles.cardContainer}>
          <View style={styles.headerRow}>
            <SkeletonLoader width={120} height={18} borderRadius={4} />
          </View>
          <View style={styles.body}>
            <View style={styles.metricsGrid}>
              {chunkPairs([1, 2, 3, 4, 5, 6, 7, 8]).map((row, rowIndex) => (
                <View key={rowIndex} style={styles.metricsRow}>
                  {row.map((key) => (
                    <View key={key} style={styles.metricTile}>
                      <SkeletonLoader width={40} height={40} borderRadius={12} style={styles.skeletonIcon} />
                      <SkeletonLoader width={70} height={11} borderRadius={3} style={styles.skeletonLabel} />
                      <SkeletonLoader width={80} height={16} borderRadius={4} />
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.cardShadowWrapper}>
      <View style={styles.cardContainer}>
        <GradientCardHeader title="Sales Overview" subtitle={`${activeMetrics.length} metrics`} icon="trending-up" />

        <View style={styles.body}>
          <View style={styles.metricsGrid}>
            {chunkPairs(activeMetrics).map((row, rowIndex) => (
              <View key={rowIndex} style={styles.metricsRow}>
                {row.map((item, index) => (
                  <View key={`${item.label}-${index}`} style={styles.metricTile}>
                    <View style={[styles.iconBox, { backgroundColor: item.iconBgColor ?? colors.brand.tint }]}>
                      <VectorIcon
                        name={item.iconName}
                        size={20}
                        color={item.iconColor ?? colors.brand.primary}
                      />
                    </View>
                    <Text style={[typography.caption, styles.tileLabel]} numberOfLines={1}>
                      {item.label}
                    </Text>
                    <Text style={[typography.h3, styles.tileValue]} numberOfLines={1} adjustsFontSizeToFit>
                      {formatTileValue(item)}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: Colors, metrics: ScreenMetrics) => {
  const iconBoxSize = scale(40, metrics);

  return StyleSheet.create({
    // Separate from `cardContainer` because that view needs `overflow: 'hidden'` to clip the
    // gradient header to the rounded corners — on iOS a shadow on the same view as
    // `overflow: 'hidden'` gets clipped away too, so the shadow lives on this un-clipped wrapper.
    cardShadowWrapper: {
      borderRadius: moderateScale(20, 0.5, metrics),
      marginBottom: scale(16, metrics),
      shadowColor: colors.neutral.black,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 6,
    },
    cardContainer: {
      backgroundColor: colors.surface.card,
      borderRadius: moderateScale(20, 0.5, metrics),
      overflow: 'hidden',
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      padding: moderateScale(16, 0.5, metrics),
    },
    body: {
      padding: moderateScale(16, 0.5, metrics),
    },
    metricsGrid: {
      gap: scale(10, metrics),
    },
    metricsRow: {
      flexDirection: 'row',
      gap: scale(10, metrics),
    },
    metricTile: {
      // See BranchSummaryCard.tsx's tileCard for why this needs to be explicit rather
      // than the `flex: 1` shorthand: flexBasis: 0 forces the tile to grow purely by
      // its (equal) flexGrow ratio instead of its own content size, and minWidth: 0
      // stops a long label ("Cancelled Order Amount") from re-imposing a content floor
      // that would squeeze its row sibling unevenly.
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 0,
      minWidth: 0,
      backgroundColor: colors.neutral.gray50,
      borderRadius: moderateScale(14, 0.5, metrics),
      padding: moderateScale(12, 0.5, metrics),
      shadowColor: colors.neutral.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    iconBox: {
      width: iconBoxSize,
      height: iconBoxSize,
      borderRadius: moderateScale(12, 0.5, metrics),
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: scale(10, metrics),
    },
    tileLabel: {
      fontSize: moderateScale(11, 0.3, metrics),
      color: colors.text.muted,
      marginBottom: scale(2, metrics),
    },
    tileValue: {
      fontSize: moderateScale(15, 0.3, metrics),
      color: colors.text.primary,
      fontWeight: fontWeights.bold,
    },
    skeletonIcon: {
      marginBottom: scale(10, metrics),
    },
    skeletonLabel: {
      marginBottom: scale(4, metrics),
    },
  });
};

export default SalesOverviewCard;
