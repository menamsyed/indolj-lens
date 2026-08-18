import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { Colors } from '../../styles/colors';
import { fontWeights } from '../../styles/typography';
import { ScreenMetrics, moderateScale, verticalScale } from '../../utils/responsive';

export interface CustomButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive';
}

export function CustomButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
}: CustomButtonProps): React.JSX.Element {
  const { colors } = useTheme();
  const metrics = useResponsive();
  const styles = useMemo(() => createStyles(colors, metrics), [colors, metrics]);
  const isInteractive = !loading && !disabled;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'primary' && styles.primaryButton,
        variant === 'secondary' && styles.secondaryButton,
        variant === 'outline' && styles.outlineButton,
        variant === 'destructive' && styles.destructiveButton,
        !isInteractive && styles.disabledButton,
      ]}
      onPress={onPress}
      disabled={!isInteractive}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'outline' ? colors.brand.primary : colors.text.light} />
      ) : (
        <Text
          style={[
            styles.text,
            styles.activeText,
            variant === 'outline' && styles.outlineText,
            !isInteractive && styles.disabledText,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const createStyles = (colors: Colors, metrics: ScreenMetrics) => StyleSheet.create({
  button: {
    height: Math.max(44, verticalScale(52, metrics)),
    borderRadius: moderateScale(14, 0.5, metrics),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(20, 0.5, metrics),
  },
  primaryButton: {
    backgroundColor: colors.brand.primary,
  },
  secondaryButton: {
    backgroundColor: colors.neutral.disabledBtn,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.brand.primary,
  },
  destructiveButton: {
    backgroundColor: colors.status.error,
  },
  disabledButton: {
    backgroundColor: colors.neutral.disabledBtn,
  },
  text: {
    fontSize: moderateScale(16, 0.3, metrics),
    fontWeight: fontWeights.bold,
  },
  activeText: {
    color: colors.text.light,
  },
  outlineText: {
    color: colors.brand.primary,
  },
  disabledText: {
    color: colors.neutral.disabledText,
  },
});

export default CustomButton;
