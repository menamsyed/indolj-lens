import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../styles/colors';

export interface CurvedTabBarBackgroundProps {
  width: number;
  height?: number;
  notchWidth?: number;
  notchDepth?: number;
  backgroundColor?: string;
}

export const CurvedTabBarBackground: React.FC<CurvedTabBarBackgroundProps> = ({
  width,
  height = 65,
  notchWidth = 84,
  notchDepth = 38,
  backgroundColor = colors.surface.card,
}) => {
  if (width <= 0) {
    return null;
  }

  const cx = width / 2;
  const halfNotch = notchWidth / 2;
  const x0 = cx - halfNotch; // Start of cutout notch
  const x1 = cx + halfNotch; // End of cutout notch

  // Smooth cubic bezier control points for concave notch transition:
  // Control points 1 & 4 keep tangents horizontal at top edge (y = 0)
  // Control points 2 & 3 keep tangents horizontal at bottom dip (y = notchDepth)
  const cp1X = x0 + notchWidth * 0.18;
  const cp1Y = 0;
  const cp2X = cx - notchWidth * 0.22;
  const cp2Y = notchDepth;

  const cp3X = cx + notchWidth * 0.22;
  const cp3Y = notchDepth;
  const cp4X = x1 - notchWidth * 0.18;
  const cp4Y = 0;

  const pathData = [
    `M 0 0`,
    `L ${x0} 0`,
    `C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${cx} ${notchDepth}`,
    `C ${cp3X} ${cp3Y}, ${cp4X} ${cp4Y}, ${x1} 0`,
    `L ${width} 0`,
    `L ${width} ${height}`,
    `L 0 ${height}`,
    `Z`,
  ].join(' ');

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={width} height={height} style={styles.svg}>
        <Path d={pathData} fill={backgroundColor} />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  svg: {
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 8,
  },
});

export default CurvedTabBarBackground;
