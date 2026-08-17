/**
 * Indolj Merchant POS — Centralized Color Palette Specification
 * `lightColors`/`darkColors` share the exact same key shape (`Colors`) so any screen can switch
 * between them at runtime via ThemeContext without any component needing to change which keys it
 * reads. Note: `border.light`/`border.dark` are two distinct border-weight options used side by
 * side in the app (not a light/dark-theme pair) — both exist, with their own value, in each palette.
 */

export const lightColors = {
  brand: {
    primary: '#540000',
    pressed: '#3D0000',
    tint: '#FCEBEB',
    deep: '#3A0000',
    secondary: '#17181C',
  },

  accent: {
    warm: '#F5A623',
    warmTintLight: '#FEF3E2',
    freshGreen: '#1FA463',
    freshGreenTintLight: '#E7F6EE',
    purple: '#8E44AD',
    purpleBg: '#F5EEF8',
    blue: '#2980B9',
    blueBg: '#EBF5FB',
    teal: '#16A085',
    turquoise: '#1ABC9C',
    orange: '#E67E22',
    orangeBg: '#FEF5E7',
    amber: '#F39C12',
    amberBg: '#FEF9E7',
    red: '#E74C3C',
    redBg: '#FDEDEC',
    green: '#27AE60',
    greenBg: '#E8F8F5',
  },

  page: {
    light: '#F2F3F5',
    dark: '#121317',
  },

  surface: {
    light: '#FFFFFF',
    dark: '#1C1D22',
    card: '#FFFFFF',
    background: '#F2F3F5',
    fieldFillLight: '#F6F6F7',
    inputBg: '#F6F6F7',
  },

  text: {
    primary: '#17181C',
    secondary: '#6C7079',
    muted: '#A0A4AC',
    light: '#FFFFFF',
    inverse: '#FFFFFF',
    white: '#FFFFFF',
  },

  status: {
    success: '#1FA463',
    successBg: '#E7F6EE',
    warning: '#F5A623',
    warningBg: '#FEF3E2',
    error: '#540000',
    errorBg: '#FCEBEB',
    info: '#3B82F6',
    infoBg: '#EFF6FF',
  },

  border: {
    light: '#E9EAEC',
    dark: '#31333A',
    input: '#E9EAEC',
    brandRed: '#540000',
    focus: '#540000',
    green: '#A9DFBF',
    red: '#FADBD8',
  },

  chart: {
    green: '#27AE60',
    greenBg: '#E8F8F5',
    greenBorder: '#A9DFBF',
    purple: '#8E44AD',
    purpleBg: '#F5EEF8',
    blue: '#2980B9',
    blueBg: '#EBF5FB',
    teal: '#16A085',
    turquoise: '#1ABC9C',
    orange: '#E67E22',
    orangeBg: '#FEF5E7',
    amber: '#F39C12',
    amberBg: '#FEF9E7',
    red: '#E74C3C',
    redBg: '#FDEDEC',
    redBorder: '#FADBD8',
  },

  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    gray50: '#F6F6F7',
    gray100: '#F2F3F5',
    gray200: '#E9EAEC',
    gray300: '#CBD5E1',
    gray400: '#A0A4AC',
    gray500: '#6C7079',
    gray700: '#31333A',
    gray900: '#17181C',
    disabledBtn: '#E9EAEC',
    disabledText: '#A0A4AC',
  },
};

export type Colors = typeof lightColors;

export const darkColors: Colors = {
  brand: {
    primary: '#540000',
    pressed: '#3D0000',
    tint: '#3A0000',
    deep: '#540000',
    secondary: '#F3F4F6',
  },

  accent: {
    warm: '#F5A623',
    warmTintLight: '#3A2C14',
    freshGreen: '#2BBE76',
    freshGreenTintLight: '#13301F',
    purple: '#A569BD',
    purpleBg: '#2C1E38',
    blue: '#5DADE2',
    blueBg: '#1B2A38',
    teal: '#48C9B0',
    turquoise: '#1ABC9C',
    orange: '#F39C12',
    orangeBg: '#3A2C14',
    amber: '#F4D03F',
    amberBg: '#3A3214',
    red: '#FF4D4D',
    redBg: '#3A0F0F',
    green: '#2ECC71',
    greenBg: '#13301F',
  },

  page: {
    light: '#F2F3F5',
    dark: '#121317',
  },

  surface: {
    light: '#FFFFFF',
    dark: '#1C1D22',
    card: '#1C1D22',
    background: '#121317',
    fieldFillLight: '#25262C',
    inputBg: '#25262C',
  },

  text: {
    primary: '#F3F4F6',
    secondary: '#A0A4AC',
    muted: '#71757D',
    light: '#FFFFFF',
    inverse: '#17181C',
    white: '#FFFFFF',
  },

  status: {
    success: '#2BBE76',
    successBg: '#13301F',
    warning: '#F5A623',
    warningBg: '#3A2C14',
    error: '#FF4D4D',
    errorBg: '#3A0F0F',
    info: '#5B9BF6',
    infoBg: '#152238',
  },

  border: {
    light: '#31333A',
    dark: '#71757D',
    input: '#31333A',
    brandRed: '#540000',
    focus: '#540000',
    green: '#1E4620',
    red: '#3A0000',
  },

  chart: {
    green: '#2ECC71',
    greenBg: '#13301F',
    greenBorder: '#1E4620',
    purple: '#A569BD',
    purpleBg: '#2C1E38',
    blue: '#5DADE2',
    blueBg: '#1B2A38',
    teal: '#48C9B0',
    turquoise: '#1ABC9C',
    orange: '#F39C12',
    orangeBg: '#3A2C14',
    amber: '#F4D03F',
    amberBg: '#3A3214',
    red: '#FF4D4D',
    redBg: '#3A0F0F',
    redBorder: '#3A0F0F',
  },

  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    gray50: '#25262C',
    gray100: '#2C2D33',
    gray200: '#31333A',
    gray300: '#44464D',
    gray400: '#71757D',
    gray500: '#A0A4AC',
    gray700: '#CBD5E1',
    gray900: '#F3F4F6',
    disabledBtn: '#31333A',
    disabledText: '#71757D',
  },
};

// Default/static export — kept for any leftover non-reactive usage, always the light palette.
// Screens/components should prefer `useTheme().colors` for a theme-reactive palette.
export const colors = lightColors;
export default colors;
