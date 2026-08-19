import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { IconName, VectorIcon } from '../common/VectorIcon';
import { GradientCardHeader } from '../common/GradientCardHeader';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { useTheme } from '../../context/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { Colors } from '../../styles/colors';
import { typography, fontWeights } from '../../styles/typography';
import { ScreenMetrics, moderateScale, scale } from '../../utils/responsive';

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

// The API's method name is free-form ("Cash", "Card", "Online", "Bank Transfer", ...) — match by
// keyword rather than an exact list so unseen method names still get a sensible icon.
function getPaymentIconName(methodName: string): IconName {
  const label = methodName.toLowerCase();
  if (label.includes('cash')) return 'cash';
  if (label.includes('card')) return 'credit-card';
  return 'wallet';
}

export function PaymentBreakdownCard({
  totalAmount = '38.1K',
  legend,
  pieData,
  isLoading = false,
}: PaymentBreakdownCardProps): React.JSX.Element {
  const { colors } = useTheme();
  const metrics = useResponsive();
  const styles = useMemo(() => createStyles(colors, metrics), [colors, metrics]);

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
      <View style={styles.cardShadowWrapper}>
        <View style={styles.cardContainer}>
          <View style={styles.headerRow}>
            <SkeletonLoader width={140} height={18} borderRadius={4} />
            <SkeletonLoader width={80} height={12} borderRadius={3} />
          </View>
          <View style={styles.body}>
            <View style={styles.centerChartWrapper}>
              <SkeletonLoader width={90} height={90} shape="circle" />
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.cardShadowWrapper}>
      <View style={styles.cardContainer}>
        <GradientCardHeader
          title="Payment Breakdown"
          subtitle={`${activeLegend.length} payment method${activeLegend.length === 1 ? '' : 's'}`}
          icon="wallet"
        />

        <View style={styles.body}>
          {/* Center Donut Chart */}
          <View style={styles.centerChartWrapper}>
            <PieChart
              data={chartData}
              donut
              radius={scale(64, metrics)}
              innerRadius={scale(30, metrics)}
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
                      <VectorIcon name={getPaymentIconName(item.name)} size={14} color={item.color || colors.chart.green} />
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
      </View>
    </View>
  );
}

const createStyles = (colors: Colors, metrics: ScreenMetrics) => {
  const cashIconBoxSize = scale(26, metrics);

  return StyleSheet.create({
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
    centerChartWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: scale(12, metrics),
    },
    centerBadge: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    centerSub: {
      fontSize: moderateScale(10, 0.3, metrics),
      color: colors.text.muted,
    },
    centerText: {
      fontSize: moderateScale(13.5, 0.3, metrics),
      color: colors.text.primary,
      fontWeight: fontWeights.bold,
    },
    progressCard: {
      backgroundColor: colors.neutral.gray50,
      borderRadius: moderateScale(14, 0.5, metrics),
      padding: moderateScale(12, 0.5, metrics),
      marginTop: scale(8, metrics),
      shadowColor: colors.neutral.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    progressHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: scale(8, metrics),
    },
    leftGroup: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    cashIconBox: {
      width: cashIconBoxSize,
      height: cashIconBoxSize,
      borderRadius: moderateScale(6, 0.5, metrics),
      backgroundColor: colors.chart.greenBg,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: scale(8, metrics),
    },
    methodName: {
      fontSize: moderateScale(13.5, 0.3, metrics),
      color: colors.text.primary,
      fontWeight: fontWeights.semiBold,
    },
    amountPercentage: {
      fontSize: moderateScale(13, 0.3, metrics),
      color: colors.chart.green,
      fontWeight: fontWeights.bold,
    },
    progressTrack: {
      width: '100%',
      height: scale(4, metrics),
      borderRadius: moderateScale(2, 0.5, metrics),
      backgroundColor: colors.neutral.gray200,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: colors.chart.green,
      borderRadius: moderateScale(2, 0.5, metrics),
    },
    emptyText: {
      fontSize: moderateScale(12, 0.3, metrics),
      color: colors.text.muted,
      textAlign: 'center',
      paddingVertical: scale(8, metrics),
    },
  });
};

export default PaymentBreakdownCard;
