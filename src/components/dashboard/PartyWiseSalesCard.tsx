import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { GradientCardHeader } from '../common/GradientCardHeader';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { useTheme } from '../../context/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { Colors } from '../../styles/colors';
import { typography, fontWeights } from '../../styles/typography';
import { ScreenMetrics, moderateScale, scale } from '../../utils/responsive';

export interface PartyChannelItem {
  name: string;
  salesValue: string;
  orders: number;
  percentage: number;
}

export interface PartyWiseSalesCardProps {
  totalAmount?: string;
  parties?: PartyChannelItem[];
  isLoading?: boolean;
}

const DEFAULT_PARTIES: PartyChannelItem[] = [
  { name: 'Takeaway', salesValue: 'Rs.38,120.20', orders: 4, percentage: 100 },
];

export function PartyWiseSalesCard({
  totalAmount = '0',
  parties = DEFAULT_PARTIES,
  isLoading = false,
}: PartyWiseSalesCardProps): React.JSX.Element {
  const { colors } = useTheme();
  const metrics = useResponsive();
  const styles = useMemo(() => createStyles(colors, metrics), [colors, metrics]);

  // Color palette for multiple party slices
  const partyColors = useMemo(
    () => [
      colors.chart.blue,    // #2980B9
      colors.chart.teal,    // #1ABC9C
      colors.chart.orange,  // #F39C12
      colors.chart.amber,   // #D35400
      colors.chart.green,   // #27AE60
      colors.chart.purple,  // #8E44AD
    ],
    [colors]
  );

  const activeParties = useMemo(
    () => (parties && parties.length > 0 ? parties : DEFAULT_PARTIES),
    [parties]
  );

  // Same plain, unlabeled donut (react-native-gifted-charts PieChart) as PaymentBreakdownCard —
  // a colored ring with a center total badge, no per-slice callouts/labels.
  const pieData = useMemo(
    () =>
      activeParties.map((party, index) => ({
        value: party.percentage > 0 ? party.percentage : party.orders || 1,
        color: partyColors[index % partyColors.length],
      })),
    [activeParties, partyColors]
  );

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
          </View>
          <View style={styles.body}>
            <View style={styles.centerChartWrapper}>
              <SkeletonLoader width={100} height={100} shape="circle" />
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
          title="Party wise Sales"
          subtitle={`${activeParties.length} channel${activeParties.length === 1 ? '' : 's'}`}
          icon="pie-chart"
        />

        <View style={styles.body}>
          {/* Center Donut Chart — same plain ring + center total badge as PaymentBreakdownCard */}
          <View style={styles.centerChartWrapper}>
            <PieChart
              data={pieData}
              donut
              radius={scale(64, metrics)}
              innerRadius={scale(30, metrics)}
              innerCircleColor={colors.surface.card}
              centerLabelComponent={renderCenterBadge(totalAmount)}
              isAnimated
              animationDuration={800}
            />
          </View>

          {/* Breakdown List for each Party Channel */}
          {activeParties.length > 0 ? (
            activeParties.map((party, index) => {
              const accentColor = partyColors[index % partyColors.length];
              return (
                <View key={party.name} style={styles.partyProgressCard}>
                  <View style={styles.partyHeader}>
                    <View style={styles.leftGroup}>
                      <View style={[styles.colorDot, { backgroundColor: accentColor }]} />
                      <Text style={[typography.bodyMedium, styles.partyName]}>{party.name}</Text>
                    </View>

                    <View style={styles.rightGroup}>
                      <Text style={[typography.bodyMedium, styles.partySalesValue]}>
                        {party.salesValue}
                      </Text>
                    </View>
                  </View>

                  {/* Progress bar track */}
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${Math.min(party.percentage, 100)}%`,
                          backgroundColor: accentColor,
                        },
                      ]}
                    />
                  </View>

                  {/* Sub Info Row (Orders & Percentage) */}
                  <View style={styles.partySubRow}>
                    <Text style={[typography.caption, styles.orderBadgeText]}>
                      {party.orders} {party.orders === 1 ? 'Order' : 'Orders'}
                    </Text>
                    <Text style={[typography.caption, styles.percentageText, { color: accentColor }]}>
                      {party.percentage}% Share
                    </Text>
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={[typography.caption, styles.emptyText]}>No party-wise data for this period.</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: Colors, metrics: ScreenMetrics) => {
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
      alignItems: 'center',
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
    partyProgressCard: {
      backgroundColor: colors.neutral.gray50,
      borderRadius: moderateScale(14, 0.5, metrics),
      padding: moderateScale(12, 0.5, metrics),
      marginTop: scale(10, metrics),
      shadowColor: colors.neutral.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    partyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: scale(8, metrics),
    },
    leftGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(8, metrics),
    },
    colorDot: {
      width: scale(10, metrics),
      height: scale(10, metrics),
      borderRadius: scale(5, metrics),
    },
    partyName: {
      fontSize: moderateScale(13.5, 0.3, metrics),
      color: colors.text.primary,
      fontWeight: fontWeights.semiBold,
    },
    rightGroup: {
      alignItems: 'flex-end',
    },
    partySalesValue: {
      fontSize: moderateScale(13.5, 0.3, metrics),
      color: colors.text.primary,
      fontWeight: fontWeights.bold,
    },
    progressTrack: {
      width: '100%',
      height: scale(4, metrics),
      borderRadius: moderateScale(2, 0.5, metrics),
      backgroundColor: colors.neutral.gray200,
      overflow: 'hidden',
      marginBottom: scale(6, metrics),
    },
    progressBarFill: {
      height: '100%',
      borderRadius: moderateScale(2, 0.5, metrics),
    },
    partySubRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    orderBadgeText: {
      fontSize: moderateScale(11.5, 0.3, metrics),
      color: colors.text.muted,
    },
    percentageText: {
      fontSize: moderateScale(11.5, 0.3, metrics),
      fontWeight: fontWeights.bold,
    },
    emptyText: {
      fontSize: moderateScale(12, 0.3, metrics),
      color: colors.text.muted,
      textAlign: 'center',
      paddingVertical: scale(8, metrics),
    },
  });
};

export default PartyWiseSalesCard;
