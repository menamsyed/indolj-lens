import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { VectorIcon, IconName } from '../common/VectorIcon';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { useTheme } from '../../context/ThemeContext';
import { Colors } from '../../styles/colors';
import { typography, fontWeights } from '../../styles/typography';
import { formatCurrency } from '../../utils/formatters';

export interface OverviewMetricItem {
  label: string;
  value: string | number;
  iconName: IconName;
  iconBgColor?: string;
  iconColor?: string;
}

export interface SalesOverviewCardProps {
  metrics?: OverviewMetricItem[];
  isLoading?: boolean;
}

const getDefaultMetrics = (colors: Colors): OverviewMetricItem[] => [
  { label: 'Gross Sale', value: '44242', iconName: 'chart', iconBgColor: colors.chart.greenBg, iconColor: colors.chart.green },
  { label: 'Refund', value: '0', iconName: 'back', iconBgColor: colors.status.errorBg, iconColor: colors.status.error },
  { label: 'Cancelled', value: '13306', iconName: 'lock', iconBgColor: colors.status.errorBg, iconColor: colors.status.error },
  { label: 'Cancelled Order Amount', value: '0', iconName: 'user', iconBgColor: colors.status.errorBg, iconColor: colors.status.error },
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
  const styles = useMemo(() => createStyles(colors), [colors]);
  const activeMetrics = useMemo(() => metrics ?? getDefaultMetrics(colors), [metrics, colors]);

  const formatTileValue = (val: string | number): string => {
    if (typeof val === 'number' || (val !== null && val !== undefined && !String(val).startsWith('Rs.'))) {
      return formatCurrency(val);
    }
    return String(val);
  };

  if (isLoading) {
    return (
      <View style={styles.cardContainer}>
        <View style={styles.headerRow}>
          <SkeletonLoader width={120} height={18} borderRadius={4} />
        </View>
        <View style={styles.metricsGrid}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((key) => (
            <View key={key} style={styles.metricTile}>
              <SkeletonLoader width={40} height={40} borderRadius={12} style={styles.skeletonIcon} />
              <SkeletonLoader width={70} height={11} borderRadius={3} style={styles.skeletonLabel} />
              <SkeletonLoader width={80} height={16} borderRadius={4} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.cardContainer}>
      <View style={styles.headerRow}>
        <Text style={[typography.h3, styles.cardTitle]}>Sales Overview</Text>
      </View>

      <View style={styles.metricsGrid}>
        {activeMetrics.map((item, index) => (
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
              {formatTileValue(item.value)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  cardContainer: {
    backgroundColor: colors.surface.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border.light,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 14,
    color: colors.text.primary,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricTile: {
    width: '48.5%',
    backgroundColor: colors.neutral.gray50,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  tileLabel: {
    fontSize: 11,
    color: colors.text.muted,
    marginBottom: 2,
  },
  tileValue: {
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: fontWeights.bold,
  },
  skeletonIcon: {
    marginBottom: 10,
  },
  skeletonLabel: {
    marginBottom: 4,
  },
});

export default SalesOverviewCard;
