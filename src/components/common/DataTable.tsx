import React, { useMemo, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { VectorIcon, IconName } from './VectorIcon';
import { useTheme } from '../../context/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { Colors } from '../../styles/colors';
import { typography, fontWeights } from '../../styles/typography';
import { formatCurrency, parseNumber } from '../../utils/formatters';
import { ScreenMetrics, moderateScale, scale } from '../../utils/responsive';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  /** Raw (unscaled) fixed pixel width. Set on every column to get a wide/many-column table
   * that scrolls horizontally; omit to size the column proportionally via `flex` instead. */
  width?: number;
  flex?: number;
  align?: 'left' | 'center' | 'right';
  renderCell: (row: T, rowIndex: number) => string;
}

export interface DataTableFooter {
  label: string;
  value?: string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  keyExtractor?: (row: T, index: number) => string;
  emptyIcon?: IconName;
  emptyText?: string;
  emptySubtext?: string;
  footer?: DataTableFooter;
}

// Fixed height, internally-scrollable table: the caller sizes this via flex (it fills
// whatever space its parent gives it) — only the rows scroll, never the screen around it.
// A column with `width` set switches the whole table into fixed-width/horizontal-scroll mode
// (for wide matrix reports); a column with only `flex` keeps proportional, no-scroll columns.
export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyIcon = 'inbox',
  emptyText = 'No Data Available',
  emptySubtext = 'There are no records to show for the selected period.',
  footer,
}: DataTableProps<T>): React.JSX.Element {
  const { colors } = useTheme();
  const metrics = useResponsive();
  const styles = useMemo(() => createStyles(colors, metrics), [colors, metrics]);
  // Drives the fixed-width header's horizontal position — native-driven so it tracks the
  // body's horizontal scroll with no JS-bridge lag, and needs no ref/scrollTo synchronization.
  const scrollX = useRef(new Animated.Value(0)).current;

  const isFixedWidth = columns.some((column) => column.width !== undefined);

  const columnSizeStyle = (column: DataTableColumn<T>) =>
    column.width !== undefined ? { width: scale(column.width, metrics) } : { flex: column.flex ?? 1 };

  const columnAlignStyle = (column: DataTableColumn<T>) =>
    column.align === 'center' ? styles.alignCenter : column.align === 'right' ? styles.alignRight : null;

  const headerCells = columns.map((column) => (
    <Text
      key={column.key}
      style={[typography.bodyMedium, styles.headerCell, columnSizeStyle(column), columnAlignStyle(column)]}
      numberOfLines={1}
    >
      {column.header}
    </Text>
  ));

  const bodyRows = data.map((row, rowIndex) => (
    <View
      key={keyExtractor ? keyExtractor(row, rowIndex) : `row-${rowIndex}`}
      style={[styles.tableRow, rowIndex % 2 === 1 && styles.tableRowAlt]}
    >
      {columns.map((column, columnIndex) => (
        <Text
          key={column.key}
          style={[
            typography.bodyMedium,
            columnIndex === 0 ? styles.cellTextBold : styles.cellText,
            columnSizeStyle(column),
            columnAlignStyle(column),
          ]}
        >
          {column.renderCell(row, rowIndex)}
        </Text>
      ))}
    </View>
  ));

  return (
    <View style={styles.tableShadowWrapper}>
    <View style={styles.tableCard}>
      {/* Sticky header — a static sibling above the scroll, not scroll content, so it never
          moves vertically. For fixed-width tables it also has to track the body's horizontal
          scroll to stay column-aligned; a translateX driven by the same native `scrollX` the
          body reports does that with zero JS-bridge lag, instead of a second, independently
          draggable header ScrollView kept in sync via scrollTo. */}
      {isFixedWidth ? (
        <View style={styles.headerClip}>
          <Animated.View
            style={[styles.tableHeaderRow, { transform: [{ translateX: Animated.multiply(scrollX, -1) }] }]}
          >
            {headerCells}
          </Animated.View>
        </View>
      ) : (
        <View style={styles.tableHeaderRow}>{headerCells}</View>
      )}

      {/* Rendered as a flex:1 sibling instead of nested inside the ScrollView's (top-aligned)
          content flow — there's nothing to scroll when empty, and nesting it left the icon/
          message pinned near the top of the table's body instead of centered within it. */}
      {data.length === 0 ? (
        <View style={styles.emptyRow}>
          <View style={styles.emptyIconCircle}>
            <VectorIcon name={emptyIcon} size={26} color={colors.text.muted} strokeWidth={1.5} />
          </View>
          <Text style={[typography.bodyMedium, styles.emptyTitle]}>{emptyText}</Text>
          {Boolean(emptySubtext) && (
            <Text style={[typography.caption, styles.emptySubtext]}>{emptySubtext}</Text>
          )}
        </View>
      ) : (
        <ScrollView style={styles.tableVerticalScroll}>
          {isFixedWidth ? (
            <Animated.ScrollView
              horizontal
              showsHorizontalScrollIndicator
              // The header mirrors this offset with a raw translateX and no clamping, so letting
              // the ScrollView bounce/overscroll past its real bounds (the default on both
              // platforms) pushes contentOffset.x past what the header's content can cover,
              // desyncing the two right when there's actually enough width to overscroll from —
              // exactly the wide, many-column tables (e.g. Branch Wise Sales' 6 columns) this
              // horizontal-scroll path exists for.
              bounces={false}
              overScrollMode="never"
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: true }
              )}
              scrollEventThrottle={16}
            >
              <View>{bodyRows}</View>
            </Animated.ScrollView>
          ) : (
            bodyRows
          )}
        </ScrollView>
      )}

      {/* Pinned outside the scroll, always visible — hidden entirely when there's no data,
          since a "TOTAL" of zero rows isn't a meaningful figure to show. */}
      {footer && data.length > 0 && (
        <View style={styles.totalFooterRow}>
          <Text style={[typography.bodyMedium, styles.totalLabelText]}>{footer.label}</Text>
          {footer.value !== undefined && (
            <Text style={[typography.h3, styles.totalValueText]}>{footer.value}</Text>
          )}
        </View>
      )}
    </View>
    </View>
  );
}

const createStyles = (colors: Colors, metrics: ScreenMetrics) =>
  StyleSheet.create({
    // Separate from `tableCard` because that view needs `overflow: 'hidden'` to clip the sticky
    // header/rows to the rounded corners — on iOS a shadow on the same view as
    // `overflow: 'hidden'` gets clipped away too, so the shadow lives on this un-clipped wrapper.
    tableShadowWrapper: {
      flex: 1,
      borderRadius: moderateScale(20, 0.5, metrics),
      shadowColor: colors.neutral.black,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 6,
    },
    tableCard: {
      flex: 1,
      backgroundColor: colors.surface.card,
      borderRadius: moderateScale(20, 0.5, metrics),
      overflow: 'hidden',
    },
    tableVerticalScroll: {
      flex: 1,
    },
    // Clips the header's translateX-shifted content to the table's own visible width — the
    // Animated.View inside is naturally as wide as the full (unscrolled) row content, same as
    // a body row, so without this it would render past the table's right edge.
    headerClip: {
      overflow: 'hidden',
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
    alignCenter: {
      textAlign: 'center',
    },
    alignRight: {
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
      flex: 1,
      padding: moderateScale(24, 0.5, metrics),
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyIconCircle: {
      width: scale(56, metrics),
      height: scale(56, metrics),
      borderRadius: scale(28, metrics),
      backgroundColor: colors.neutral.gray100,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: scale(12, metrics),
    },
    emptyTitle: {
      fontWeight: fontWeights.semiBold,
      color: colors.text.primary,
      marginBottom: scale(4, metrics),
    },
    emptySubtext: {
      color: colors.text.muted,
      textAlign: 'center',
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

// Column meaning is read from the real header name, not its position — table column order
// isn't guaranteed to stay fixed across endpoints (see docs/POS_DASHBOARD_WORKFLOW.md Step 6.7).
export function formatMatrixCell(cell: string | number | null | undefined, headerName: string): string {
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

export interface MatrixDataTableProps {
  thead: string[];
  tbody: (string | number)[][];
  total?: number | string;
}

type MatrixRow = (string | number)[];

// Thin wrapper around DataTable for API responses shaped as a thead/tbody matrix (branch-wise,
// item-wise, category-wise, and online-orders reports all share this shape) — column names,
// widths/alignment, cell formatting, and the TOTAL footer are all derived here so callers never
// need to hand-build a DataTableColumn[] or hardcode a column name of their own.
export function MatrixDataTable({ thead, tbody, total }: MatrixDataTableProps): React.JSX.Element {
  // thead and tbody aren't guaranteed to agree on column count — a live branch-wise-sales
  // response has returned only 2 header names for 6-column rows. Render every column the DATA
  // actually has (the widest row, or thead.length if there's no data yet), with a blank header
  // label for any column past the end of `thead`, so real values are never silently dropped
  // just because their header name wasn't sent.
  const columnCount = Math.max(thead.length, tbody[0]?.length ?? 0);
  const columns: DataTableColumn<MatrixRow>[] = useMemo(
    () =>
      Array.from({ length: columnCount }, (_, idx) => {
        const header = thead[idx] ?? '';
        return {
          key: `col-${idx}`,
          header,
          width: idx === 0 ? 150 : 110,
          align: idx === 0 ? 'left' : 'right',
          renderCell: (row: MatrixRow) => formatMatrixCell(row[idx], header),
        };
      }),
    [thead, columnCount]
  );

  // `total` can arrive as an empty array (`[]`) from the API when there's no data for the
  // period — that's truthy in JS, so only a real scalar is treated as an actual total.
  const totalAmount =
    typeof total === 'number' || typeof total === 'string' ? formatCurrency(total) : null;

  return (
    <DataTable
      columns={columns}
      data={tbody}
      keyExtractor={(_row, idx) => `matrix-row-${idx}`}
      footer={totalAmount ? { label: 'TOTAL', value: totalAmount } : undefined}
    />
  );
}

export default DataTable;
