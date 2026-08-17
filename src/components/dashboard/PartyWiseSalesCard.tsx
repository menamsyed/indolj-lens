import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { useTheme } from '../../context/ThemeContext';
import { Colors } from '../../styles/colors';
import { typography, fontWeights } from '../../styles/typography';

export interface PartyChannelItem {
  name: string;
  salesValue: string;
  orders: number;
  percentage: number;
}

export interface PartyWiseSalesCardProps {
  parties?: PartyChannelItem[];
  isLoading?: boolean;
}

const DEFAULT_PARTIES: PartyChannelItem[] = [
  { name: 'Takeaway', salesValue: 'Rs.38,120.20', orders: 4, percentage: 100 },
];

export function PartyWiseSalesCard({
  parties = DEFAULT_PARTIES,
  isLoading = false,
}: PartyWiseSalesCardProps): React.JSX.Element {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (isLoading) {
    return (
      <View style={styles.cardContainer}>
        <View style={styles.headerRow}>
          <SkeletonLoader width={130} height={18} borderRadius={4} />
          <SkeletonLoader width={60} height={12} borderRadius={3} />
        </View>
        <View style={styles.centerSection}>
          <SkeletonLoader width={70} height={70} shape="circle" style={styles.skeletonCircle} />
          <SkeletonLoader width={80} height={14} borderRadius={4} style={styles.skeletonItem} />
          <SkeletonLoader width={100} height={20} borderRadius={4} style={styles.skeletonItem} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.cardContainer}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[typography.h3, styles.cardTitle]}>Party wise Sales</Text>
      </View>

      {/* One ring card per real party/channel */}
      {parties.length > 0 ? (
        <View style={parties.length > 1 ? styles.partiesRow : undefined}>
          {parties.map((party) => (
            <View key={party.name} style={[styles.centerSection, parties.length > 1 && styles.partyCell]}>
              <View style={styles.percentageRing}>
                <Text style={[typography.h3, styles.ringPercentageText]}>{party.percentage}%</Text>
              </View>

              <Text style={[typography.bodyMedium, styles.channelLabel]}>{party.name}</Text>
              <Text style={[typography.greetingTitle, styles.boldSalesValue]}>{party.salesValue}</Text>
              <Text style={[typography.caption, styles.orderCountBadge]}>{party.orders} Orders</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={[typography.caption, styles.emptyText]}>No party-wise data for this period.</Text>
      )}
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
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 14,
    color: colors.text.primary,
  },
  subtitleText: {
    fontSize: 11,
    color: colors.text.muted,
  },
  partiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  partyCell: {
    width: '50%',
  },
  centerSection: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  percentageRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    borderColor: colors.chart.green,
    backgroundColor: colors.chart.greenBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  ringPercentageText: {
    fontSize: 14,
    color: colors.chart.green,
    fontWeight: fontWeights.bold,
  },
  channelLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  boldSalesValue: {
    fontSize: 22,
    color: colors.text.primary,
    fontWeight: fontWeights.bold,
    marginBottom: 2,
    textAlign: 'center',
  },
  orderCountBadge: {
    color: colors.text.muted,
  },
  emptyText: {
    fontSize: 12,
    color: colors.text.muted,
    textAlign: 'center',
    paddingVertical: 8,
  },
  skeletonCircle: {
    marginBottom: 12,
  },
  skeletonItem: {
    marginBottom: 6,
  },
});

export default PartyWiseSalesCard;
