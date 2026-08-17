import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { VectorIcon } from '../common/VectorIcon';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { useTheme } from '../../context/ThemeContext';
import { Colors } from '../../styles/colors';
import { typography, fontWeights } from '../../styles/typography';

export interface PaymentLegendItem {
  name: string;
  amountDisplay: string;
  percentage: number;
  color: string;
}

export interface PaymentBreakdownCardProps {
  totalAmount?: string;
  legend?: PaymentLegendItem[];
  pieData?: { value: number; color: string; text?: string }[];
  isLoading?: boolean;
}

const getDefaultLegend = (colors: Colors): PaymentLegendItem[] => [
  { name: 'Cash', amountDisplay: '38.1K', percentage: 100, color: colors.chart.green },
];

export function PaymentBreakdownCard({
  totalAmount = '38.1K',
  legend,
  pieData,
  isLoading = false,
}: PaymentBreakdownCardProps): React.JSX.Element {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const activeLegend = useMemo(() => legend ?? getDefaultLegend(colors), [legend, colors]);
  const defaultPieData = useMemo(() => [{ value: 100, color: colors.chart.green }], [colors]);
  const chartData = pieData && pieData.length > 0 ? pieData : defaultPieData;

  const renderCenterBadge = (amount: string) => () => (
    <View style={styles.centerBadge}>
      <Text style={[typography.caption, styles.centerSub]}>Rs.</Text>
      <Text style={[typography.h3, styles.centerText]}>{amount}</Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.cardContainer}>
        <View style={styles.headerRow}>
          <SkeletonLoader width={140} height={18} borderRadius={4} />
          <SkeletonLoader width={80} height={12} borderRadius={3} />
        </View>
        <View style={styles.centerChartWrapper}>
          <SkeletonLoader width={90} height={90} shape="circle" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.cardContainer}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[typography.h3, styles.cardTitle]}>Payment Breakdown</Text>
      </View>

      {/* Center Donut Chart */}
      <View style={styles.centerChartWrapper}>
        <PieChart
          data={chartData}
          donut
          radius={50}
          innerRadius={36}
          innerCircleColor={colors.surface.card}
          centerLabelComponent={renderCenterBadge(totalAmount)}
          isAnimated
          animationDuration={800}
        />
      </View>

      {/* One progress row per real payment method */}
      {activeLegend.length > 0 ? (
        activeLegend.map((item) => (
          <View key={item.name} style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View style={styles.leftGroup}>
                <View style={[styles.cashIconBox, { backgroundColor: colors.chart.greenBg }]}>
                  <VectorIcon name="check" size={14} color={item.color || colors.chart.green} />
                </View>
                <Text style={[typography.bodyMedium, styles.methodName]}>{item.name}</Text>
              </View>
              <Text style={[typography.bodyMedium, styles.amountPercentage, { color: item.color || colors.chart.green }]}>
                {item.percentage}% · Rs. {item.amountDisplay}
              </Text>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.min(item.percentage, 100)}%`, backgroundColor: item.color || colors.chart.green },
                ]}
              />
            </View>
          </View>
        ))
      ) : (
        <Text style={[typography.caption, styles.emptyText]}>No payment data for this period.</Text>
      )}
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
  subtitleText: {
    fontSize: 11,
    color: colors.text.muted,
  },
  centerChartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  centerBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerSub: {
    fontSize: 10,
    color: colors.text.muted,
  },
  centerText: {
    fontSize: 13.5,
    color: colors.text.primary,
    fontWeight: fontWeights.bold,
  },
  progressCard: {
    backgroundColor: colors.neutral.gray50,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cashIconBox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: colors.chart.greenBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  methodName: {
    fontSize: 13.5,
    color: colors.text.primary,
    fontWeight: fontWeights.semiBold,
  },
  amountPercentage: {
    fontSize: 13,
    color: colors.chart.green,
    fontWeight: fontWeights.bold,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.neutral.gray200,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.chart.green,
    borderRadius: 3,
  },
  emptyText: {
    fontSize: 12,
    color: colors.text.muted,
    textAlign: 'center',
    paddingVertical: 8,
  },
});

export default PaymentBreakdownCard;
