import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { VectorIcon } from '../common/VectorIcon';
import { FilterFAB } from './FilterFAB';
import { useTheme } from '../../context/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { Colors } from '../../styles/colors';
import { typography, fontWeights } from '../../styles/typography';
import { ScreenMetrics, moderateScale, scale, verticalScale } from '../../utils/responsive';

export interface FloatingFilterBarProps {
  isDateDefault: boolean;
  isBranchDefault: boolean;
  dateLabel: string;
  branchName: string;
  activeCount: number;
  onPress: () => void;
}

// Compact floating cluster (summary pill + FAB) anchored bottom-right.
// Elevated above the bottom tab bar (bottom: 96) so it never gets covered by the tab bar container.
export function FloatingFilterBar({
  isDateDefault,
  isBranchDefault,
  dateLabel,
  branchName,
  activeCount,
  onPress,
}: FloatingFilterBarProps): React.JSX.Element {
  const { colors } = useTheme();
  const metrics = useResponsive();
  const styles = useMemo(() => createStyles(colors, metrics), [colors, metrics]);

  return (
    <View style={styles.wrapper}>
      {activeCount > 0 && (
        <TouchableOpacity style={styles.summaryPill} onPress={onPress} activeOpacity={0.85}>
          {!isDateDefault && (
            <View style={styles.summaryItem}>
              <VectorIcon name="calendar" size={12} color={colors.brand.primary} />
              <Text style={[typography.caption, styles.summaryText]} numberOfLines={1}>
                {dateLabel}
              </Text>
            </View>
          )}

          {!isDateDefault && !isBranchDefault && <View style={styles.summaryDivider} />}

          {!isBranchDefault && (
            <View style={styles.summaryItem}>
              <VectorIcon name="store" size={12} color={colors.brand.primary} />
              <Text style={[typography.caption, styles.summaryText]} numberOfLines={1}>
                {branchName}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}
      <FilterFAB onPress={onPress} activeCount={activeCount} />
    </View>
  );
}

const createStyles = (colors: Colors, metrics: ScreenMetrics) => StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: scale(20, metrics),
    bottom: verticalScale(96, metrics),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10, metrics),
    zIndex: 10,
  },
  summaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: scale(220, metrics),
    height: Math.max(44, verticalScale(34, metrics)),
    borderRadius: moderateScale(17, 0.5, metrics),
    paddingHorizontal: scale(12, metrics),
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: colors.border.light,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(5, metrics),
    flexShrink: 1,
  },
  summaryDivider: {
    width: 1,
    height: scale(14, metrics),
    backgroundColor: colors.border.light,
    marginHorizontal: scale(8, metrics),
  },
  summaryText: {
    fontSize: moderateScale(12, 0.3, metrics),
    color: colors.text.primary,
    fontWeight: fontWeights.semiBold,
    maxWidth: scale(90, metrics),
  },
});

export default FloatingFilterBar;
