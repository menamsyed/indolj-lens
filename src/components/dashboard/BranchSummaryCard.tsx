import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { VectorIcon } from '../common/VectorIcon';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { useTheme } from '../../context/ThemeContext';
import { Colors } from '../../styles/colors';
import { typography, fontWeights } from '../../styles/typography';
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
  salesTaxAmount = 'Rs. 0',
  salesTaxGrowth = '',
  overallGrowth = '',
  isLoading = false,
}: BranchSummaryCardProps): React.JSX.Element {
  const { colors, isDarkMode } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDarkMode), [colors, isDarkMode]);

  const displayNetSales = formatCurrency(netSalesAmount);
  const displayAvgOrder = formatCurrency(avgOrderValue);
  const displayDiscount = formatCurrency(discountAmount);
  const displaySalesTax = formatCurrency(salesTaxAmount);
  console.log(netSalesAmount, "netSalesAmount", displayNetSales, "displayNetSales")

  if (isLoading) {
    return (
      <View style={styles.cardContainer}>
        <SkeletonLoader width={100} height={12} borderRadius={3} style={styles.skeletonItem} />
        <SkeletonLoader width={160} height={14} borderRadius={4} style={styles.skeletonItem} />
        <SkeletonLoader width={120} height={28} borderRadius={6} style={styles.skeletonItem} />
        <View style={styles.tilesGrid}>
          {[1, 2, 3, 4].map((key) => (
            <View key={key} style={styles.tileCard}>
              <SkeletonLoader width={40} height={40} borderRadius={12} style={styles.skeletonTileIcon} />
              <SkeletonLoader width={60} height={11} borderRadius={3} style={styles.skeletonTileLabel} />
              <SkeletonLoader width={70} height={16} borderRadius={4} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  const isOverallNegative = overallGrowth.startsWith('-');
  const isOrdersNegative = ordersGrowth.startsWith('-');
  const isAvgNegative = avgOrderValueGrowth.startsWith('-');
  const isTaxNegative = salesTaxGrowth.startsWith('-');

  return (
    <View style={styles.cardContainer}>
      {/* Header Banner Row with Top Right Percentage Chip */}
      <View style={styles.bannerHeaderRow}>
        <View>
          <Text style={[typography.caption, styles.bannerTitle]}>TOTAL SALES</Text>
          {dateString ? (
            <Text style={[typography.bodyMedium, styles.dateSubtitle]}>{dateString}</Text>
          ) : null}
        </View>

        {overallGrowth ? (
          <View style={[styles.topGrowthChip, isOverallNegative && styles.topGrowthChipNeg]}>
            <Text style={[styles.growthText, isOverallNegative && styles.growthTextNeg]}>
              {isOverallNegative ? '↓ ' : '▲ '}{overallGrowth}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Main Net Sales Figure & Prev Period */}
      <Text style={[typography.greetingTitle, styles.bigSalesValue]}>{displayNetSales}</Text>
      {prevPeriodText ? (
        <Text style={[typography.caption, styles.prevPeriodSubtitle]}>{prevPeriodText}</Text>
      ) : null}

      {/* 4 Metric Tiles Grid */}
      <View style={styles.tilesGrid}>
        {/* Tile 1: Orders (Cart Icon - Green Theme) */}
        <View style={styles.tileCard}>
          <View style={[styles.iconBox, styles.bgGreenTint]}>
            <VectorIcon name="cart" size={20} color={colors.chart.green} />
          </View>
          <Text style={[typography.caption, styles.tileLabel]}>Orders</Text>
          <Text style={[typography.h3, styles.tileValue]}>{ordersCount}</Text>

          {ordersGrowth ? (
            <View style={[styles.tileGrowthChip, isOrdersNegative && styles.tileGrowthChipNeg]}>
              <Text style={[styles.tileGrowthText, isOrdersNegative && styles.tileGrowthTextNeg]}>
                {isOrdersNegative ? '↓ ' : '▲ '}{ordersGrowth}
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
              <Text style={[styles.tileGrowthText, isAvgNegative && styles.tileGrowthTextNeg]}>
                {isAvgNegative ? '↓ ' : '▲ '}{avgOrderValueGrowth}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Tile 3: Discount Amount (Percent Icon - Orange Theme) */}
        <View style={styles.tileCard}>
          <View style={[styles.iconBox, styles.bgOrangeTint]}>
            <VectorIcon name="percent" size={20} color={colors.chart.orange} />
          </View>
          <Text style={[typography.caption, styles.tileLabel]}>Discount Amount</Text>
          <Text style={[typography.h3, styles.tileValue]}>{displayDiscount}</Text>
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
              <Text style={[styles.tileGrowthText, isTaxNegative && styles.tileGrowthTextNeg]}>
                {isTaxNegative ? '↓ ' : '▲ '}{salesTaxGrowth}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: Colors, isDarkMode: boolean) => StyleSheet.create({
  cardContainer: {
    backgroundColor: colors.surface.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border.light,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  bannerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  bannerTitle: {
    fontSize: 11,
    color: colors.text.muted,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  dateSubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 6,
  },
  topGrowthChip: {
    backgroundColor: colors.status.successBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.chart.greenBorder,
  },
  topGrowthChipNeg: {
    backgroundColor: colors.chart.redBg,
    borderColor: colors.chart.redBorder,
  },
  growthText: {
    fontSize: 10.5,
    color: colors.status.success,
    fontWeight: fontWeights.bold,
  },
  growthTextNeg: {
    color: colors.status.error,
  },
  bigSalesValue: {
    fontSize: 32,
    color: isDarkMode ? colors.text.white : colors.brand.primary,
    fontWeight: fontWeights.bold,
    marginBottom: 2,
  },
  prevPeriodSubtitle: {
    fontSize: 12,
    color: colors.text.muted,
    marginBottom: 16,
  },
  tilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tileCard: {
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
    marginBottom: 8,
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
    marginBottom: 2,
    fontSize: 11,
  },
  tileValue: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: fontWeights.bold,
    marginBottom: 6,
  },
  tileGrowthChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.status.successBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tileGrowthChipNeg: {
    backgroundColor: colors.chart.redBg,
  },
  tileGrowthText: {
    fontSize: 9.5,
    color: colors.status.success,
    fontWeight: fontWeights.bold,
  },
  tileGrowthTextNeg: {
    color: colors.status.error,
  },
  skeletonItem: {
    marginBottom: 8,
  },
  skeletonTileIcon: {
    marginBottom: 8,
  },
  skeletonTileLabel: {
    marginBottom: 4,
  },
});

export default BranchSummaryCard;
