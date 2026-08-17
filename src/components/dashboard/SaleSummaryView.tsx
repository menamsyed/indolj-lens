import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { VectorIcon } from '../common/VectorIcon';
import { useTheme } from '../../context/ThemeContext';
import { Colors } from '../../styles/colors';
import { typography, fontWeights } from '../../styles/typography';
import { SaleSummaryRecord } from '../../types/dashboard';

export interface SaleSummaryViewProps {
  dateLabel?: string;
  totalSale?: string;
  totalProfit?: string;
  records?: SaleSummaryRecord[];
  onBackPress?: () => void;
}

const DEFAULT_RECORDS: SaleSummaryRecord[] = [
  { tokenNo: '#A55-3', time: '12:59 PM', branch: 'Sales Demo' },
  { tokenNo: '#A55-7', time: '01:04 PM', branch: 'Sales Demo' },
  { tokenNo: '#S1-1', time: '12:01 PM', branch: 'Sales Demo' },
  { tokenNo: '#S1-1', time: '12:57 PM', branch: 'Sales Demo' },
];

export function SaleSummaryView({
  dateLabel = '10 Aug 2026',
  totalSale = 'Rs. 38,120',
  totalProfit = 'Rs. 0',
  records = DEFAULT_RECORDS,
  onBackPress,
}: SaleSummaryViewProps): React.JSX.Element {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBackPress}
          activeOpacity={0.8}
          accessibilityLabel="Back to Dashboard"
        >
          <VectorIcon name="back" size={20} color={colors.text.white} strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.headerTitleGroup}>
          <Text style={[typography.h2, styles.headerTitle]}>Sale Summary</Text>
          <Text style={[typography.caption, styles.headerSubtitle]}>{dateLabel}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent}>
        {/* Metric Cards Grid (2 Cards) */}
        <View style={styles.metricsGrid}>
          {/* Card 1: Total Sale */}
          <View style={styles.summaryCard}>
            <View style={styles.iconSquare}>
              <VectorIcon name="store" size={20} color={colors.brand.primary} />
            </View>
            <Text style={[typography.caption, styles.cardLabel]}>Total Sale</Text>
            <Text style={[typography.h2, styles.cardValueRed]}>{totalSale}</Text>
          </View>

          {/* Card 2: Total Profit */}
          <View style={styles.summaryCard}>
            <View style={styles.iconSquare}>
              <VectorIcon name="arrow-right" size={20} color={colors.brand.primary} />
            </View>
            <Text style={[typography.caption, styles.cardLabel]}>Total Profit</Text>
            <Text style={[typography.h2, styles.cardValueRed]}>{totalProfit}</Text>
          </View>
        </View>

        {/* Records Count Subtitle */}
        <View style={styles.recordsHeaderRow}>
          <VectorIcon name="check" size={14} color={colors.text.secondary} />
          <Text style={[typography.caption, styles.recordsCountText]}>{records.length} records</Text>
        </View>

        {/* Records Matrix Table Card */}
        <View style={styles.tableCard}>
          {/* Table Header */}
          <View style={styles.tableHeaderRow}>
            <Text style={[typography.bodyMedium, styles.headerCell, styles.cellToken]}>Token no.</Text>
            <Text style={[typography.bodyMedium, styles.headerCell, styles.cellTime]}>Time</Text>
            <Text style={[typography.bodyMedium, styles.headerCell, styles.cellBranch]}>Branch</Text>
          </View>

          {/* Table Rows */}
          {records.map((row, idx) => (
            <View
              key={`${row.tokenNo}-${idx}`}
              style={[
                styles.tableRow,
                idx % 2 === 1 && styles.tableRowAlt,
              ]}
            >
              <Text style={[typography.bodyMedium, styles.cellTextBold, styles.cellToken]}>{row.tokenNo}</Text>
              <Text style={[typography.bodyMedium, styles.cellText, styles.cellTime]}>{row.time}</Text>
              <Text style={[typography.bodyMedium, styles.cellText, styles.cellBranch]}>{row.branch}</Text>
            </View>
          ))}

          {/* Total Footer Row */}
          <View style={styles.totalFooterRow}>
            <Text style={[typography.bodyMedium, styles.totalFooterText]}>TOTAL</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.background,
  },
  headerBar: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleGroup: {
    flex: 1,
    marginLeft: 14,
  },
  headerTitle: {
    fontSize: 22,
    color: colors.text.white,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    fontSize: 16,
    color: colors.text.white,
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border.light,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconSquare: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.brand.tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardLabel: {
    color: colors.text.secondary,
    marginBottom: 4,
  },
  cardValueRed: {
    fontSize: 18,
    color: colors.brand.primary,
  },
  recordsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  recordsCountText: {
    color: colors.text.secondary,
  },
  tableCard: {
    backgroundColor: colors.surface.card,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.light,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerCell: {
    fontSize: 13.5,
    fontWeight: fontWeights.bold,
    color: colors.text.white,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.surface.card,
    borderBottomWidth: 1,
    borderColor: colors.border.light,
  },
  tableRowAlt: {
    backgroundColor: colors.neutral.gray50,
  },
  cellToken: {
    flex: 1.2,
  },
  cellTime: {
    flex: 1,
    textAlign: 'center',
  },
  cellBranch: {
    flex: 1.2,
    textAlign: 'right',
  },
  cellTextBold: {
    fontSize: 14,
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
  },
  cellText: {
    fontSize: 13.5,
    color: colors.text.primary,
  },
  totalFooterRow: {
    backgroundColor: colors.brand.tint,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  totalFooterText: {
    fontSize: 14,
    fontWeight: fontWeights.bold,
    color: colors.brand.primary,
    letterSpacing: 0.5,
  },
});

export default SaleSummaryView;
