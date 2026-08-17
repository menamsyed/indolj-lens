import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Colors } from '../../styles/colors';
import { fontWeights } from '../../styles/typography';

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
  const styles = useMemo(() => createStyles(colors), [colors]);
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

const createStyles = (colors: Colors) => StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
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
    fontSize: 16,
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
