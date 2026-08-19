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
import { MatrixTableResponse } from '../../api/services/widgetService';
import { formatCurrency, parseNumber } from '../../utils/formatters';
import { ScreenMetrics, moderateScale, scale } from '../../utils/responsive';

type MatrixRow = (string | number)[];

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
  //
  // thead and tbody aren't guaranteed to agree on column count — a live branch-wise-sales
  // response has returned only 2 header names for 6-column rows. Render every column the DATA
  // actually has (the widest row, or headers.length if there's no data yet), with a blank header
  // label for any column past the end of `headers`, so real values are never silently dropped
  // just because their header name wasn't sent.
  const columnCount = Math.max(headers.length, rows[0]?.length ?? 0);
  const columns: DataTableColumn<MatrixRow>[] = useMemo(
    () =>
      Array.from({ length: columnCount }, (_, idx) => {
        const header = headers[idx] ?? '';
        return {
          key: `col-${idx}`,
          header,
          width: idx === 0 ? 150 : 110,
          align: idx === 0 ? 'left' : 'right',
          renderCell: (row: MatrixRow) => formatMatrixCell(row[idx], header),
        };
      }),
    [headers, columnCount]
  );

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

        {/* Matrix Table — bounded to the remaining space (flex: 1); scrolls both vertically
            (rows) and horizontally (wide tables, 5-6+ columns) inside DataTable itself */}
        <DataTable
          columns={columns}
          data={rows}
          keyExtractor={(_row, idx) => `matrix-row-${idx}`}
          footer={totalAmount ? { label: 'TOTAL', value: totalAmount } : undefined}
        />
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
  });
};

export default MatrixReportView;
