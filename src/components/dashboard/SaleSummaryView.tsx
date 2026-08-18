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
import { useResponsive } from '../../hooks/useResponsive';
import { Colors } from '../../styles/colors';
import { typography, fontWeights } from '../../styles/typography';
import { SaleSummaryRecord } from '../../types/dashboard';
import { ScreenMetrics, moderateScale, scale } from '../../utils/responsive';

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
  const metrics = useResponsive();
  const styles = useMemo(() => createStyles(colors, metrics), [colors, metrics]);

  return (
    <View style={styles.container}>
      {/* Top Header — static, never scrolls */}
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

      {/* Body: fixed-height area, NOT itself scrollable — only the table inside it scrolls */}
      <View style={styles.bodyContainer}>
        {/* Metric Cards Grid (2 Cards) — static */}
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

        {/* Records Count Subtitle — static */}
        <View style={styles.recordsHeaderRow}>
          <VectorIcon name="check" size={14} color={colors.text.secondary} />
          <Text style={[typography.caption, styles.recordsCountText]}>{records.length} records</Text>
        </View>

        {/* Records Table Card — bounded to the remaining space (flex: 1); only the rows scroll */}
        <View style={styles.tableCard}>
          <ScrollView style={styles.tableVerticalScroll}>
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
          </ScrollView>

          {/* Total Footer Row — pinned outside the scroll, always visible */}
          <View style={styles.totalFooterRow}>
            <Text style={[typography.bodyMedium, styles.totalFooterText]}>TOTAL</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: Colors, metrics: ScreenMetrics) => {
  const roundIconSize = Math.max(44, scale(44, metrics));
  const iconSquareSize = scale(40, metrics);

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface.background,
    },
    headerBar: {
      backgroundColor: colors.brand.primary,
      paddingHorizontal: scale(20, metrics),
      paddingTop: scale(16, metrics),
      paddingBottom: scale(20, metrics),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backButton: {
      width: roundIconSize,
      height: roundIconSize,
      borderRadius: roundIconSize / 2,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitleGroup: {
      flex: 1,
      marginLeft: scale(14, metrics),
    },
    headerTitle: {
      fontSize: moderateScale(22, 0.3, metrics),
      color: colors.text.white,
      marginBottom: scale(2, metrics),
    },
    headerSubtitle: {
      fontSize: moderateScale(13, 0.3, metrics),
      color: 'rgba(255, 255, 255, 0.85)',
    },
    avatarCircle: {
      width: roundIconSize,
      height: roundIconSize,
      borderRadius: roundIconSize / 2,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    avatarText: {
      fontSize: moderateScale(16, 0.3, metrics),
      color: colors.text.white,
    },
    bodyContainer: {
      flex: 1,
      padding: moderateScale(18, 0.5, metrics),
    },
    metricsGrid: {
      flexDirection: 'row',
      gap: scale(12, metrics),
      marginBottom: scale(20, metrics),
    },
    summaryCard: {
      flex: 1,
      backgroundColor: colors.surface.card,
      borderRadius: moderateScale(18, 0.5, metrics),
      padding: moderateScale(16, 0.5, metrics),
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
      borderRadius: moderateScale(12, 0.5, metrics),
      backgroundColor: colors.brand.tint,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: scale(10, metrics),
    },
    cardLabel: {
      color: colors.text.secondary,
      marginBottom: scale(4, metrics),
    },
    cardValueRed: {
      fontSize: moderateScale(18, 0.3, metrics),
      color: colors.brand.primary,
    },
    recordsHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: scale(10, metrics),
      gap: scale(6, metrics),
    },
    recordsCountText: {
      color: colors.text.secondary,
    },
    tableCard: {
      flex: 1,
      backgroundColor: colors.surface.card,
      borderRadius: moderateScale(20, 0.5, metrics),
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border.light,
      shadowColor: colors.neutral.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    tableVerticalScroll: {
      flex: 1,
    },
    tableHeaderRow: {
      flexDirection: 'row',
      backgroundColor: colors.brand.primary,
      paddingHorizontal: scale(16, metrics),
      paddingVertical: scale(14, metrics),
    },
    headerCell: {
      fontSize: moderateScale(13.5, 0.3, metrics),
      fontWeight: fontWeights.bold,
      color: colors.text.white,
    },
    tableRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: scale(16, metrics),
      paddingVertical: scale(14, metrics),
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
      fontSize: moderateScale(14, 0.3, metrics),
      fontWeight: fontWeights.bold,
      color: colors.text.primary,
    },
    cellText: {
      fontSize: moderateScale(13.5, 0.3, metrics),
      color: colors.text.primary,
    },
    totalFooterRow: {
      backgroundColor: colors.brand.tint,
      paddingHorizontal: scale(16, metrics),
      paddingVertical: scale(14, metrics),
    },
    totalFooterText: {
      fontSize: moderateScale(14, 0.3, metrics),
      fontWeight: fontWeights.bold,
      color: colors.brand.primary,
      letterSpacing: 0.5,
    },
  });
};

export default SaleSummaryView;
