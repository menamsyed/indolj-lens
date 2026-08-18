import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { VectorIcon } from '../common/VectorIcon';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { useTheme } from '../../context/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { Colors } from '../../styles/colors';
import { typography, fontWeights } from '../../styles/typography';
import { ScreenMetrics, moderateScale, scale } from '../../utils/responsive';

export interface ItemWiseSalesCardProps {
  onViewDetailsPress?: () => void;
  isLoading?: boolean;
}

export function ItemWiseSalesCard({
  onViewDetailsPress,
  isLoading = false,
}: ItemWiseSalesCardProps): React.JSX.Element {
  const { colors } = useTheme();
  const metrics = useResponsive();
  const styles = useMemo(() => createStyles(colors, metrics), [colors, metrics]);
  const topItems = [
    { name: 'Royal Tikka Medium', qty: '3', sales: 'Rs.3,900', percentage: '11.8%' },
    { name: 'Zinger Burger Special', qty: '8', sales: 'Rs.6,400', percentage: '19.3%' },
    { name: 'Club Sandwich Deluxe', qty: '5', sales: 'Rs.2,750', percentage: '8.3%' },
  ];

  if (isLoading) {
    return (
      <View style={styles.cardContainer}>
        <View style={styles.headerRow}>
          <SkeletonLoader width={130} height={18} borderRadius={4} />
          <SkeletonLoader width={80} height={14} borderRadius={4} />
        </View>
        {[1, 2, 3].map((key) => (
          <View key={key} style={styles.skeletonRow}>
            <SkeletonLoader width={120} height={14} borderRadius={4} />
            <SkeletonLoader width={70} height={14} borderRadius={4} />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.cardContainer}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <Text style={[typography.h3, styles.cardTitle]}>Item Wise Sales</Text>
        {onViewDetailsPress && (
          <TouchableOpacity
            style={styles.viewDetailsButton}
            onPress={onViewDetailsPress}
            activeOpacity={0.7}
          >
            <Text style={[typography.caption, styles.viewDetailsText]}>View Details</Text>
            <VectorIcon name="arrow-right" size={12} color={colors.brand.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Top 3 Selling Items Preview */}
      <View style={styles.itemList}>
        {topItems.map((item) => (
          <View key={item.name} style={styles.itemRow}>
            <View style={styles.leftCol}>
              <Text style={[typography.bodyMedium, styles.itemName]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={[typography.caption, styles.qtyText]}>Qty: {item.qty}</Text>
            </View>
            <View style={styles.rightCol}>
              <Text style={[typography.bodyMedium, styles.salesText]}>{item.sales}</Text>
              <Text style={[typography.caption, styles.percentageText]}>{item.percentage}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const createStyles = (colors: Colors, metrics: ScreenMetrics) => StyleSheet.create({
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
    marginBottom: scale(12, metrics),
  },
  cardTitle: {
    fontSize: moderateScale(14, 0.3, metrics),
    color: colors.text.primary,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4, metrics),
  },
  viewDetailsText: {
    fontSize: moderateScale(12, 0.3, metrics),
    color: colors.brand.primary,
    fontWeight: fontWeights.bold,
  },
  itemList: {
    gap: scale(8, metrics),
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral.gray50,
    borderRadius: moderateScale(12, 0.5, metrics),
    paddingHorizontal: moderateScale(12, 0.5, metrics),
    paddingVertical: moderateScale(8, 0.5, metrics),
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  leftCol: {
    flex: 1,
    marginRight: scale(8, metrics),
  },
  itemName: {
    fontSize: moderateScale(13, 0.3, metrics),
    color: colors.text.primary,
    fontWeight: fontWeights.semiBold,
  },
  qtyText: {
    color: colors.text.muted,
    marginTop: scale(1, metrics),
  },
  rightCol: {
    alignItems: 'flex-end',
  },
  salesText: {
    fontSize: moderateScale(13.5, 0.3, metrics),
    color: colors.text.primary,
    fontWeight: fontWeights.bold,
  },
  percentageText: {
    fontSize: moderateScale(11, 0.3, metrics),
    color: colors.text.secondary,
    marginTop: scale(1, metrics),
  },
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: scale(40, metrics),
    borderRadius: moderateScale(12, 0.5, metrics),
    marginBottom: scale(8, metrics),
    alignItems: 'center',
    paddingHorizontal: moderateScale(12, 0.5, metrics),
    backgroundColor: colors.neutral.gray50,
  },
});

export default ItemWiseSalesCard;
