import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { VectorIcon } from '../common/VectorIcon';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { useTheme } from '../../context/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { Colors } from '../../styles/colors';
import { typography, fontWeights } from '../../styles/typography';
import { ScreenMetrics, moderateScale, scale } from '../../utils/responsive';
import { formatCurrency } from '../../utils/formatters';

export interface BranchSummaryCardProps {
  dateString?: string;
  netSalesAmount?: string | number;
  prevPeriodText?: string;
  ordersCount?: number;
  ordersGrowth?: string;
  avgOrderValue?: string | number;
  avgOrderValueGrowth?: string;
  discountAmount?: string | number;
  discountGrowth?: string;
  salesTaxAmount?: string | number;
  salesTaxGrowth?: string;
  overallGrowth?: string;
  isLoading?: boolean;
}

export function BranchSummaryCard({
  dateString = '',
  netSalesAmount = 'Rs. 0',
  prevPeriodText = '',
  ordersCount = 0,
  ordersGrowth = '',
  avgOrderValue = 'Rs. 0',
  avgOrderValueGrowth = '',
  discountAmount = 'Rs. 0',
  discountGrowth = '',
  salesTaxAmount = 'Rs. 0',
  salesTaxGrowth = '',
  overallGrowth = '',
  isLoading = false,
}: BranchSummaryCardProps): React.JSX.Element {
  const { colors } = useTheme();
  const metrics = useResponsive();
  const styles = useMemo(() => createStyles(colors, metrics), [colors, metrics]);

  const displayNetSales = formatCurrency(netSalesAmount);
  const displayAvgOrder = formatCurrency(avgOrderValue);
  const displayDiscount = formatCurrency(discountAmount);
  const displaySalesTax = formatCurrency(salesTaxAmount);

  if (isLoading) {
    return (
      <View style={styles.cardShadowWrapper}>
        <View style={styles.cardContainer}>
          <View style={styles.content}>
            <View style={styles.bannerHeaderRow}>
              <SkeletonLoader width={100} height={12} borderRadius={3} style={styles.skeletonItem} />
              <SkeletonLoader width={160} height={14} borderRadius={4} />
            </View>
            <SkeletonLoader width={120} height={28} borderRadius={6} style={styles.skeletonItem} />
            <View style={styles.tilesGrid}>
              <View style={styles.tilesRow}>
                {[1, 2].map((key) => (
                  <View key={key} style={styles.tileCard}>
                    <SkeletonLoader width={40} height={40} borderRadius={12} style={styles.skeletonTileIcon} />
                    <SkeletonLoader width={60} height={11} borderRadius={3} style={styles.skeletonTileLabel} />
                    <SkeletonLoader width={70} height={16} borderRadius={4} />
                  </View>
                ))}
              </View>
              <View style={styles.tilesRow}>
                {[3, 4].map((key) => (
                  <View key={key} style={styles.tileCard}>
                    <SkeletonLoader width={40} height={40} borderRadius={12} style={styles.skeletonTileIcon} />
                    <SkeletonLoader width={60} height={11} borderRadius={3} style={styles.skeletonTileLabel} />
                    <SkeletonLoader width={70} height={16} borderRadius={4} />
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }

  const isOverallNegative = overallGrowth.startsWith('-');
  const isOrdersNegative = ordersGrowth.startsWith('-');
  const isAvgNegative = avgOrderValueGrowth.startsWith('-');
  const isDiscountNegative = discountGrowth.startsWith('-');
  const isTaxNegative = salesTaxGrowth.startsWith('-');

  return (
    <View style={styles.cardShadowWrapper}>
    <View style={styles.cardContainer}>
    <View style={styles.content}>
      {/* Header Row with Top Right Percentage Chip */}
      <View style={styles.bannerHeaderRow}>
        <View>
          <Text style={[typography.caption, styles.bannerTitle]}>TOTAL SALES</Text>
          {dateString ? (
            <Text style={[typography.bodyMedium, styles.dateSubtitle]}>{dateString}</Text>
          ) : null}
        </View>

        {overallGrowth ? (
          <View style={[styles.topGrowthChip, isOverallNegative && styles.topGrowthChipNeg]}>
            <VectorIcon
              name={isOverallNegative ? 'trending-down' : 'trending-up'}
              size={moderateScale(11, 0.3, metrics)}
              color={isOverallNegative ? colors.chart.red : colors.status.success}
              strokeWidth={2.5}
            />
            <Text style={[styles.growthText, isOverallNegative && styles.growthTextNeg]}>
              {overallGrowth}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Main Net Sales Figure & Prev Period */}
      <Text style={[typography.greetingTitle, styles.bigSalesValue]}>{displayNetSales}</Text>
      {prevPeriodText ? (
        <Text style={[typography.caption, styles.prevPeriodSubtitle]}>{prevPeriodText}</Text>
      ) : null}

      {/* 4 Metric Tiles Grid — laid out as two explicit 2-tile rows (not a wrapping
          percentage grid) so it's always exactly two columns regardless of screen width. */}
      <View style={styles.tilesGrid}>
        <View style={styles.tilesRow}>
          {/* Tile 1: Orders (Cart Icon - Green Theme) */}
          <View style={styles.tileCard}>
            <View style={[styles.iconBox, styles.bgGreenTint]}>
              <VectorIcon name="cart" size={20} color={colors.chart.green} />
            </View>
            <Text style={[typography.caption, styles.tileLabel]}>Orders</Text>
            <Text style={[typography.h3, styles.tileValue]}>{ordersCount}</Text>

            {ordersGrowth ? (
              <View style={[styles.tileGrowthChip, isOrdersNegative && styles.tileGrowthChipNeg]}>
                <VectorIcon
                  name={isOrdersNegative ? 'trending-down' : 'trending-up'}
                  size={moderateScale(10, 0.3, metrics)}
                  color={isOrdersNegative ? colors.chart.red : colors.status.success}
                  strokeWidth={2.5}
                />
                <Text style={[styles.tileGrowthText, isOrdersNegative && styles.tileGrowthTextNeg]}>
                  {ordersGrowth}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Tile 2: Avg Order Value (Calculator Icon - Blue Theme) */}
          <View style={styles.tileCard}>
            <View style={[styles.iconBox, styles.bgBlueTint]}>
              <VectorIcon name="calculator" size={20} color={colors.chart.blue} />
            </View>
            <Text style={[typography.caption, styles.tileLabel]}>Avg Order Value</Text>
            <Text style={[typography.h3, styles.tileValue]}>{displayAvgOrder}</Text>

            {avgOrderValueGrowth ? (
              <View style={[styles.tileGrowthChip, isAvgNegative && styles.tileGrowthChipNeg]}>
                <VectorIcon
                  name={isAvgNegative ? 'trending-down' : 'trending-up'}
                  size={moderateScale(10, 0.3, metrics)}
                  color={isAvgNegative ? colors.chart.red : colors.status.success}
                  strokeWidth={2.5}
                />
                <Text style={[styles.tileGrowthText, isAvgNegative && styles.tileGrowthTextNeg]}>
                  {avgOrderValueGrowth}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.tilesRow}>
          {/* Tile 3: Discount Amount (Percent Icon - Orange Theme) */}
          <View style={styles.tileCard}>
            <View style={[styles.iconBox, styles.bgOrangeTint]}>
              <VectorIcon name="percent" size={20} color={colors.chart.orange} />
            </View>
            <Text style={[typography.caption, styles.tileLabel]}>Discount Amount</Text>
            <Text style={[typography.h3, styles.tileValue]}>{displayDiscount}</Text>

            {discountGrowth ? (
              <View style={[styles.tileGrowthChip, isDiscountNegative && styles.tileGrowthChipNeg]}>
                <VectorIcon
                  name={isDiscountNegative ? 'trending-down' : 'trending-up'}
                  size={moderateScale(10, 0.3, metrics)}
                  color={isDiscountNegative ? colors.chart.red : colors.status.success}
                  strokeWidth={2.5}
                />
                <Text style={[styles.tileGrowthText, isDiscountNegative && styles.tileGrowthTextNeg]}>
                  {discountGrowth}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Tile 4: Sales Tax Amount (File Text Icon - Purple Theme) */}
          <View style={styles.tileCard}>
            <View style={[styles.iconBox, styles.bgPurpleTint]}>
              <VectorIcon name="file-text" size={20} color={colors.chart.purple} />
            </View>
            <Text style={[typography.caption, styles.tileLabel]}>Sales Tax Amount</Text>
            <Text style={[typography.h3, styles.tileValue]}>{displaySalesTax}</Text>

            {salesTaxGrowth ? (
              <View style={[styles.tileGrowthChip, isTaxNegative && styles.tileGrowthChipNeg]}>
                <VectorIcon
                  name={isTaxNegative ? 'trending-down' : 'trending-up'}
                  size={moderateScale(10, 0.3, metrics)}
                  color={isTaxNegative ? colors.chart.red : colors.status.success}
                  strokeWidth={2.5}
                />
                <Text style={[styles.tileGrowthText, isTaxNegative && styles.tileGrowthTextNeg]}>
                  {salesTaxGrowth}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
      </View>
    </View>
    </View>
  );
}

const createStyles = (colors: Colors, metrics: ScreenMetrics) => {
  const iconBoxSize = scale(40, metrics);

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
    // Single padded container for the whole card body — header row and the sales
    // figure/tiles below it now share one padding box (rather than two separately
    // padded sections), so their left/right edges always line up exactly.
    content: {
      padding: moderateScale(18, 0.5, metrics),
    },
    bannerHeaderRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: scale(14, metrics),
    },
    bannerTitle: {
      fontSize: moderateScale(11, 0.3, metrics),
      color: colors.text.muted,
      letterSpacing: 0.8,
      marginBottom: scale(2, metrics),
    },
    dateSubtitle: {
      fontSize: moderateScale(13, 0.3, metrics),
      color: colors.text.secondary,
      marginBottom: scale(6, metrics),
    },
    topGrowthChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: moderateScale(3, 0.5, metrics),
      backgroundColor: colors.status.successBg,
      paddingHorizontal: moderateScale(8, 0.5, metrics),
      paddingVertical: moderateScale(3, 0.5, metrics),
      borderRadius: moderateScale(10, 0.5, metrics),
      borderWidth: 1,
      borderColor: colors.chart.greenBorder,
    },
    topGrowthChipNeg: {
      backgroundColor: colors.chart.redBg,
      borderColor: colors.chart.redBorder,
    },
    growthText: {
      fontSize: moderateScale(10.5, 0.3, metrics),
      color: colors.status.success,
      fontWeight: fontWeights.bold,
    },
    growthTextNeg: {
      color: colors.chart.red,
    },
    bigSalesValue: {
      fontSize: moderateScale(32, 0.3, metrics),
      color: colors.text.primary,
      fontWeight: fontWeights.bold,
      marginBottom: scale(2, metrics),
    },
    prevPeriodSubtitle: {
      fontSize: moderateScale(12, 0.3, metrics),
      color: colors.text.muted,
      marginBottom: scale(16, metrics),
    },
    tilesGrid: {
      gap: scale(10, metrics),
    },
    tilesRow: {
      flexDirection: 'row',
      gap: scale(10, metrics),
    },
    tileCard: {
      // Explicit flexBasis: 0 (not the `flex: 1` shorthand) is what actually forces an
      // even 50/50 split — it makes both tiles start from zero width and grow only by
      // their (equal) flexGrow ratio, ignoring their own content size entirely.
      // minWidth: 0 backs that up so a long label/value can never re-impose a content
      // floor. Without both of these, each tile's width is pulled toward its own
      // content's natural size and the two stop matching (the 4 tiles here have very
      // different label/value text lengths).
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
      marginBottom: scale(8, metrics),
    },
    bgGreenTint: {
      backgroundColor: colors.chart.greenBg,
    },
    bgBlueTint: {
      backgroundColor: colors.chart.blueBg,
    },
    bgOrangeTint: {
      backgroundColor: colors.chart.orangeBg,
    },
    bgPurpleTint: {
      backgroundColor: colors.chart.purpleBg,
    },
    tileLabel: {
      color: colors.text.muted,
      marginBottom: scale(2, metrics),
      fontSize: moderateScale(11, 0.3, metrics),
    },
    tileValue: {
      fontSize: moderateScale(16, 0.3, metrics),
      color: colors.text.primary,
      fontWeight: fontWeights.bold,
      marginBottom: scale(6, metrics),
    },
    tileGrowthChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: moderateScale(3, 0.5, metrics),
      alignSelf: 'flex-start',
      backgroundColor: colors.status.successBg,
      paddingHorizontal: moderateScale(6, 0.5, metrics),
      paddingVertical: moderateScale(2, 0.5, metrics),
      borderRadius: moderateScale(6, 0.5, metrics),
    },
    tileGrowthChipNeg: {
      backgroundColor: colors.chart.redBg,
    },
    tileGrowthText: {
      fontSize: moderateScale(9.5, 0.3, metrics),
      color: colors.status.success,
      fontWeight: fontWeights.bold,
    },
    tileGrowthTextNeg: {
      color: colors.chart.red,
    },
    skeletonItem: {
      marginBottom: scale(8, metrics),
    },
    skeletonTileIcon: {
      marginBottom: scale(8, metrics),
    },
    skeletonTileLabel: {
      marginBottom: scale(4, metrics),
    },
  });
};

export default BranchSummaryCard;
