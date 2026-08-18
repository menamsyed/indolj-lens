import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { VectorIcon } from '../common/VectorIcon';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { useTheme } from '../../context/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { Colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { ScreenMetrics, moderateScale, scale } from '../../utils/responsive';

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
  const metrics = useResponsive();
  const styles = useMemo(() => createStyles(colors, metrics), [colors, metrics]);

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

const createStyles = (colors: Colors, metrics: ScreenMetrics) => {
  const iconSquareSize = scale(36, metrics);

  return StyleSheet.create({
    gridContainer: {
      flexDirection: 'row',
      gap: scale(10, metrics),
      marginBottom: scale(16, metrics),
    },
    metricCard: {
      flex: 1,
      backgroundColor: colors.surface.card,
      borderRadius: moderateScale(16, 0.5, metrics),
      padding: moderateScale(12, 0.5, metrics),
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
      width: iconSquareSize,
      height: iconSquareSize,
      borderRadius: moderateScale(10, 0.5, metrics),
      backgroundColor: colors.brand.tint,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: scale(8, metrics),
    },
    valueText: {
      fontSize: moderateScale(15, 0.3, metrics),
      color: colors.text.primary,
      marginBottom: scale(2, metrics),
      textAlign: 'center',
    },
    labelText: {
      color: colors.text.secondary,
      textAlign: 'center',
    },
    skeletonIcon: {
      marginBottom: scale(10, metrics),
    },
    skeletonValue: {
      marginBottom: scale(6, metrics),
    },
  });
};

export default OverviewMetricsGrid;
