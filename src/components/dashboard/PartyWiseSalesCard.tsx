import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { CircularProgress } from '../common/CircularProgress';
import { GradientCardHeader } from '../common/GradientCardHeader';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { VectorIcon, IconName } from '../common/VectorIcon';
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

// Same normalized-key convention as OrderInsightsCard's getChannelStyleMap ('dinein',
// 'takeaway', ...), keyed off the party's own display name since PartyChannelItem has no
// separate `key` field. Unrecognized/future channel names fall back to 'grid', matching that
// same card's fallback.
const PARTY_ICON_MAP: Record<string, IconName> = {
  dinein: 'utensils',
  takeaway: 'store',
  website: 'globe',
  online: 'globe',
  foodpanda: 'cart',
  delivery: 'cart',
  pickup: 'bowl',
};

const getPartyIcon = (name: string): IconName =>
  PARTY_ICON_MAP[name.trim().toLowerCase().replace(/\s+/g, '')] ?? 'grid';

// Splits a flat list into fixed-size-2 rows so the grid below can render an explicit
// `flexDirection: 'row'` per pair instead of a wrapping percentage-width grid — same
// technique as SalesOverviewCard's chunkPairs, guarantees exactly two columns on every
// screen size regardless of how many party channels the API returns.
function chunkPairs<T>(items: T[]): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }
  return rows;
}

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
            <View style={styles.metricsGrid}>
              {chunkPairs([1, 2, 3, 4]).map((row, rowIndex) => (
                <View key={rowIndex} style={styles.metricsRow}>
                  {row.map((key) => (
                    <View key={key} style={styles.partyTile}>
                      <SkeletonLoader width={44} height={44} shape="circle" style={styles.skeletonRing} />
                      <SkeletonLoader width={60} height={11} borderRadius={3} style={styles.skeletonLabel} />
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

          {/* Breakdown Grid for each Party Channel — two tiles per row (same geometry as
              SalesOverviewCard's metricTile grid), each with its own circular progress ring
              (share of the total) and Label / Value / Orders stacked below it. */}
          {activeParties.length > 0 ? (
            <View style={styles.metricsGrid}>
              {chunkPairs(activeParties.map((party, index) => ({ party, index }))).map((row, rowIndex) => (
                <View key={rowIndex} style={styles.metricsRow}>
                  {row.map(({ party, index }) => {
                    const accentColor = partyColors[index % partyColors.length];
                    const clampedShare = Math.min(Math.max(party.percentage, 0), 100);

                    return (
                      <View key={party.name} style={styles.partyTile}>
                        <CircularProgress
                          percentage={clampedShare}
                          size={scale(44, metrics)}
                          strokeWidth={scale(6, metrics)}
                          color={accentColor}
                          trackColor={colors.neutral.gray200}
                          animationDuration={600}
                        >
                          <Text style={[styles.ringPercentText, { color: accentColor }]}>
                            {Math.round(clampedShare)}%
                          </Text>
                        </CircularProgress>

                        <View style={styles.labelRow}>
                          <VectorIcon name={getPartyIcon(party.name)} size={12} color={accentColor} strokeWidth={2} />
                          <Text style={[typography.caption, styles.partyName]} numberOfLines={1}>
                            {party.name}
                          </Text>
                        </View>
                        <Text style={[typography.h3, styles.partySalesValue]} numberOfLines={1} adjustsFontSizeToFit>
                          {party.salesValue}
                        </Text>
                        <Text style={[typography.caption, styles.orderCountText]} numberOfLines={1}>
                          {party.orders} {party.orders === 1 ? 'order' : 'orders'}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
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
    metricsGrid: {
      marginTop: scale(6, metrics),
      gap: scale(10, metrics),
    },
    metricsRow: {
      flexDirection: 'row',
      gap: scale(10, metrics),
    },
    partyTile: {
      // See SalesOverviewCard.tsx's metricTile for why this needs to be explicit rather
      // than the `flex: 1` shorthand: flexBasis: 0 forces the tile to grow purely by its
      // (equal) flexGrow ratio instead of its own content size, and minWidth: 0 stops a
      // long party name from re-imposing a content floor that would squeeze its sibling.
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 0,
      minWidth: 0,
      backgroundColor: colors.neutral.gray50,
      borderRadius: moderateScale(14, 0.5, metrics),
      padding: moderateScale(12, 0.5, metrics),
      alignItems: 'flex-start',
      shadowColor: colors.neutral.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    ringPercentText: {
      fontSize: moderateScale(9.5, 0.3, metrics),
      fontWeight: fontWeights.bold,
    },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(4, metrics),
      marginTop: scale(10, metrics),
      marginBottom: scale(2, metrics),
    },
    partyName: {
      flexShrink: 1,
      fontSize: moderateScale(12, 0.3, metrics),
      color: colors.text.secondary,
      fontWeight: fontWeights.medium,
    },
    partySalesValue: {
      fontSize: moderateScale(16, 0.3, metrics),
      color: colors.text.primary,
      fontWeight: fontWeights.bold,
      marginBottom: scale(2, metrics),
    },
    orderCountText: {
      fontSize: moderateScale(11.5, 0.3, metrics),
      color: colors.text.muted,
    },
    skeletonRing: {
      marginBottom: scale(10, metrics),
    },
    skeletonLabel: {
      marginBottom: scale(6, metrics),
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
