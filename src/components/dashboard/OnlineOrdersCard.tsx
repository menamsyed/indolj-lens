import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { VectorIcon } from '../common/VectorIcon';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { useTheme } from '../../context/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { Colors } from '../../styles/colors';
import { typography, fontWeights } from '../../styles/typography';
import { ScreenMetrics, moderateScale, scale } from '../../utils/responsive';

export interface OnlineOrdersCardProps {
  onViewDetailsPress?: () => void;
  isLoading?: boolean;
}

export function OnlineOrdersCard({
  onViewDetailsPress,
  isLoading = false,
}: OnlineOrdersCardProps): React.JSX.Element {
  const { colors } = useTheme();
  const metrics = useResponsive();
  const styles = useMemo(() => createStyles(colors, metrics), [colors, metrics]);
  const recentOrders = [
    { token: '#A55-3', time: '12:59 PM', orderType: 'Takeaway', amount: 'Rs.2,700' },
    { token: '#A55-7', time: '01:14 PM', orderType: 'Delivery', amount: 'Rs.1,450' },
    { token: '#S1-1', time: '01:30 PM', orderType: 'Dine In', amount: 'Rs.3,800' },
  ];

  if (isLoading) {
    return (
      <View style={styles.cardContainer}>
        <View style={styles.headerRow}>
          <SkeletonLoader width={140} height={18} borderRadius={4} />
          <SkeletonLoader width={80} height={14} borderRadius={4} />
        </View>
        {[1, 2, 3].map((key) => (
          <View key={key} style={styles.skeletonRow}>
            <SkeletonLoader width={70} height={14} borderRadius={4} />
            <SkeletonLoader width={80} height={14} borderRadius={4} />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.cardContainer}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <Text style={[typography.h3, styles.cardTitle]}>Online Orders List</Text>
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

      {/* Orders List Table Preview */}
      <View style={styles.orderList}>
        {recentOrders.map((order) => (
          <View key={order.token} style={styles.orderRow}>
            <View style={styles.tokenPill}>
              <Text style={[typography.caption, styles.tokenText]}>{order.token}</Text>
            </View>

            <View style={styles.middleMeta}>
              <Text style={[typography.bodyMedium, styles.orderType]}>{order.orderType}</Text>
              <Text style={[typography.caption, styles.timeText]}>{order.time}</Text>
            </View>

            <Text style={[typography.bodyMedium, styles.amountText]}>{order.amount}</Text>
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
  orderList: {
    gap: scale(8, metrics),
  },
  orderRow: {
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
  tokenPill: {
    backgroundColor: colors.brand.tint,
    paddingHorizontal: moderateScale(8, 0.5, metrics),
    paddingVertical: moderateScale(4, 0.5, metrics),
    borderRadius: moderateScale(6, 0.5, metrics),
  },
  tokenText: {
    fontSize: moderateScale(11, 0.3, metrics),
    color: colors.brand.primary,
    fontWeight: fontWeights.bold,
  },
  middleMeta: {
    flex: 1,
    marginLeft: scale(10, metrics),
  },
  orderType: {
    fontSize: moderateScale(13, 0.3, metrics),
    color: colors.text.primary,
    fontWeight: fontWeights.semiBold,
  },
  timeText: {
    color: colors.text.muted,
    marginTop: scale(1, metrics),
  },
  amountText: {
    fontSize: moderateScale(13.5, 0.3, metrics),
    color: colors.text.primary,
    fontWeight: fontWeights.bold,
  },
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: scale(42, metrics),
    borderRadius: moderateScale(12, 0.5, metrics),
    marginBottom: scale(8, metrics),
    alignItems: 'center',
    paddingHorizontal: moderateScale(12, 0.5, metrics),
    backgroundColor: colors.neutral.gray50,
  },
});

export default OnlineOrdersCard;
