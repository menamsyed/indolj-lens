import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { VectorIcon, IconName } from '../common/VectorIcon';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { useTheme } from '../../context/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { Colors } from '../../styles/colors';
import { typography, fontWeights } from '../../styles/typography';
import { ScreenMetrics, moderateScale, scale } from '../../utils/responsive';

export interface OrderChannelItem {
  key: string;
  label: string;
  count: number;
  percentage: number;
}

export interface OrderInsightsCardProps {
  totalOrders?: number;
  totalCustomers?: number;
  channels?: OrderChannelItem[];
  isLoading?: boolean;
}

const getChannelStyleMap = (colors: Colors): Record<string, { icon: IconName; color: string; bg: string }> => ({
  dinein: { icon: 'utensils', color: colors.chart.purple, bg: colors.chart.purpleBg },
  takeaway: { icon: 'store', color: colors.chart.purple, bg: colors.chart.purpleBg },
  delivery: { icon: 'cart', color: colors.chart.blue, bg: colors.chart.blueBg },
  pickup: { icon: 'bowl', color: colors.chart.teal, bg: colors.chart.greenBg },
});

const DEFAULT_CHANNELS: OrderChannelItem[] = [
  { key: 'takeaway', label: 'Takeaway', count: 4, percentage: 100 },
];

export function OrderInsightsCard({
  totalOrders = 4,
  totalCustomers = 0,
  channels = DEFAULT_CHANNELS,
  isLoading = false,
}: OrderInsightsCardProps): React.JSX.Element {
  const { colors } = useTheme();
  const metrics = useResponsive();
  const styles = useMemo(() => createStyles(colors, metrics), [colors, metrics]);
  const channelStyleMap = useMemo(() => getChannelStyleMap(colors), [colors]);
  const defaultChannelStyle = { icon: 'grid' as IconName, color: colors.text.muted, bg: colors.neutral.gray100 };

  const renderCenterLabel = (totalOrdersCount: number) => () => (
    <View style={styles.centerBadge}>
      <Text style={[typography.h3, styles.centerValue]}>{totalOrdersCount}</Text>
      <Text style={[typography.caption, styles.centerSub]}>Orders</Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.cardContainer}>
        <View style={styles.headerRow}>
          <SkeletonLoader width={120} height={18} borderRadius={4} />
          <SkeletonLoader width={100} height={12} borderRadius={3} />
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <SkeletonLoader width={32} height={32} borderRadius={8} style={styles.skeletonIcon} />
            <SkeletonLoader width={40} height={20} borderRadius={4} style={styles.skeletonValue} />
            <SkeletonLoader width={60} height={11} borderRadius={3} />
          </View>
          <View style={styles.statCard}>
            <SkeletonLoader width={32} height={32} borderRadius={8} style={styles.skeletonIcon} />
            <SkeletonLoader width={40} height={20} borderRadius={4} style={styles.skeletonValue} />
            <SkeletonLoader width={60} height={11} borderRadius={3} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.cardContainer}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[typography.h3, styles.cardTitle]}>Order Insights</Text>
      </View>

      {channels.length > 0 && (
        <View style={styles.centerChartWrapper}>
          <PieChart
            data={channels.map((c) => ({
              value: c.count,
              color: (channelStyleMap[c.key] || defaultChannelStyle).color,
              text: c.label,
            }))}
            donut
            radius={54}
            innerRadius={38}
            innerCircleColor={colors.surface.card}
            centerLabelComponent={renderCenterLabel(totalOrders)}
            isAnimated
            animationDuration={800}
          />
        </View>
      )}

      {/* 2 Top Stat Cards (Total Orders vs Total Customers) */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={[styles.iconSquare, styles.bgGreenTint]}>
            <VectorIcon name="file-text" size={16} color={colors.chart.green} />
          </View>
          <Text style={[typography.greetingTitle, styles.statValue]}>{totalOrders}</Text>
          <Text style={[typography.caption, styles.statLabel]}>Total Orders</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.iconSquare, styles.bgBlueTint]}>
            <VectorIcon name="user" size={16} color={colors.chart.blue} />
          </View>
          <Text style={[typography.greetingTitle, styles.statValue]}>{totalCustomers}</Text>
          <Text style={[typography.caption, styles.statLabel]}>Total Customers</Text>
        </View>
      </View>

      {/* By-Type Breakdown */}
      {channels.length > 0 ? (
        channels.map((channel) => {
          const style = channelStyleMap[channel.key] || defaultChannelStyle;
          return (
            <View key={channel.key} style={styles.channelProgressSection}>
              <View style={styles.channelHeader}>
                <View style={styles.channelLeft}>
                  <View style={[styles.channelIconBox, { backgroundColor: style.bg }]}>
                    <VectorIcon name={style.icon} size={14} color={style.color} />
                  </View>
                  <Text style={[typography.bodyMedium, styles.channelName]}>{channel.label}</Text>
                </View>
                <Text style={[typography.bodyMedium, styles.channelPercentage]}>
                  {channel.count} · {channel.percentage}%
                </Text>
              </View>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.min(channel.percentage, 100)}%`, backgroundColor: style.color },
                  ]}
                />
              </View>
            </View>
          );
        })
      ) : (
        <Text style={[typography.caption, styles.emptyText]}>No order-type data for this period.</Text>
      )}
    </View>
  );
}

const createStyles = (colors: Colors, metrics: ScreenMetrics) => {
  const iconSquareSize = scale(32, metrics);
  const channelIconBoxSize = scale(26, metrics);

  return StyleSheet.create({
    cardContainer: {
      backgroundColor: colors.surface.card,
      borderRadius: moderateScale(20, 0.5, metrics),
      padding: moderateScale(16, 0.5, metrics),
      marginBottom: scale(16, metrics),
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
      marginBottom: scale(14, metrics),
    },
    cardTitle: {
      fontSize: moderateScale(14, 0.3, metrics),
      color: colors.text.primary,
    },
    subtitleText: {
      fontSize: moderateScale(11, 0.3, metrics),
      color: colors.text.muted,
    },
    statsRow: {
      flexDirection: 'row',
      gap: scale(10, metrics),
      marginBottom: scale(16, metrics),
    },
    statCard: {
      // Explicit flexGrow/flexShrink/flexBasis (not the `flex: 1` shorthand) + minWidth:
      // 0 — same fix as BranchSummaryCard.tsx's tileCard. "Total Orders" and "Total
      // Customers" are different lengths, so without this the longer label's content
      // width becomes a floor that squeezes the other stat card unevenly.
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 0,
      minWidth: 0,
      backgroundColor: colors.neutral.gray50,
      borderRadius: moderateScale(14, 0.5, metrics),
      padding: moderateScale(14, 0.5, metrics),
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    iconSquare: {
      width: iconSquareSize,
      height: iconSquareSize,
      borderRadius: moderateScale(8, 0.5, metrics),
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: scale(6, metrics),
    },
    bgGreenTint: {
      backgroundColor: colors.chart.greenBg,
    },
    bgBlueTint: {
      backgroundColor: colors.chart.blueBg,
    },
    statValue: {
      fontSize: moderateScale(22, 0.3, metrics),
      color: colors.text.primary,
      fontWeight: fontWeights.bold,
      marginBottom: scale(2, metrics),
    },
    statLabel: {
      color: colors.text.secondary,
      textAlign: 'center',
    },
    centerChartWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: scale(16, metrics),
    },
    centerBadge: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    centerValue: {
      fontSize: moderateScale(16, 0.3, metrics),
      color: colors.text.primary,
      fontWeight: fontWeights.bold,
    },
    centerSub: {
      fontSize: moderateScale(10, 0.3, metrics),
      color: colors.text.muted,
    },
    channelProgressSection: {
      backgroundColor: colors.neutral.gray50,
      borderRadius: moderateScale(14, 0.5, metrics),
      padding: moderateScale(12, 0.5, metrics),
      borderWidth: 1,
      borderColor: colors.border.light,
      marginBottom: scale(8, metrics),
    },
    channelHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: scale(8, metrics),
    },
    channelLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    channelIconBox: {
      width: channelIconBoxSize,
      height: channelIconBoxSize,
      borderRadius: moderateScale(6, 0.5, metrics),
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: scale(8, metrics),
    },
    channelName: {
      fontSize: moderateScale(13.5, 0.3, metrics),
      color: colors.text.primary,
      fontWeight: fontWeights.semiBold,
    },
    channelPercentage: {
      fontSize: moderateScale(13, 0.3, metrics),
      color: colors.brand.primary,
      fontWeight: fontWeights.bold,
    },
    progressTrack: {
      width: '100%',
      height: scale(6, metrics),
      borderRadius: moderateScale(3, 0.5, metrics),
      backgroundColor: colors.neutral.gray200,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      borderRadius: moderateScale(3, 0.5, metrics),
    },
    emptyText: {
      fontSize: moderateScale(12, 0.3, metrics),
      color: colors.text.muted,
      textAlign: 'center',
      paddingVertical: scale(8, metrics),
    },
    skeletonIcon: {
      marginBottom: scale(6, metrics),
    },
    skeletonValue: {
      marginBottom: scale(4, metrics),
    },
  });
};

export default OrderInsightsCard;
