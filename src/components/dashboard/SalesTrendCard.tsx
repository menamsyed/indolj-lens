import React, { useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { VectorIcon } from '../common/VectorIcon';
import { GradientCardHeader } from '../common/GradientCardHeader';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { useTheme } from '../../context/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { Colors } from '../../styles/colors';
import { fontWeights, primaryFontFamily } from '../../styles/typography';
import { ScreenMetrics, moderateScale, scale, verticalScale } from '../../utils/responsive';
import { formatCurrency } from '../../utils/formatters';

export interface SalesTrendCardProps {
  totalAmount?: string;
  totalOrders?: number;
  avgOrderAmount?: string;
  barData?: { value: number; label: string; frontColor?: string }[];
  isLoading?: boolean;
}

// Shape of the per-bar objects we hand to BarChart's `data` — typed here since the library's
// own `renderTooltip`/`onPress` props are declared as bare `Function` and don't carry it.
interface BarChartItem {
  value: number;
  label: string;
  frontColor: string;
}

const CHART_WRAPPER_PADDING_H = 8;
const CHART_WRAPPER_PADDING_TOP = 48;

// Cap for the rare unusually-long value — BarChart's own `renderTooltip` + `autoCenterTooltip`
// handle everyday centering/positioning/scroll-following natively (see the BarChart props
// below), so this is just a safety net, not something we compute a position against ourselves.
const TOOLTIP_PILL_MAX_WIDTH = 90;
const TOOLTIP_TEXT_FONT_SIZE = 8;

const getDefaultBarData = () => [
  { value: 1271, label: '12:PM' },
  { value: 24785.35, label: '01:PM' },
  { value: 1196, label: '02:PM' },
  { value: 11231.4, label: '03:PM' },
  { value: 7751, label: '04:PM' },
];

// Y-axis value formatter (e.g. 79955 -> 80K, 24785 -> 25K, 0 -> 0)
function formatYAxisLabel(val: string): string {
  const num = parseFloat(val);
  if (isNaN(num) || num === 0) return '0';
  if (num >= 1000) return `${Math.round(num / 1000)}K`;
  return String(Math.round(num));
}

export function SalesTrendCard({
  totalAmount = 'Rs. 0',
  totalOrders = 0,
  avgOrderAmount = 'Rs. 0',
  barData,
  isLoading = false,
}: SalesTrendCardProps): React.JSX.Element {
  const { colors } = useTheme();
  const metrics = useResponsive();
  const styles = useMemo(() => createStyles(colors, metrics), [colors, metrics]);
  const defaultBars = useMemo(() => getDefaultBarData(), []);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  // Selected bar index — controls both the X-axis label's bold highlight below and, via
  // `focusedBarIndex` on <BarChart>, which bar's value tooltip the library shows.
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Filter out zero-value bars to eliminate all empty gaps between active sales hours
  const activeBarData = useMemo(() => {
    const rawData = barData && barData.length > 0 ? barData : defaultBars;
    const nonZeroBars = rawData.filter((d) => d.value > 0);
    return nonZeroBars.length > 0 ? nonZeroBars : rawData.slice(0, 5);
  }, [barData, defaultBars]);

  // Find peak non-zero sales bar
  const peakSalesVal = useMemo(
    () => Math.max(...activeBarData.map((d) => d.value), 0),
    [activeBarData]
  );

  // Map dataset into gifted-charts format using theme brand primary color
  const chartBarData = useMemo(() => {
    const activeColor = colors.brand.primary;

    return activeBarData.map((bar, idx) => {
      const isSelected = selectedIndex === idx;

      return {
        value: bar.value,
        label: bar.label,
        frontColor: activeColor,
        // -45 degree angled X-axis text label
        labelComponent: () => (
          <View style={styles.angledLabelContainer}>
            <Text
              style={[
                styles.angledLabelText,
                isSelected && { color: activeColor, fontWeight: fontWeights.bold },
              ]}
              numberOfLines={1}
            >
              {bar.label}
            </Text>
          </View>
        ),
      };
    });
  }, [activeBarData, selectedIndex, colors, styles]);

  // Y-axis (and bar heights) track the real peak value, with just a small 10% margin so the
  // tallest bar doesn't butt up flush against the very top rule line (e.g. peak 10 -> axis 11) —
  // not the old 35%-plus-round-number inflation that stretched the axis well past the real data.
  const maxValue = useMemo(
    () => (peakSalesVal > 0 ? Math.ceil(peakSalesVal * 1.1) : 10000),
    [peakSalesVal]
  );

  // BarChart's own dimensional props take raw pixel numbers — route them through the same
  // scale/verticalScale utilities the rest of this card's layout uses so the chart's proportions
  // actually track device size instead of staying pinned to one phone's pixel values.
  const chartDimensions = useMemo(() => ({
    barWidth: scale(20, metrics),
    spacing: scale(15, metrics),
    initialSpacing: scale(14, metrics),
    height: verticalScale(200, metrics),
    yAxisLabelWidth: scale(38, metrics),
    overflowTop: verticalScale(40, metrics),
    barRadius: moderateScale(4, 0.5, metrics),
  }), [metrics]);

  // The pressed-bar value tooltip: rendered via BarChart's own `renderTooltip` prop, not by us
  // positioning an overlay by hand. That native path renders inside the same scrollable content
  // as the bars (so it scrolls with them for free) and auto-centers over the bar via a real
  // onLayout measurement of our content (`autoCenterTooltip`) — see the BarChart props below.
  const renderBarTooltip = (item: BarChartItem): React.JSX.Element => (
    <View pointerEvents="none" style={styles.peakTooltipPill}>
      <Text style={styles.peakTooltipText}>{formatCurrency(item.value)}</Text>
    </View>
  );

  const handleBarPress = (_item: BarChartItem, index: number): void => {
    setSelectedIndex((current) => (current === index ? null : index));
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 0 && Math.abs(width - containerWidth) > 5) {
      setContainerWidth(width);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.cardShadowWrapper}>
        <View style={styles.cardContainer}>
          <View style={styles.headerRow}>
            <SkeletonLoader width={120} height={18} borderRadius={4} />
          </View>
          <View style={styles.body}>
            <View style={styles.topStatsRow}>
              {[1, 2, 3].map((key) => (
                <View key={key} style={styles.statTile}>
                  <SkeletonLoader width={28} height={28} borderRadius={14} style={styles.skeletonIcon} />
                  <SkeletonLoader width={50} height={14} borderRadius={4} style={styles.skeletonValue} />
                  <SkeletonLoader width={60} height={10} borderRadius={3} />
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
        <GradientCardHeader title="Sales Trend" subtitle="Hourly sales & orders" icon="chart" />

        <View style={styles.body} onLayout={onLayout}>
        {/* 3 Top Summary Stat Cards — Equal Width 3-Column Layout */}
        <View style={styles.topStatsRow}>
          {/* Card 1: Total Amount */}
          <View style={styles.statTile}>
            <View style={[styles.iconBox, styles.iconBgTotalAmount]}>
              <VectorIcon name="wallet" size={14} color={colors.chart.green} />
            </View>
            <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.65}>
              {totalAmount || 'Rs. 0'}
            </Text>
            <Text style={styles.statLabel} numberOfLines={2}>
              Total Amount
            </Text>
          </View>

          {/* Card 2: Total Orders */}
          <View style={styles.statTile}>
            <View style={[styles.iconBox, styles.iconBgTotalOrders]}>
              <VectorIcon name="cart" size={14} color={colors.chart.blue} />
            </View>
            <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.65}>
              {totalOrders}
            </Text>
            <Text style={styles.statLabel} numberOfLines={2}>
              Total Orders
            </Text>
          </View>

          {/* Card 3: Average Order Amount */}
          <View style={styles.statTile}>
            <View style={[styles.iconBox, styles.iconBgAvgOrder]}>
              <VectorIcon name="calculator" size={14} color={colors.chart.orange} />
            </View>
            <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.65}>
              {avgOrderAmount || 'Rs. 0'}
            </Text>
            <Text style={styles.statLabel} numberOfLines={2}>
              Average Order Amount
            </Text>
          </View>
        </View>

        {/* Contained Horizontally-Scrollable Bar Chart Body — shadow lives on the outer,
            un-clipped wrapper since a shadow on the same view as chartWrapper's
            `overflow: 'hidden'` (needed to clip bars/rules to the rounded corners) would get
            clipped away on iOS, same two-layer pattern as every other card in this file/app. */}
        <View style={styles.chartShadowWrapper}>
        <View style={styles.chartWrapper}>
          <BarChart
            data={chartBarData}
            barWidth={chartDimensions.barWidth}
            spacing={chartDimensions.spacing}
            initialSpacing={chartDimensions.initialSpacing}
            barBorderTopLeftRadius={chartDimensions.barRadius}
            barBorderTopRightRadius={chartDimensions.barRadius}
            showGradient={true}
            gradientColor={colors.neutral.gray50}
            yAxisTextStyle={styles.axisText}
            yAxisColor={colors.border.light}
            xAxisColor={colors.border.light}
            rulesColor={colors.border.light}
            rulesType="solid"
            noOfSections={4}
            maxValue={maxValue}
            height={chartDimensions.height}
            yAxisLabelWidth={chartDimensions.yAxisLabelWidth}
            formatYLabel={formatYAxisLabel}
            overflowTop={chartDimensions.overflowTop}
            isAnimated={false}
            renderTooltip={renderBarTooltip}
            autoCenterTooltip
            leftShiftForLastIndexTooltip={0}
            focusedBarIndex={selectedIndex ?? undefined}
            onPress={handleBarPress}
          />
        </View>
        </View>
      </View>
      </View>
    </View>
  );
}

const createStyles = (colors: Colors, metrics: ScreenMetrics) => {
  const iconBoxSize = scale(28, metrics);

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
    topStatsRow: {
      flexDirection: 'row',
      width: '100%',
      gap: scale(6, metrics),
      marginBottom: scale(16, metrics),
    },
    statTile: {
      flex: 1,
      minWidth: 0,
      backgroundColor: colors.neutral.gray50,
      borderRadius: moderateScale(14, 0.5, metrics),
      paddingVertical: moderateScale(10, 0.5, metrics),
      paddingHorizontal: scale(4, metrics),
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.neutral.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    // Same container shape (size + radius) for all three stat tiles — only the background/icon
    // color differs per card, same convention as SalesOverviewCard's per-metric icon tiles.
    iconBox: {
      width: iconBoxSize,
      height: iconBoxSize,
      borderRadius: moderateScale(8, 0.5, metrics),
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: scale(6, metrics),
    },
    iconBgTotalAmount: {
      backgroundColor: colors.chart.greenBg,
    },
    iconBgTotalOrders: {
      backgroundColor: colors.chart.blueBg,
    },
    iconBgAvgOrder: {
      backgroundColor: colors.chart.orangeBg,
    },
    statValue: {
      fontFamily: primaryFontFamily,
      fontSize: moderateScale(10.5, 0.3, metrics),
      fontWeight: fontWeights.bold,
      color: colors.text.primary,
      lineHeight: moderateScale(14, 0.3, metrics),
      marginBottom: scale(2, metrics),
      textAlign: 'center',
      width: '100%',
    },
    statLabel: {
      fontFamily: primaryFontFamily,
      fontSize: moderateScale(8.5, 0.3, metrics),
      fontWeight: fontWeights.medium,
      color: colors.text.secondary,
      lineHeight: moderateScale(11.5, 0.3, metrics),
      textAlign: 'center',
      width: '100%',
    },
    // Same two-layer split as cardShadowWrapper/cardContainer above: shadow on this un-clipped
    // outer view, background/radius/overflow-clipping on the inner one — a shadow on the same
    // view as chartWrapper's `overflow: 'hidden'` would get clipped away on iOS.
    chartShadowWrapper: {
      width: '100%',
      borderRadius: moderateScale(16, 0.5, metrics),
      shadowColor: colors.neutral.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    chartWrapper: {
      width: '100%',
      backgroundColor: colors.neutral.gray50,
      borderRadius: moderateScale(16, 0.5, metrics),
      paddingTop: verticalScale(CHART_WRAPPER_PADDING_TOP, metrics),
      paddingBottom: verticalScale(45, metrics),
      paddingHorizontal: scale(CHART_WRAPPER_PADDING_H, metrics),
      // Clip the whole chart (bars, rules, gridlines) to this rounded container. The pressed-bar
      // tooltip no longer needs this to be 'visible' — it renders via BarChart's own native
      // `renderTooltip`, positioned within the chart's own reserved `overflowTop` clearance, not
      // as a sibling overlay of ours that could get cut off here.
      overflow: 'hidden',
    },
    axisText: {
      fontFamily: primaryFontFamily,
      fontSize: moderateScale(8.5, 0.3, metrics),
      color: colors.text.muted,
    },
    angledLabelContainer: {
      width: scale(36, metrics),
      height: scale(28, metrics),
      marginTop: scale(4, metrics),
      marginLeft: scale(-8, metrics),
      transform: [{ rotate: '-45deg' }],
      alignItems: 'flex-start',
      justifyContent: 'center',
    },
    angledLabelText: {
      fontFamily: primaryFontFamily,
      fontSize: moderateScale(8, 0.3, metrics),
      color: colors.text.secondary,
      fontWeight: fontWeights.medium,
    },
    peakTooltipPill: {
      backgroundColor: colors.brand.primary,
      borderRadius: moderateScale(6, 0.5, metrics),
      paddingHorizontal: scale(8, metrics),
      paddingVertical: verticalScale(4, metrics),
      // No minWidth/width: the pill shrink-wraps to its own text, so a short value (e.g. "Rs.0")
      // stays exactly as wide as it needs to be. maxWidth is just a safety net for an unusually
      // long value (wraps to a second line rather than growing unbounded) — BarChart's own
      // `autoCenterTooltip` handles the everyday centering via a real onLayout measurement.
      maxWidth: scale(TOOLTIP_PILL_MAX_WIDTH, metrics),
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.neutral.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 10,
    },
    peakTooltipText: {
      fontFamily: primaryFontFamily,
      fontSize: moderateScale(TOOLTIP_TEXT_FONT_SIZE, 0.3, metrics),
      fontWeight: fontWeights.bold,
      color: colors.text.white,
      textAlign: 'center',
      includeFontPadding: false,
    },
    skeletonIcon: {
      marginBottom: scale(6, metrics),
    },
    skeletonValue: {
      marginBottom: scale(4, metrics),
    },
  });
};

export default SalesTrendCard;
