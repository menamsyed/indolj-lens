import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { VectorIcon, IconName } from '../common/VectorIcon';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { useTheme } from '../../context/ThemeContext';
import { Colors } from '../../styles/colors';
import { typography, fontWeights } from '../../styles/typography';
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
  const styles = useMemo(() => createStyles(colors, isDarkMode), [colors, isDarkMode]);

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

const createStyles = (colors: Colors, isDarkMode: boolean) => StyleSheet.create({
  card: {
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
  skeletonSpacing: {
    marginTop: 10,
  },
  cardHeader: {
    marginBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  branchTitle: {
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: fontWeights.semiBold,
  },
  totalSalesText: {
    color: isDarkMode ? colors.neutral.white : colors.brand.primary,
    fontSize: 28,
    fontWeight: fontWeights.heavy,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.surface.background,
  },
  metaText: {
    color: colors.text.secondary,
    fontSize: 11.5,
  },
  tilesGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  tileCard: {
    flex: 1,
    backgroundColor: colors.surface.background,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  tileIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
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
    fontSize: 12.5,
    color: colors.text.primary,
    fontWeight: fontWeights.bold,
    marginBottom: 2,
    textAlign: 'center',
  },
  tileLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    textAlign: 'center',
    fontWeight: fontWeights.medium,
  },
  orderTypesSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: 12,
    marginTop: 2,
  },
  orderTypesHeading: {
    color: colors.text.muted,
    fontSize: 10.5,
    letterSpacing: 0.8,
    marginBottom: 10,
    fontWeight: fontWeights.bold,
  },
  channelsGrid: {
    gap: 8,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.background,
    padding: 10,
    borderRadius: 10,
  },
  channelIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  channelInfo: {
    flex: 1,
  },
  channelName: {
    fontSize: 13,
    fontWeight: fontWeights.semiBold,
    color: colors.text.primary,
  },
  channelOrders: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  channelAmount: {
    fontSize: 13,
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
  },
});

export default BranchWiseSalesCard;
