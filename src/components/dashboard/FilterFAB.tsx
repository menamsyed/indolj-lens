import React, { useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { VectorIcon } from '../common/VectorIcon';
import { useTheme } from '../../context/ThemeContext';
import { Colors } from '../../styles/colors';
import { fontWeights } from '../../styles/typography';

export interface FilterFABProps {
  onPress: () => void;
  activeCount?: number;
}

export function FilterFAB({ onPress, activeCount = 0 }: FilterFABProps): React.JSX.Element {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = (): void => {
    Animated.spring(scale, {
      toValue: 0.86,
      useNativeDriver: true,
      speed: 40,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = (): void => {
    Animated.spring(scale, {
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
      <Animated.View style={[styles.fab, { transform: [{ scale }] }]}>
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

const createStyles = (colors: Colors) => StyleSheet.create({
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.status.error,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1,
    borderColor: colors.surface.background,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: fontWeights.bold,
    color: colors.text.white,
  },
});

export default FilterFAB;
