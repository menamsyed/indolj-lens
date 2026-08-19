import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { VectorIcon } from '../common/VectorIcon';
import { DataTable, DataTableColumn } from '../common/DataTable';
import { useTheme } from '../../context/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { Colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { SaleSummaryRecord } from '../../types/dashboard';
import { ScreenMetrics, moderateScale, scale } from '../../utils/responsive';

const COLUMNS: DataTableColumn<SaleSummaryRecord>[] = [
  { key: 'tokenNo', header: 'Token no.', flex: 1.2, renderCell: (row) => row.tokenNo },
  { key: 'time', header: 'Time', flex: 1, align: 'center', renderCell: (row) => row.time },
  { key: 'branch', header: 'Branch', flex: 1.2, align: 'right', renderCell: (row) => row.branch },
];

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

        {/* Records Table — bounded to the remaining space (flex: 1); only the rows scroll */}
        <DataTable
          columns={COLUMNS}
          data={records}
          keyExtractor={(row, idx) => `${row.tokenNo}-${idx}`}
          footer={{ label: 'TOTAL' }}
        />
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
      shadowColor: colors.neutral.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
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
  });
};

export default SaleSummaryView;
