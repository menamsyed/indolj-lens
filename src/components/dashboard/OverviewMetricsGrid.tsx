import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { VectorIcon } from '../common/VectorIcon';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { useTheme } from '../../context/ThemeContext';
import { Colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

export interface OverviewMetricsGridProps {
  totalAmount?: string;
  totalOrders?: number;
  avgOrderAmount?: string;
  isLoading?: boolean;
}

export function OverviewMetricsGrid({
  totalAmount = 'Rs.43640',
  totalOrders = 5,
  avgOrderAmount = 'Rs.1818',
  isLoading = false,
}: OverviewMetricsGridProps): React.JSX.Element {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (isLoading) {
    return (
      <View style={styles.gridContainer}>
        {[1, 2, 3].map((key) => (
          <View key={key} style={styles.metricCard}>
            <SkeletonLoader width={36} height={36} borderRadius={10} style={styles.skeletonIcon} />
            <SkeletonLoader width="80%" height={16} borderRadius={4} style={styles.skeletonValue} />
            <SkeletonLoader width="60%" height={12} borderRadius={4} />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.gridContainer}>
      {/* Card 1: Total Amount */}
      <View style={styles.metricCard}>
        <View style={styles.iconSquare}>
          <VectorIcon name="store" size={18} color={colors.brand.primary} />
        </View>
        <Text style={[typography.h3, styles.valueText]}>{totalAmount}</Text>
        <Text style={[typography.caption, styles.labelText]}>Total Amount</Text>
      </View>

      {/* Card 2: Total Orders */}
      <View style={styles.metricCard}>
        <View style={styles.iconSquare}>
          <VectorIcon name="user" size={18} color={colors.brand.primary} />
        </View>
        <Text style={[typography.h3, styles.valueText]}>{totalOrders}</Text>
        <Text style={[typography.caption, styles.labelText]}>Total Orders</Text>
      </View>

      {/* Card 3: Average Order Amount */}
      <View style={styles.metricCard}>
        <View style={styles.iconSquare}>
          <VectorIcon name="arrow-right" size={18} color={colors.brand.primary} />
        </View>
        <Text style={[typography.h3, styles.valueText]}>{avgOrderAmount}</Text>
        <Text style={[typography.caption, styles.labelText]}>Average Order Amount</Text>
      </View>
    </View>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surface.card,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconSquare: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.brand.tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  valueText: {
    fontSize: 15,
    color: colors.text.primary,
    marginBottom: 2,
    textAlign: 'center',
  },
  labelText: {
    color: colors.text.secondary,
    textAlign: 'center',
  },
  skeletonIcon: {
    marginBottom: 10,
  },
  skeletonValue: {
    marginBottom: 6,
  },
});

export default OverviewMetricsGrid;
