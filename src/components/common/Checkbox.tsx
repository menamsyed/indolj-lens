import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { Colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { ScreenMetrics, minTouchHitSlop, moderateScale, scale } from '../../utils/responsive';
import { VectorIcon } from './VectorIcon';

export interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Checkbox({
  label,
  checked,
  onChange,
  disabled = false,
}: CheckboxProps): React.JSX.Element {
  const { colors } = useTheme();
  const metrics = useResponsive();
  const styles = useMemo(() => createStyles(colors, metrics), [colors, metrics]);

  const toggle = (): void => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={toggle}
      activeOpacity={0.7}
      disabled={disabled}
      hitSlop={minTouchHitSlop(34)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
    >
      <View
        style={[
          styles.box,
          checked && styles.boxChecked,
          disabled && styles.boxDisabled,
        ]}
      >
        {checked && (
          <VectorIcon name="check" size={14} color={colors.text.light} />
        )}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const createStyles = (colors: Colors, metrics: ScreenMetrics) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateScale(6, 0.5, metrics),
  },
  box: {
    width: scale(22, metrics),
    height: scale(22, metrics),
    borderRadius: moderateScale(6, 0.5, metrics),
    borderWidth: 2,
    borderColor: colors.border.dark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(10, metrics),
    backgroundColor: colors.surface.background,
  },
  boxChecked: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  boxDisabled: {
    opacity: 0.5,
  },
  label: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
});

export default Checkbox;
