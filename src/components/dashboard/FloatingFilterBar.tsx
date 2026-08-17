import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { VectorIcon } from '../common/VectorIcon';
import { FilterFAB } from './FilterFAB';
import { useTheme } from '../../context/ThemeContext';
import { Colors } from '../../styles/colors';
import { typography, fontWeights } from '../../styles/typography';

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
  const styles = useMemo(() => createStyles(colors), [colors]);

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

const createStyles = (colors: Colors) => StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: 20,
    bottom: 96,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 10,
  },
  summaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 220,
    height: 34,
    borderRadius: 17,
    paddingHorizontal: 12,
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
    gap: 5,
    flexShrink: 1,
  },
  summaryDivider: {
    width: 1,
    height: 14,
    backgroundColor: colors.border.light,
    marginHorizontal: 8,
  },
  summaryText: {
    fontSize: 12,
    color: colors.text.primary,
    fontWeight: fontWeights.semiBold,
    maxWidth: 90,
  },
});

export default FloatingFilterBar;
