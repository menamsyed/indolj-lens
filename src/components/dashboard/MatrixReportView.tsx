import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { VectorIcon } from '../common/VectorIcon';
import { MatrixDataTable } from '../common/DataTable';
import { useTheme } from '../../context/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { Colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { MatrixTableResponse } from '../../api/services/widgetService';
import { ScreenMetrics, moderateScale, scale } from '../../utils/responsive';

export interface MatrixReportViewProps {
  title: string;
  subtitle?: string;
  tableData?: MatrixTableResponse | null;
  onBackPress?: () => void;
}

export function MatrixReportView({
  title,
  subtitle = '11 Aug 2026 - 11 Aug 2026',
  tableData,
  onBackPress,
}: MatrixReportViewProps): React.JSX.Element {
  const { colors } = useTheme();
  const metrics = useResponsive();
  const styles = useMemo(() => createStyles(colors, metrics), [colors, metrics]);
  const rows = tableData?.tbody ?? [];

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
            (rows) and horizontally (wide tables, 5-6+ columns) inside DataTable itself.
            Column names, cell formatting, and the TOTAL footer are all derived from the raw
            thead/tbody/total response fields inside MatrixDataTable — nothing hardcoded here. */}
        <MatrixDataTable thead={tableData?.thead ?? []} tbody={rows} total={tableData?.total} />
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
