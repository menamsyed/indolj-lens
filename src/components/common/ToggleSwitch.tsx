import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { VectorIcon } from './VectorIcon';
import { useTheme } from '../../context/ThemeContext';
import { Colors } from '../../styles/colors';
import { fontWeights } from '../../styles/typography';

export interface ToggleSwitchProps {
  label?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  variant?: 'simple' | 'theme';
}

export function ToggleSwitch({
  label,
  value,
  onValueChange,
  disabled = false,
  variant = 'simple',
}: ToggleSwitchProps): React.JSX.Element {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: value ? 1 : 0,
      tension: 50,
      friction: 7,
      useNativeDriver: false,
    }).start();
  }, [animatedValue, value]);

  const toggle = (): void => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  const isThemeVariant = variant === 'theme';

  // Track color interpolates from daytime soft slate to primary brand color
  const trackBackgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#CBD5E1', colors.brand.primary],
  });

  // Smooth thumb glide output based on variant
  const thumbTranslateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: isThemeVariant ? [2, 26] : [2, 20],
  });

  // Micro spring scale bounce effect during glide
  const thumbScale = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.12, 1],
  });

  // Sun icon rotation & fade (Theme variant)
  const sunOpacity = animatedValue.interpolate({
    inputRange: [0, 0.6],
    outputRange: [1, 0],
  });

  const sunRotate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  // Moon icon rotation & fade (Theme variant)
  const moonOpacity = animatedValue.interpolate({
    inputRange: [0.4, 1],
    outputRange: [0, 1],
  });

  const moonRotate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['-180deg', '0deg'],
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={toggle}
      activeOpacity={0.85}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
    >
      {Boolean(label) && <Text style={styles.label}>{label}</Text>}

      <Animated.View
        style={[
          isThemeVariant ? styles.trackTheme : styles.trackSimple,
          { backgroundColor: trackBackgroundColor },
          disabled && styles.trackDisabled,
        ]}
      >
        <Animated.View
          style={[
            isThemeVariant ? styles.thumbTheme : styles.thumbSimple,
            {
              transform: [
                { translateX: thumbTranslateX },
                { scale: thumbScale },
              ],
            },
          ]}
        >
          {isThemeVariant && (
            <>
              {/* Daytime Sun Icon */}
              <Animated.View
                style={[
                  styles.iconWrapper,
                  {
                    opacity: sunOpacity,
                    transform: [{ rotate: sunRotate }],
                  },
                ]}
              >
                <VectorIcon name="sun" size={14} color="#F59E0B" />
              </Animated.View>

              {/* Nighttime Moon Icon */}
              <Animated.View
                style={[
                  styles.iconWrapper,
                  styles.iconAbsolute,
                  {
                    opacity: moonOpacity,
                    transform: [{ rotate: moonRotate }],
                  },
                ]}
              >
                <VectorIcon name="moon" size={14} color={colors.brand.primary} />
              </Animated.View>
            </>
          )}
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  trackSimple: {
    width: 46,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  trackTheme: {
    width: 56,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  trackDisabled: {
    opacity: 0.5,
  },
  thumbSimple: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  thumbTheme: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconAbsolute: {
    position: 'absolute',
  },
  label: {
    fontSize: 13.5,
    fontWeight: fontWeights.medium,
    color: colors.text.primary,
  },
});

export default ToggleSwitch;
