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
import { MatrixTableResponse } from '../../api/services/widgetService';
import { formatCurrency, parseNumber } from '../../utils/formatters';
import { ScreenMetrics, moderateScale, scale } from '../../utils/responsive';

// Column meaning is read from the real header name, not its position — table column order
// isn't guaranteed to stay fixed across endpoints (see docs/POS_DASHBOARD_WORKFLOW.md Step 6.7).
function formatMatrixCell(cell: string | number | null | undefined, headerName: string): string {
  if (cell === null || cell === undefined || cell === '') return '—';
  const label = headerName.toLowerCase();
  if (label.includes('percentage') || label.includes('share')) {
    return `${parseNumber(cell)}%`;
  }
  if (
    label.includes('sales') ||
    label.includes('amount') ||
    label.includes('revenue') ||
    label.includes('forcast') ||
    label.includes('profit')
  ) {
    return formatCurrency(cell);
  }
  return String(cell);
}

export interface MatrixReportViewProps {
  title: string;
  subtitle?: string;
  tableData?: MatrixTableResponse | null;
  defaultHead?: string[];
  defaultRows?: (string | number)[][];
  onBackPress?: () => void;
}

export function MatrixReportView({
  title,
  subtitle = '11 Aug 2026 - 11 Aug 2026',
  tableData,
  defaultHead = ['Name', 'Sales', 'Qty', 'Share'],
  defaultRows = [],
  onBackPress,
}: MatrixReportViewProps): React.JSX.Element {
  const { colors } = useTheme();
  const metrics = useResponsive();
  const styles = useMemo(() => createStyles(colors, metrics), [colors, metrics]);
  const headers = tableData?.thead && tableData.thead.length > 0 ? tableData.thead : defaultHead;
  const rows = tableData?.tbody && tableData.tbody.length > 0 ? tableData.tbody : defaultRows;
  const totalAmount = tableData?.total ? formatCurrency(tableData.total) : null;

  // First column (usually a name/label) gets more room; every other real column gets a fixed
  // width and the table scrolls horizontally — don't silently drop columns past the 4th, several
  // real endpoints (branch-wise-sales, new-order-list) return 6.
  const FIRST_COL_WIDTH = scale(150, metrics);
  const OTHER_COL_WIDTH = scale(110, metrics);
  const columnWidth = (idx: number): number => (idx === 0 ? FIRST_COL_WIDTH : OTHER_COL_WIDTH);

  return (
    <View style={styles.container}>
      {/* Top Header Bar — static, never scrolls */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBackPress}
          activeOpacity={0.8}
          accessibilityLabel={`Back from ${title}`}
        >
          <VectorIcon name="back" size={20} color={colors.text.white} strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.headerTitleGroup}>
          <Text style={[typography.h2, styles.headerTitle]}>{title}</Text>
          <Text style={[typography.caption, styles.headerSubtitle]}>{subtitle}</Text>
        </View>
      </View>

      {/* Body: fixed-height area, NOT itself scrollable — only the table inside it scrolls */}
      <View style={styles.bodyContainer}>
        {/* Count Badge Row — static */}
        <View style={styles.recordsHeaderRow}>
          <VectorIcon name="check" size={14} color={colors.text.secondary} />
          <Text style={[typography.caption, styles.recordsCountText]}>{rows.length} entries</Text>
        </View>

        {/* Matrix Table Card — bounded to the remaining space (flex: 1); the table itself
            scrolls both vertically (rows) and horizontally (wide tables, 5-6+ columns) */}
        <View style={styles.tableCard}>
          <ScrollView style={styles.tableVerticalScroll}>
            <ScrollView horizontal showsHorizontalScrollIndicator={rows.length > 0}>
              <View>
                {/* Table Header Row */}
                <View style={styles.tableHeaderRow}>
                  {headers.map((h, idx) => (
                    <Text
                      key={h}
                      style={[
                        typography.bodyMedium,
                        styles.headerCell,
                        { width: columnWidth(idx) },
                        idx === 0 ? styles.cellLeft : styles.cellRight,
                      ]}
                    >
                      {h}
                    </Text>
                  ))}
                </View>

                {/* Table Rows */}
                {rows.length === 0 ? (
                  <View style={styles.emptyRow}>
                    <Text style={[typography.bodyMedium, styles.emptyText]}>No records found for this period</Text>
                  </View>
                ) : (
                  rows.map((row, rIdx) => (
                    <View
                      key={`matrix-row-${rIdx}`}
                      style={[
                        styles.tableRow,
                        rIdx % 2 === 1 && styles.tableRowAlt,
                      ]}
                    >
                      {row.map((cell, cIdx) => (
                        <Text
                          key={`cell-${rIdx}-${cIdx}`}
                          style={[
                            typography.bodyMedium,
                            cIdx === 0 ? styles.cellTextBold : styles.cellText,
                            { width: columnWidth(cIdx) },
                            cIdx === 0 ? styles.cellLeft : styles.cellRight,
                          ]}
                        >
                          {formatMatrixCell(cell, headers[cIdx] || '')}
                        </Text>
                      ))}
                    </View>
                  ))
                )}
              </View>
            </ScrollView>
          </ScrollView>

          {/* Total Footer Row — pinned outside the scroll, always visible, full width */}
          {totalAmount && (
            <View style={styles.totalFooterRow}>
              <Text style={[typography.bodyMedium, styles.totalLabelText]}>TOTAL</Text>
              <Text style={[typography.h3, styles.totalValueText]}>{totalAmount}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: Colors, metrics: ScreenMetrics) => {
  const roundIconSize = Math.max(44, scale(44, metrics));

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
      fontSize: moderateScale(13, 0.3, metrics),
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
    cellLeft: {
      textAlign: 'left',
    },
    cellRight: {
      textAlign: 'right',
      paddingRight: scale(4, metrics),
    },
    cellTextBold: {
      fontSize: moderateScale(13.5, 0.3, metrics),
      fontWeight: fontWeights.bold,
      color: colors.text.primary,
    },
    cellText: {
      fontSize: moderateScale(13, 0.3, metrics),
      color: colors.text.primary,
    },
    emptyRow: {
      padding: moderateScale(24, 0.5, metrics),
      alignItems: 'center',
    },
    emptyText: {
      color: colors.text.muted,
    },
    totalFooterRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.brand.tint,
      paddingHorizontal: scale(16, metrics),
      paddingVertical: scale(14, metrics),
    },
    totalLabelText: {
      fontSize: moderateScale(14, 0.3, metrics),
      fontWeight: fontWeights.bold,
      color: colors.brand.primary,
      letterSpacing: 0.5,
    },
    totalValueText: {
      fontSize: moderateScale(16, 0.3, metrics),
      fontWeight: fontWeights.bold,
      color: colors.brand.primary,
    },
  });
};

export default MatrixReportView;
