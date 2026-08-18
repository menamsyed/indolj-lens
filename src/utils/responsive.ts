/**
 * Device-independent scaling helpers (size-matters-style formulas), plus tablet and
 * minimum-touch-target utilities. See CONTEXT.md for the responsiveness conventions
 * this module establishes — every `createStyles(colors, ...)` factory that needs a
 * scaled value should route it through here rather than a raw pixel literal.
 */
import { Dimensions, PixelRatio } from 'react-native';

export const GUIDELINE_BASE_WIDTH = 375;
export const GUIDELINE_BASE_HEIGHT = 812;

// Android's own "sw600dp" tablet bucket — separates all phones (even large ones in
// landscape, whose *shortest* side stays under 600) from iPads/Android tablets.
export const TABLET_MIN_DIMENSION = 600;

// Once a device is classified as a tablet, clamp the raw width/height ratio to this
// range so scale()/moderateScale() don't blow fixed-pixel values up 2x+ on a 10" screen.
const TABLET_RATIO_CLAMP: [number, number] = [0.85, 1.15];

export interface ScreenMetrics {
  width: number;
  height: number;
  isTablet: boolean;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export function getScreenMetrics(width?: number, height?: number): ScreenMetrics {
  const win = Dimensions.get('window');
  const w = width ?? win.width;
  const h = height ?? win.height;
  return { width: w, height: h, isTablet: Math.min(w, h) >= TABLET_MIN_DIMENSION };
}

const widthRatio = (metrics: ScreenMetrics): number => {
  const raw = metrics.width / GUIDELINE_BASE_WIDTH;
  return metrics.isTablet ? clamp(raw, TABLET_RATIO_CLAMP[0], TABLET_RATIO_CLAMP[1]) : raw;
};

const heightRatio = (metrics: ScreenMetrics): number => {
  const raw = metrics.height / GUIDELINE_BASE_HEIGHT;
  return metrics.isTablet ? clamp(raw, TABLET_RATIO_CLAMP[0], TABLET_RATIO_CLAMP[1]) : raw;
};

/** Scales a size against guideline width — use for horizontal dims/paddings/radii. */
export function scale(size: number, metrics: ScreenMetrics = getScreenMetrics()): number {
  return PixelRatio.roundToNearestPixel(size * widthRatio(metrics));
}

/** Scales a size against guideline height — use for vertical dims/paddings. */
export function verticalScale(size: number, metrics: ScreenMetrics = getScreenMetrics()): number {
  return PixelRatio.roundToNearestPixel(size * heightRatio(metrics));
}

/**
 * Dampened horizontal scale — `factor` controls how much of the full `scale()` delta
 * is applied (0 = no scaling, 1 = full scale()). Convention used across this app:
 * ~0.5 for spacing/dimensions, ~0.3 for fontSize (keeps type from ballooning on
 * wide phones/tablets).
 */
export function moderateScale(
  size: number,
  factor = 0.5,
  metrics: ScreenMetrics = getScreenMetrics()
): number {
  return PixelRatio.roundToNearestPixel(size + (scale(size, metrics) - size) * factor);
}

/** Dampened vertical scale — same `factor` convention as `moderateScale`. */
export function moderateVerticalScale(
  size: number,
  factor = 0.5,
  metrics: ScreenMetrics = getScreenMetrics()
): number {
  return PixelRatio.roundToNearestPixel(size + (verticalScale(size, metrics) - size) * factor);
}

// Shared cap so cards/forms/sheets don't stretch full-bleed on tablets. Apply this ONLY
// to a screen's outermost scroll/content container — inner flex/percentage layouts
// reflow correctly once their parent is capped, so no per-component special-casing.
export const CONTENT_MAX_WIDTH = 640;
export function tabletContentCap(metrics: ScreenMetrics): {
  maxWidth?: number;
  alignSelf?: 'center';
  width?: '100%';
} {
  return metrics.isTablet
    ? { maxWidth: CONTENT_MAX_WIDTH, alignSelf: 'center', width: '100%' }
    : {};
}

// Minimum accessible touch-target size (iOS HIG / Material guidance).
export const MIN_TOUCH_SIZE = 44;

export const minTouchTarget = {
  minWidth: MIN_TOUCH_SIZE,
  minHeight: MIN_TOUCH_SIZE,
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
};

/** Symmetric hitSlop that pads a smaller visual control up to MIN_TOUCH_SIZE. */
export function minTouchHitSlop(visualSize: number): {
  top: number;
  bottom: number;
  left: number;
  right: number;
} {
  const pad = Math.max(0, (MIN_TOUCH_SIZE - visualSize) / 2);
  return { top: pad, bottom: pad, left: pad, right: pad };
}

export default {
  GUIDELINE_BASE_WIDTH,
  GUIDELINE_BASE_HEIGHT,
  TABLET_MIN_DIMENSION,
  getScreenMetrics,
  scale,
  verticalScale,
  moderateScale,
  moderateVerticalScale,
  CONTENT_MAX_WIDTH,
  tabletContentCap,
  MIN_TOUCH_SIZE,
  minTouchTarget,
  minTouchHitSlop,
};
