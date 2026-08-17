import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { VectorIcon } from '../common/VectorIcon';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { useTheme } from '../../context/ThemeContext';
import { Colors } from '../../styles/colors';
import { typography, fontWeights } from '../../styles/typography';

export interface SalesTrendCardProps {
  totalAmount?: string;
  totalOrders?: number;
  avgOrderAmount?: string;
  barData?: { value: number; label: string; frontColor?: string }[];
  isLoading?: boolean;
}

const getDefaultBarData = (colors: Colors) => [
  { value: 0, label: '0' },
  { value: 0, label: '3:AM' },
  { value: 0, label: '6:AM' },
  { value: 0, label: '9:AM' },
  { value: 34845, label: '12:PM', frontColor: colors.chart.turquoise },
  { value: 5200, label: '3:PM', frontColor: colors.chart.turquoise },
  { value: 0, label: '6:PM' },
  { value: 0, label: '9:PM' },
  { value: 0, label: '12:AM' },
];

export function SalesTrendCard({
  totalAmount = 'Rs 43640',
  totalOrders = 5,
  avgOrderAmount = 'Rs 8728',
  barData,
  isLoading = false,
}: SalesTrendCardProps): React.JSX.Element {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const defaultBars = useMemo(() => getDefaultBarData(colors), [colors]);
  const chartBarData = barData && barData.length > 0 ? barData : defaultBars;

  if (isLoading) {
    return (
      <View style={styles.cardContainer}>
        <View style={styles.headerRow}>
          <SkeletonLoader width={120} height={18} borderRadius={4} />
        </View>
        <View style={styles.topStatsRow}>
          {[1, 2, 3].map((key) => (
            <View key={key} style={styles.statTile}>
              <SkeletonLoader width={28} height={28} borderRadius={8} style={styles.skeletonIcon} />
              <SkeletonLoader width={50} height={14} borderRadius={4} style={styles.skeletonValue} />
              <SkeletonLoader width={60} height={10} borderRadius={3} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.cardContainer}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[typography.h3, styles.cardTitle]}>Sales Trend</Text>
      </View>

      {/* 3 Top Summary Stat Cards (1x3 Row) */}
      <View style={styles.topStatsRow}>
        {/* Card 1: Total Amount */}
        <View style={styles.statTile}>
          <View style={[styles.iconBox, styles.bgGreyTint]}>
            <VectorIcon name="store" size={14} color={colors.text.secondary} />
          </View>
          <Text style={[typography.bodyMedium, styles.statValue]}>{totalAmount}</Text>
          <Text style={[typography.caption, styles.statLabel]}>Total Amount</Text>
        </View>

        {/* Card 2: Total Orders */}
        <View style={styles.statTile}>
          <View style={[styles.iconBox, styles.bgGreenTint]}>
            <VectorIcon name="user" size={14} color={colors.chart.turquoise} />
          </View>
          <Text style={[typography.bodyMedium, styles.statValue]}>{totalOrders}</Text>
          <Text style={[typography.caption, styles.statLabel]}>Total Orders</Text>
        </View>

        {/* Card 3: Average Order Amount */}
        <View style={styles.statTile}>
          <View style={[styles.iconBox, styles.bgGreyTint]}>
            <VectorIcon name="arrow-right" size={14} color={colors.text.secondary} />
          </View>
          <Text style={[typography.bodyMedium, styles.statValue]}>{avgOrderAmount}</Text>
          <Text style={[typography.caption, styles.statLabel]}>Average Order Amount</Text>
        </View>
      </View>

      {/* Hourly Sales Bar Chart Body — strictly contained within widget container */}
      <View style={styles.chartBody}>
        <BarChart
          data={chartBarData}
          barWidth={12}
          initialSpacing={6}
          spacing={10}
          barBorderRadius={4}
          showGradient={false}
          yAxisTextStyle={styles.axisText}
          xAxisLabelTextStyle={styles.axisText}
          yAxisColor={colors.neutral.gray300}
          xAxisColor={colors.neutral.gray700}
          rulesColor={colors.neutral.gray100}
          noOfSections={4}
          maxValue={40000}
          height={120}
          isAnimated
          animationDuration={800}
        />
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
  topStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statTile: {
    flex: 1,
    backgroundColor: colors.neutral.gray50,
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  bgGreyTint: {
    backgroundColor: colors.neutral.gray100,
  },
  bgGreenTint: {
    backgroundColor: colors.chart.greenBg,
  },
  statValue: {
    fontSize: 13,
    color: colors.text.primary,
    fontWeight: fontWeights.bold,
    marginBottom: 2,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  chartBody: {
    alignItems: 'center',
    paddingTop: 8,
    overflow: 'hidden',
    width: '100%',
  },
  axisText: {
    fontSize: 8.5,
    color: colors.text.muted,
  },
  skeletonIcon: {
    marginBottom: 6,
  },
  skeletonValue: {
    marginBottom: 4,
  },
});

export default SalesTrendCard;
