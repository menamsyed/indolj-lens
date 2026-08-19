import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface CircularProgressProps {
  /** 0-100 */
  percentage: number;
  /** Outer diameter in px — caller passes an already-scaled value, same convention as VectorIcon's `size`. */
  size: number;
  strokeWidth?: number;
  color: string;
  trackColor: string;
  animationDuration?: number;
  children?: React.ReactNode;
}

// A single lightweight arc — one `Circle` for the track plus one animated `Circle` for the
// progress, instead of instantiating a full multi-slice pie-chart library component just to
// show one percentage. Cheap enough to repeat per row in a list.
export function CircularProgress({
  percentage,
  size,
  strokeWidth = 4,
  color,
  trackColor,
  animationDuration = 700,
  children,
}: CircularProgressProps): React.JSX.Element {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: clampedPercentage,
      duration: animationDuration,
      // SVG stroke properties (unlike transform/opacity) can't run on the native driver.
      useNativeDriver: false,
    }).start();
  }, [progress, clampedPercentage, animationDuration]);

  // Counts down from a full circumference (0%) to 0 (100%), which is what shrinks the visible
  // dash gap into a full ring as the value climbs.
  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={styles.rotateToTwelveOClock}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>

      {Boolean(children) && (
        <View style={styles.centerContent} pointerEvents="none">
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // SVG angle 0 starts at 3 o'clock; rotating the whole drawing -90deg moves the progress
  // start point to 12 o'clock, the usual progress-ring convention.
  rotateToTwelveOClock: {
    transform: [{ rotate: '-90deg' }],
  },
  centerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CircularProgress;
