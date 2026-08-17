import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, DimensionValue, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Colors } from '../../styles/colors';

export interface SkeletonLoaderProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  shape?: 'rect' | 'circle' | 'text';
  style?: ViewStyle | ViewStyle[];
}

export function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius = 8,
  shape = 'rect',
  style,
}: SkeletonLoaderProps): React.JSX.Element {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const pulseAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.75,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 650,
          useNativeDriver: true,
        }),
      ])
    );

    pulseLoop.start();

    return () => pulseLoop.stop();
  }, [pulseAnim]);

  const computedRadius =
    shape === 'circle'
      ? typeof height === 'number'
        ? height / 2
        : 20
      : borderRadius;

  return (
    <Animated.View
      style={[
        styles.skeletonBase,
        {
          width,
          height,
          borderRadius: computedRadius,
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  skeletonBase: {
    backgroundColor: colors.neutral.gray200,
  },
});

export default SkeletonLoader;
