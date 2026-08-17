import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { VectorIcon } from '../common/VectorIcon';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { useTheme } from '../../context/ThemeContext';
import { Colors } from '../../styles/colors';
import { typography, fontWeights } from '../../styles/typography';

export interface OnlineOrdersCardProps {
  onViewDetailsPress?: () => void;
  isLoading?: boolean;
}

export function OnlineOrdersCard({
  onViewDetailsPress,
  isLoading = false,
}: OnlineOrdersCardProps): React.JSX.Element {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
  orderList: {
    gap: 8,
  },
  orderRow: {
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
  tokenPill: {
    backgroundColor: colors.brand.tint,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tokenText: {
    fontSize: 11,
    color: colors.brand.primary,
    fontWeight: fontWeights.bold,
  },
  middleMeta: {
    flex: 1,
    marginLeft: 10,
  },
  orderType: {
    fontSize: 13,
    color: colors.text.primary,
    fontWeight: fontWeights.semiBold,
  },
  timeText: {
    color: colors.text.muted,
    marginTop: 1,
  },
  amountText: {
    fontSize: 13.5,
    color: colors.text.primary,
    fontWeight: fontWeights.bold,
  },
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 42,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: colors.neutral.gray50,
  },
});

export default OnlineOrdersCard;
