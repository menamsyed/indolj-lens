import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';
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
  parties?: PartyChannelItem[];
  isLoading?: boolean;
}

const DEFAULT_PARTIES: PartyChannelItem[] = [
  { name: 'Takeaway', salesValue: 'Rs.38,120.20', orders: 4, percentage: 100 },
];

/**
 * Calculates SVG arc path string for a donut slice given center, radii, and start/end angles in degrees.
 */
function getDonutSlicePath(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  startAngleDeg: number,
  endAngleDeg: number
): string {
  const sweep = endAngleDeg - startAngleDeg;
  if (sweep >= 359.99) {
    return [
      `M ${cx} ${cy - rOuter}`,
      `A ${rOuter} ${rOuter} 0 1 1 ${cx - 0.01} ${cy - rOuter}`,
      `M ${cx} ${cy - rInner}`,
      `A ${rInner} ${rInner} 0 1 0 ${cx - 0.01} ${cy - rInner}`,
      `Z`,
    ].join(' ');
  }

  const startRad = (startAngleDeg - 90) * (Math.PI / 180);
  const endRad = (endAngleDeg - 90) * (Math.PI / 180);

  const x1Outer = cx + rOuter * Math.cos(startRad);
  const y1Outer = cy + rOuter * Math.sin(startRad);
  const x2Outer = cx + rOuter * Math.cos(endRad);
  const y2Outer = cy + rOuter * Math.sin(endRad);

  const x1Inner = cx + rInner * Math.cos(startRad);
  const y1Inner = cy + rInner * Math.sin(startRad);
  const x2Inner = cx + rInner * Math.cos(endRad);
  const y2Inner = cy + rInner * Math.sin(endRad);

  const largeArcFlag = sweep > 180 ? 1 : 0;

  return [
    `M ${x1Outer} ${y1Outer}`,
    `A ${rOuter} ${rOuter} 0 ${largeArcFlag} 1 ${x2Outer} ${y2Outer}`,
    `L ${x2Inner} ${y2Inner}`,
    `A ${rInner} ${rInner} 0 ${largeArcFlag} 0 ${x1Inner} ${y1Inner}`,
    `Z`,
  ].join(' ');
}

interface ComputedCallout {
  party: PartyChannelItem;
  color: string;
  pathD: string;
  p1X: number;
  p1Y: number;
  elbowX: number;
  elbowY: number;
  resolvedY: number;
  isRight: boolean;
}

export function PartyWiseSalesCard({
  parties = DEFAULT_PARTIES,
  isLoading = false,
}: PartyWiseSalesCardProps): React.JSX.Element {
  const { colors, isDarkMode } = useTheme();
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

  // Larger outer donut (R_OUTER = 48), smaller inner hole (R_INNER = 18), smaller compact label font (8.5px)
  const donutData = useMemo(() => {
    const totalVal = activeParties.reduce(
      (sum, p) => sum + (p.percentage > 0 ? p.percentage : p.orders || 1),
      0
    );
    if (totalVal <= 0) return { slices: [], svgWidth: 300, svgHeight: 180 };

    const SVG_WIDTH = 300;
    const SVG_HEIGHT = 180;
    const CX = 150;
    const CY = 90;
    const R_OUTER = 48;
    const R_INNER = 18;

    let currentAngle = 0;

    const rawSlices: ComputedCallout[] = activeParties.map((party, index) => {
      const val = party.percentage > 0 ? party.percentage : party.orders || 1;
      const sweepAngle = (val / totalVal) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sweepAngle;
      const midAngle = startAngle + sweepAngle / 2;
      currentAngle = endAngle;

      const pathD = getDonutSlicePath(CX, CY, R_OUTER, R_INNER, startAngle, endAngle);
      const color = partyColors[index % partyColors.length];

      const midRad = (midAngle - 90) * (Math.PI / 180);
      const p1X = CX + R_OUTER * Math.cos(midRad);
      const p1Y = CY + R_OUTER * Math.sin(midRad);

      const elbowDist = R_OUTER + 12;
      const elbowX = CX + elbowDist * Math.cos(midRad);
      const elbowY = CY + elbowDist * Math.sin(midRad);
      const isRight = elbowX >= CX;

      return {
        party,
        color,
        pathD,
        p1X,
        p1Y,
        elbowX,
        elbowY,
        resolvedY: elbowY,
        isRight,
      };
    });

    // Vertical collision resolution algorithm
    const resolveSide = (items: ComputedCallout[], minYGap = 14) => {
      if (items.length <= 1) return;
      items.sort((a, b) => a.elbowY - b.elbowY);
      for (let i = 1; i < items.length; i++) {
        if (items[i].resolvedY < items[i - 1].resolvedY + minYGap) {
          items[i].resolvedY = items[i - 1].resolvedY + minYGap;
        }
      }
    };

    const rightItems = rawSlices.filter((s) => s.isRight);
    const leftItems = rawSlices.filter((s) => !s.isRight);

    resolveSide(rightItems);
    resolveSide(leftItems);

    const finalSlices = rawSlices.map((slice) => {
      const tailLen = 8;
      const tailX = slice.isRight ? slice.elbowX + tailLen : slice.elbowX - tailLen;
      const pointerPath = `M ${slice.p1X} ${slice.p1Y} L ${slice.elbowX} ${slice.resolvedY} L ${tailX} ${slice.resolvedY}`;
      const textX = slice.isRight ? tailX + 3 : tailX - 3;
      const textY = slice.resolvedY + 3;
      const textAnchor = slice.isRight ? 'start' : 'end';
      const labelText = `${slice.party.name}: ${slice.party.percentage}%`;

      return {
        ...slice,
        pointerPath,
        textX,
        textY,
        textAnchor,
        labelText,
      };
    });

    return { slices: finalSlices, svgWidth: SVG_WIDTH, svgHeight: SVG_HEIGHT };
  }, [activeParties, partyColors]);

  if (isLoading) {
    return (
      <View style={styles.cardContainer}>
        <View style={styles.headerRow}>
          <SkeletonLoader width={140} height={18} borderRadius={4} />
        </View>
        <View style={styles.centerChartWrapper}>
          <SkeletonLoader width={100} height={100} shape="circle" />
        </View>
      </View>
    );
  }

  const pointerLineColor = isDarkMode ? '#8E8E93' : '#A0A4AC';
  const labelTextColor = isDarkMode ? colors.text.white : colors.text.primary;

  return (
    <View style={styles.cardContainer}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[typography.h3, styles.cardTitle]}>Party wise Sales</Text>
      </View>

      {/* Custom SVG Donut Chart with Larger Outer Ring, Smaller Inner Hole & Compact 8.5px Labels */}
      {donutData.slices.length > 0 && (
        <View style={styles.centerChartWrapper}>
          <Svg
            width={donutData.svgWidth}
            height={donutData.svgHeight}
            viewBox={`0 0 ${donutData.svgWidth} ${donutData.svgHeight}`}
          >
            <G>
              {/* Donut Slices */}
              {donutData.slices.map((slice) => (
                <Path key={slice.party.name} d={slice.pathD} fill={slice.color} />
              ))}

              {/* Callout Pointer Lines & Compact Labels */}
              {donutData.slices.map((slice) => (
                <G key={`line-${slice.party.name}`}>
                  <Path
                    d={slice.pointerPath}
                    stroke={pointerLineColor}
                    strokeWidth={1}
                    fill="none"
                  />
                  <SvgText
                    x={slice.textX}
                    y={slice.textY}
                    fill={labelTextColor}
                    fontSize={8.5}
                    fontWeight="500"
                    textAnchor={slice.textAnchor as any}
                  >
                    {slice.labelText}
                  </SvgText>
                </G>
              ))}
            </G>
          </Svg>
        </View>
      )}

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
  );
}

const createStyles = (colors: Colors, metrics: ScreenMetrics) => {
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
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: scale(10, metrics),
    },
    cardTitle: {
      fontSize: moderateScale(14, 0.3, metrics),
      color: colors.text.primary,
    },
    channelCountText: {
      fontSize: moderateScale(12, 0.3, metrics),
      color: colors.text.muted,
    },
    centerChartWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: scale(4, metrics),
      width: '100%',
    },
    partyProgressCard: {
      backgroundColor: colors.neutral.gray50,
      borderRadius: moderateScale(14, 0.5, metrics),
      padding: moderateScale(12, 0.5, metrics),
      borderWidth: 1,
      borderColor: colors.border.light,
      marginTop: scale(10, metrics),
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
      height: scale(6, metrics),
      borderRadius: moderateScale(3, 0.5, metrics),
      backgroundColor: colors.neutral.gray200,
      overflow: 'hidden',
      marginBottom: scale(6, metrics),
    },
    progressBarFill: {
      height: '100%',
      borderRadius: moderateScale(3, 0.5, metrics),
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
