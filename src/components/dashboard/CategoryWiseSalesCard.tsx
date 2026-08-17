import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { VectorIcon } from '../common/VectorIcon';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { useTheme } from '../../context/ThemeContext';
import { Colors } from '../../styles/colors';
import { typography, fontWeights } from '../../styles/typography';

export interface CategoryWiseSalesCardProps {
  onViewDetailsPress?: () => void;
  isLoading?: boolean;
}

export function CategoryWiseSalesCard({
  onViewDetailsPress,
  isLoading = false,
}: CategoryWiseSalesCardProps): React.JSX.Element {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const topCategories = [
    { name: 'Pizzas', qty: '18', sales: 'Rs.23,000', percentage: '69.4%' },
    { name: 'Burgers & Wraps', qty: '12', sales: 'Rs.7,500', percentage: '22.6%' },
    { name: 'Beverages', qty: '15', sales: 'Rs.2,648', percentage: '8.0%' },
  ];

  if (isLoading) {
    return (
      <View style={styles.cardContainer}>
        <View style={styles.headerRow}>
          <SkeletonLoader width={150} height={18} borderRadius={4} />
          <SkeletonLoader width={80} height={14} borderRadius={4} />
        </View>
        {[1, 2, 3].map((key) => (
          <View key={key} style={styles.skeletonRow}>
            <SkeletonLoader width={100} height={14} borderRadius={4} />
            <SkeletonLoader width={65} height={14} borderRadius={4} />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.cardContainer}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <Text style={[typography.h3, styles.cardTitle]}>Category Wise Sales</Text>
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

      {/* Top Food Categories Preview */}
      <View style={styles.categoryList}>
        {topCategories.map((item) => (
          <View key={item.name} style={styles.categoryRow}>
            <View style={styles.leftCol}>
              <Text style={[typography.bodyMedium, styles.categoryName]} numberOfLines={1}>
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

const createStyles = (colors: Colors) => StyleSheet.create({
  cardContainer: {
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    color: colors.text.primary,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 12,
    color: colors.brand.primary,
    fontWeight: fontWeights.bold,
  },
  categoryList: {
    gap: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral.gray50,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  leftCol: {
    flex: 1,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 13,
    color: colors.text.primary,
    fontWeight: fontWeights.semiBold,
  },
  qtyText: {
    color: colors.text.muted,
    marginTop: 1,
  },
  rightCol: {
    alignItems: 'flex-end',
  },
  salesText: {
    fontSize: 13.5,
    color: colors.text.primary,
    fontWeight: fontWeights.bold,
  },
  percentageText: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 1,
  },
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 40,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: colors.neutral.gray50,
  },
});

export default CategoryWiseSalesCard;
