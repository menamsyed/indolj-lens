import { Platform, TextStyle } from 'react-native';

/**
 * Indolj Merchant POS — Single Source of Truth Typography System
 * Professional Font Family across the entire application
 */

export const primaryFontFamily = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

// Backward compatibility exports
export const robotoFontFamily = primaryFontFamily;

export const fonts = {
  regular: primaryFontFamily,
  medium: primaryFontFamily,
  semiBold: primaryFontFamily,
  bold: primaryFontFamily,
  light: primaryFontFamily,
} as const;

export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
} as const;

export const typography = {
  // Headings
  h1: {
    fontFamily: primaryFontFamily,
    fontSize: 28,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.5,
    lineHeight: 34,
  } as TextStyle,

  h2: {
    fontFamily: primaryFontFamily,
    fontSize: 22,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.4,
    lineHeight: 28,
  } as TextStyle,

  h3: {
    fontFamily: primaryFontFamily,
    fontSize: 18,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.2,
    lineHeight: 24,
  } as TextStyle,

  // Greeting & Title
  greetingTitle: {
    fontFamily: primaryFontFamily,
    fontSize: 28,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.5,
    lineHeight: 34,
  } as TextStyle,

  greetingSubtitle: {
    fontFamily: primaryFontFamily,
    fontSize: 14,
    fontWeight: fontWeights.regular,
    letterSpacing: -0.1,
    lineHeight: 20,
  } as TextStyle,

  // Body text
  bodyLarge: {
    fontFamily: primaryFontFamily,
    fontSize: 16,
    fontWeight: fontWeights.regular,
    letterSpacing: -0.1,
    lineHeight: 22,
  } as TextStyle,

  bodyMedium: {
    fontFamily: primaryFontFamily,
    fontSize: 14,
    fontWeight: fontWeights.medium,
    letterSpacing: -0.1,
    lineHeight: 20,
  } as TextStyle,

  bodyBold: {
    fontFamily: primaryFontFamily,
    fontSize: 14,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.1,
    lineHeight: 20,
  } as TextStyle,

  // Captions & Labels
  caption: {
    fontFamily: primaryFontFamily,
    fontSize: 12,
    fontWeight: fontWeights.regular,
    letterSpacing: 0,
    lineHeight: 16,
  } as TextStyle,

  fieldLabel: {
    fontFamily: primaryFontFamily,
    fontSize: 10.5,
    fontWeight: fontWeights.semiBold,
    letterSpacing: 0.6,
    lineHeight: 14,
  } as TextStyle,

  fieldInput: {
    fontFamily: primaryFontFamily,
    fontSize: 15,
    fontWeight: fontWeights.medium,
    letterSpacing: -0.1,
    lineHeight: 20,
  } as TextStyle,

  fieldSuffix: {
    fontFamily: primaryFontFamily,
    fontSize: 15,
    fontWeight: fontWeights.regular,
    letterSpacing: -0.1,
    lineHeight: 20,
  } as TextStyle,

  biometricLabel: {
    fontFamily: primaryFontFamily,
    fontSize: 14,
    fontWeight: fontWeights.medium,
    letterSpacing: -0.1,
    lineHeight: 20,
  } as TextStyle,

  // Buttons
  primaryButton: {
    fontFamily: primaryFontFamily,
    fontSize: 16,
    fontWeight: fontWeights.semiBold,
    letterSpacing: 0.2,
    lineHeight: 22,
  } as TextStyle,

  buttonText: {
    fontFamily: primaryFontFamily,
    fontSize: 15,
    fontWeight: fontWeights.semiBold,
  } as TextStyle,
} as const;

export default typography;
