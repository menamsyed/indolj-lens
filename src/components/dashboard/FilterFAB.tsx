import React, { useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { VectorIcon } from '../common/VectorIcon';
import { useTheme } from '../../context/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { Colors } from '../../styles/colors';
import { fontWeights } from '../../styles/typography';
import { ScreenMetrics, moderateScale, scale } from '../../utils/responsive';

export interface FilterFABProps {
  onPress: () => void;
  activeCount?: number;
}

export function FilterFAB({ onPress, activeCount = 0 }: FilterFABProps): React.JSX.Element {
  const { colors } = useTheme();
  const metrics = useResponsive();
  const styles = useMemo(() => createStyles(colors, metrics), [colors, metrics]);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = (): void => {
    Animated.spring(scaleAnim, {
      toValue: 0.86,
      useNativeDriver: true,
      speed: 40,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = (): void => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 14,
      bounciness: 10,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel="Open filters"
    >
      <Animated.View style={[styles.fab, { transform: [{ scale: scaleAnim }] }]}>
        <VectorIcon name="filter" size={22} color={colors.text.white} strokeWidth={2.2} />
        {activeCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{activeCount}</Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const createStyles = (colors: Colors, metrics: ScreenMetrics) => {
  const fabSize = Math.max(44, scale(56, metrics));
  const badgeSize = scale(18, metrics);

  return StyleSheet.create({
    fab: {
      width: fabSize,
      height: fabSize,
      borderRadius: fabSize / 2,
      backgroundColor: colors.brand.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.neutral.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 8,
    },
    badge: {
      position: 'absolute',
      top: -scale(2, metrics),
      right: -scale(2, metrics),
      minWidth: badgeSize,
      height: badgeSize,
      borderRadius: badgeSize / 2,
      backgroundColor: colors.status.error,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: scale(3, metrics),
      borderWidth: 1,
      borderColor: colors.surface.background,
    },
    badgeText: {
      fontSize: moderateScale(8, 0.3, metrics),
      fontWeight: fontWeights.bold,
      color: colors.text.white,
    },
  });
};

export default FilterFAB;
