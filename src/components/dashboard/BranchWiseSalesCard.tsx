import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { VectorIcon, IconName } from '../common/VectorIcon';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { useTheme } from '../../context/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { Colors } from '../../styles/colors';
import { typography, fontWeights } from '../../styles/typography';
import { ScreenMetrics, moderateScale, scale } from '../../utils/responsive';
import { formatCurrency } from '../../utils/formatters';

export interface BranchChannelItem {
  key: string;
  label: string;
  count?: number;
  ordersCount?: number;
  amount?: string | number;
  amountDisplay?: string | number;
  percentage?: number;
}

export interface BranchWiseSalesCardProps {
  branchName?: string;
  totalSales?: string | number;
  ordersCount?: number;
  customersCount?: number;
  discountAmount?: string | number;
  taxAmount?: string | number;
  netSalesAmount?: string | number;
  channels?: BranchChannelItem[];
  isLoading?: boolean;
}

const channelStyleMap: Record<string, { icon: IconName; color: string; bg: string }> = {
  dinein: { icon: 'utensils', color: '#16A085', bg: '#E8F8F5' },
  takeaway: { icon: 'bowl', color: '#8E44AD', bg: '#F5EEF8' },
  delivery: { icon: 'cart', color: '#2980B9', bg: '#EBF5FB' },
  carhop: { icon: 'coffee', color: '#D35400', bg: '#FDEBD0' },
};

export function BranchWiseSalesCard({
  branchName = 'Branch',
  totalSales = 'Rs.0',
  ordersCount = 0,
  customersCount = 0,
  discountAmount = 'Rs.0',
  taxAmount = 'Rs.0',
  netSalesAmount = 'Rs.0',
  channels = [],
  isLoading = false,
}: BranchWiseSalesCardProps): React.JSX.Element {
  const { colors, isDarkMode } = useTheme();
  const metrics = useResponsive();
  const styles = useMemo(() => createStyles(colors, isDarkMode, metrics), [colors, isDarkMode, metrics]);

  const displayTotalSales = typeof totalSales === 'number' || !String(totalSales).startsWith('Rs.') ? formatCurrency(totalSales) : totalSales;
  const displayDiscount = typeof discountAmount === 'number' || !String(discountAmount).startsWith('Rs.') ? formatCurrency(discountAmount) : discountAmount;
  const displayTax = typeof taxAmount === 'number' || !String(taxAmount).startsWith('Rs.') ? formatCurrency(taxAmount) : taxAmount;
  const displayNet = typeof netSalesAmount === 'number' || !String(netSalesAmount).startsWith('Rs.') ? formatCurrency(netSalesAmount) : netSalesAmount;

  if (isLoading) {
    return (
      <View style={styles.card}>
        <SkeletonLoader width={140} height={16} borderRadius={4} />
        <SkeletonLoader width={180} height={26} borderRadius={4} style={styles.skeletonSpacing} />
        <SkeletonLoader width="100%" height={60} borderRadius={8} style={styles.skeletonSpacing} />
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {/* Header: Branch Name + Large Total Sales Figure */}
      <View style={styles.cardHeader}>
        <View style={styles.headerTitleRow}>
          <VectorIcon name="store" size={18} color={colors.brand.primary} />
          <Text style={[typography.h3, styles.branchTitle]} numberOfLines={1}>
            {branchName}
          </Text>
        </View>
        <Text style={[typography.h2, styles.totalSalesText]}>{displayTotalSales}</Text>
      </View>

      {/* Row 1: Orders / Customers stats */}
      <View style={styles.metaRow}>
        <View style={styles.metaBadge}>
          <VectorIcon name="file-text" size={13} color={colors.text.secondary} />
          <Text style={[typography.caption, styles.metaText]}>
            {ordersCount} {ordersCount === 1 ? 'Order' : 'Orders'}
          </Text>
        </View>
        <View style={styles.metaBadge}>
          <VectorIcon name="user" size={13} color={colors.text.secondary} />
          <Text style={[typography.caption, styles.metaText]}>
            {customersCount} {customersCount === 1 ? 'Customer' : 'Customers'}
          </Text>
        </View>
      </View>

      {/* Row 2: Discount / Sales Tax / Net Sale Tiles Grid */}
      <View style={styles.tilesGrid}>
        {/* Discount Tile */}
        <View style={styles.tileCard}>
          <View style={[styles.tileIconBox, styles.bgOrangeTint]}>
            <VectorIcon name="percent" size={14} color={colors.chart.orange} />
          </View>
          <Text style={[typography.h3, styles.tileValue]} numberOfLines={1} adjustsFontSizeToFit>
            {displayDiscount}
          </Text>
          <Text style={[typography.caption, styles.tileLabel]}>Discount</Text>
        </View>

        {/* Sales Tax Tile */}
        <View style={styles.tileCard}>
          <View style={[styles.tileIconBox, styles.bgPurpleTint]}>
            <VectorIcon name="file-text" size={14} color={colors.chart.purple} />
          </View>
          <Text style={[typography.h3, styles.tileValue]} numberOfLines={1} adjustsFontSizeToFit>
            {displayTax}
          </Text>
          <Text style={[typography.caption, styles.tileLabel]}>Sales Tax</Text>
        </View>

        {/* Net Sale Tile */}
        <View style={styles.tileCard}>
          <View style={[styles.tileIconBox, styles.bgBlueTint]}>
            <VectorIcon name="chart" size={14} color={colors.chart.blue} />
          </View>
          <Text style={[typography.h3, styles.tileValue]} numberOfLines={1} adjustsFontSizeToFit>
            {displayNet}
          </Text>
          <Text style={[typography.caption, styles.tileLabel]}>Net Sale</Text>
        </View>
      </View>

      {/* Order Types breakdown */}
      {channels.length > 0 && (
        <View style={styles.orderTypesSection}>
          <Text style={[typography.caption, styles.orderTypesHeading]}>ORDER TYPES</Text>
          <View style={styles.channelsGrid}>
            {channels.map((ch, idx) => {
              const meta = channelStyleMap[ch.key] || {
                icon: 'utensils' as IconName,
                color: colors.brand.primary,
                bg: colors.brand.tint,
              };
              const countDisplay = ch.ordersCount ?? ch.count ?? 0;
              const displayAmt = typeof ch.amountDisplay === 'number' || typeof ch.amount === 'number' || (ch.amountDisplay && !String(ch.amountDisplay).startsWith('Rs.')) ? formatCurrency(ch.amountDisplay ?? ch.amount ?? 0) : (ch.amountDisplay ?? ch.amount ?? 'Rs.0');
              return (
                <View key={ch.key || idx} style={styles.channelRow}>
                  <View style={[styles.channelIconBox, { backgroundColor: meta.bg }]}>
                    <VectorIcon name={meta.icon} size={13} color={meta.color} />
                  </View>
                  <View style={styles.channelInfo}>
                    <Text style={[typography.bodyMedium, styles.channelName]} numberOfLines={1}>
                      {ch.label}
                    </Text>
                    <Text style={[typography.caption, styles.channelOrders]}>
                      {countDisplay} {countDisplay === 1 ? 'order' : 'orders'} ({ch.percentage ?? 0}%)
                    </Text>
                  </View>
                  <Text style={[typography.bodyMedium, styles.channelAmount]}>
                    {displayAmt}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: Colors, isDarkMode: boolean, metrics: ScreenMetrics) => {
  const tileIconBoxSize = scale(28, metrics);
  const channelIconBoxSize = scale(28, metrics);

  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface.card,
      borderRadius: moderateScale(20, 0.5, metrics),
      padding: moderateScale(16, 0.5, metrics),
      marginBottom: scale(16, metrics),
      shadowColor: colors.neutral.black,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 6,
    },
    skeletonSpacing: {
      marginTop: scale(10, metrics),
    },
    cardHeader: {
      marginBottom: scale(12, metrics),
    },
    headerTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(8, metrics),
      marginBottom: scale(4, metrics),
    },
    branchTitle: {
      color: colors.text.secondary,
      fontSize: moderateScale(14, 0.3, metrics),
      fontWeight: fontWeights.semiBold,
    },
    totalSalesText: {
      color: isDarkMode ? colors.neutral.white : colors.brand.primary,
      fontSize: moderateScale(28, 0.3, metrics),
      fontWeight: fontWeights.heavy,
      letterSpacing: -0.5,
      marginTop: scale(2, metrics),
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(10, metrics),
      marginBottom: scale(14, metrics),
    },
    metaBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(5, metrics),
      paddingHorizontal: moderateScale(8, 0.5, metrics),
      paddingVertical: moderateScale(4, 0.5, metrics),
      borderRadius: moderateScale(6, 0.5, metrics),
      backgroundColor: colors.surface.background,
    },
    metaText: {
      color: colors.text.secondary,
      fontSize: moderateScale(11.5, 0.3, metrics),
    },
    tilesGrid: {
      flexDirection: 'row',
      gap: scale(8, metrics),
      marginBottom: scale(14, metrics),
    },
    tileCard: {
      flex: 1,
      backgroundColor: colors.surface.background,
      borderRadius: moderateScale(12, 0.5, metrics),
      paddingVertical: moderateScale(10, 0.5, metrics),
      paddingHorizontal: moderateScale(6, 0.5, metrics),
      alignItems: 'center',
      shadowColor: colors.neutral.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    tileIconBox: {
      width: tileIconBoxSize,
      height: tileIconBoxSize,
      borderRadius: moderateScale(8, 0.5, metrics),
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: scale(6, metrics),
    },
    bgOrangeTint: {
      backgroundColor: colors.chart.orangeBg,
    },
    bgPurpleTint: {
      backgroundColor: colors.chart.purpleBg,
    },
    bgBlueTint: {
      backgroundColor: colors.chart.blueBg,
    },
    tileValue: {
      fontSize: moderateScale(12.5, 0.3, metrics),
      color: colors.text.primary,
      fontWeight: fontWeights.bold,
      marginBottom: scale(2, metrics),
      textAlign: 'center',
    },
    tileLabel: {
      fontSize: moderateScale(11, 0.3, metrics),
      color: colors.text.secondary,
      textAlign: 'center',
      fontWeight: fontWeights.medium,
    },
    orderTypesSection: {
      borderTopWidth: 1,
      borderTopColor: colors.border.light,
      paddingTop: scale(12, metrics),
      marginTop: scale(2, metrics),
    },
    orderTypesHeading: {
      color: colors.text.muted,
      fontSize: moderateScale(10.5, 0.3, metrics),
      letterSpacing: 0.8,
      marginBottom: scale(10, metrics),
      fontWeight: fontWeights.bold,
    },
    channelsGrid: {
      gap: scale(8, metrics),
    },
    channelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface.background,
      padding: moderateScale(10, 0.5, metrics),
      borderRadius: moderateScale(10, 0.5, metrics),
    },
    channelIconBox: {
      width: channelIconBoxSize,
      height: channelIconBoxSize,
      borderRadius: moderateScale(8, 0.5, metrics),
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: scale(10, metrics),
    },
    channelInfo: {
      flex: 1,
    },
    channelName: {
      fontSize: moderateScale(13, 0.3, metrics),
      fontWeight: fontWeights.semiBold,
      color: colors.text.primary,
    },
    channelOrders: {
      fontSize: moderateScale(11, 0.3, metrics),
      color: colors.text.secondary,
    },
    channelAmount: {
      fontSize: moderateScale(13, 0.3, metrics),
      fontWeight: fontWeights.bold,
      color: colors.text.primary,
    },
  });
};

export default BranchWiseSalesCard;
