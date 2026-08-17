import React, { useMemo, useState } from 'react';
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Colors } from '../../styles/colors';
import { fontWeights } from '../../styles/typography';
import { IconName, VectorIcon } from './VectorIcon';

export interface CustomInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  leftIcon?: IconName;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  disabled?: boolean;
}

export function CustomInput({
  label,
  value,
  onChangeText,
  placeholder,
  leftIcon,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  disabled = false,
}: CustomInputProps): React.JSX.Element {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(!secureTextEntry);

  const togglePasswordVisibility = (): void => {
    setIsPasswordVisible((prev) => !prev);
  };

  const getBorderColor = (): string => {
    if (error) return colors.status.error;
    if (isFocused) return colors.border.focus;
    return colors.border.input;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <View style={[styles.inputWrapper, { borderColor: getBorderColor() }]}>
        {Boolean(leftIcon) && (
          <View style={styles.leftIconWrapper}>
            <VectorIcon
              name={leftIcon!}
              size={18}
              color={isFocused ? colors.brand.primary : colors.text.secondary}
            />
          </View>
        )}
        <TextInput
          style={[styles.input, disabled && styles.inputDisabled]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.muted}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={togglePasswordVisibility}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
          >
            <VectorIcon
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={20}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {Boolean(error) && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: fontWeights.bold,
    color: colors.text.secondary,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: colors.surface.inputBg,
    paddingHorizontal: 14,
  },
  leftIconWrapper: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: colors.text.primary,
    padding: 0,
  },
  inputDisabled: {
    color: colors.text.muted,
  },
  toggleButton: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: colors.status.error,
    fontWeight: fontWeights.medium,
  },
});

export default CustomInput;
