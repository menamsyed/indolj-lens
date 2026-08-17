import { colors } from './colors';
import { typography, fonts, fontWeights } from './typography';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  full: 9999,
} as const;

export const theme = {
  colors,
  spacing,
  typography,
  fonts,
  fontWeights,
  radius,
} as const;

export { typography, fonts, fontWeights };
export type Theme = typeof theme;
export default theme;
