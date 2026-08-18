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
import { useResponsive } from '../../hooks/useResponsive';
import { Colors } from '../../styles/colors';
import { fontWeights } from '../../styles/typography';
import { ScreenMetrics, minTouchHitSlop, moderateScale, scale } from '../../utils/responsive';

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
  const metrics = useResponsive();
  const styles = useMemo(() => createStyles(colors, metrics), [colors, metrics]);
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

  // Track/thumb sizes scaled once here so the interpolated travel distance always
  // matches the (also scaled) StyleSheet dimensions below — see createStyles.
  const trackPadding = scale(2, metrics);
  const trackWidth = scale(isThemeVariant ? 56 : 46, metrics);
  const thumbSize = scale(isThemeVariant ? 26 : 22, metrics);
  const thumbTravel = trackWidth - thumbSize - trackPadding * 2;

  // Track color interpolates from daytime soft slate to primary brand color
  const trackBackgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#CBD5E1', colors.brand.primary],
  });

  // Smooth thumb glide output based on variant
  const thumbTranslateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [trackPadding, trackPadding + thumbTravel],
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
      hitSlop={minTouchHitSlop(isThemeVariant ? 30 : 26)}
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

const createStyles = (colors: Colors, metrics: ScreenMetrics) => {
  // Same source of truth as the thumbTravel calc above — width/2 derived from the
  // scaled size itself so the thumb radius always stays perfectly circular.
  const simpleTrackWidth = scale(46, metrics);
  const simpleTrackHeight = scale(26, metrics);
  const themeTrackWidth = scale(56, metrics);
  const themeTrackHeight = scale(30, metrics);
  const simpleThumbSize = scale(22, metrics);
  const themeThumbSize = scale(26, metrics);

  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: scale(2, metrics),
    },
    trackSimple: {
      width: simpleTrackWidth,
      height: simpleTrackHeight,
      borderRadius: simpleTrackHeight / 2,
      justifyContent: 'center',
      paddingHorizontal: scale(2, metrics),
    },
    trackTheme: {
      width: themeTrackWidth,
      height: themeTrackHeight,
      borderRadius: themeTrackHeight / 2,
      justifyContent: 'center',
      paddingHorizontal: scale(2, metrics),
    },
    trackDisabled: {
      opacity: 0.5,
    },
    thumbSimple: {
      width: simpleThumbSize,
      height: simpleThumbSize,
      borderRadius: simpleThumbSize / 2,
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
      width: themeThumbSize,
      height: themeThumbSize,
      borderRadius: themeThumbSize / 2,
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
      fontSize: moderateScale(13.5, 0.3, metrics),
      fontWeight: fontWeights.medium,
      color: colors.text.primary,
    },
  });
};

export default ToggleSwitch;
