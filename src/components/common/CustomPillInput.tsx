import React, { useMemo, useRef, useState } from 'react';
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { IconName, VectorIcon } from './VectorIcon';
import { useTheme } from '../../context/ThemeContext';
import { Colors } from '../../styles/colors';
import { typography, fontWeights } from '../../styles/typography';

export interface CustomPillInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  leftIcon: IconName;
  suffix?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  disabled?: boolean;
}

export function CustomPillInput({
  label,
  value,
  onChangeText,
  placeholder,
  leftIcon,
  suffix,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  disabled = false,
}: CustomPillInputProps): React.JSX.Element {
  const { colors, isDarkMode } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(!secureTextEntry);

  const togglePasswordVisibility = (): void => {
    setIsPasswordVisible((prev) => !prev);
  };

  const handleContainerPress = (): void => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  };

  // In dark mode, left icon renders in whitish placeholder color (colors.text.muted)
  const leftIconColor = isDarkMode ? colors.text.muted : colors.brand.primary;

  return (
    <View style={styles.outerWrapper}>
      <TouchableWithoutFeedback onPress={handleContainerPress} disabled={disabled}>
        <View
          style={[
            styles.pillContainer,
            isFocused && styles.pillContainerFocused,
            Boolean(error) && styles.pillContainerError,
          ]}
        >
          {/* Left Tinted Square Icon Container */}
          <View style={styles.iconSquare}>
            <VectorIcon name={leftIcon} size={20} color={leftIconColor} strokeWidth={2} />
          </View>

          {/* Center Content with flex: 1 and overflow protection */}
          <View style={styles.contentContainer}>
            <Text style={[typography.fieldLabel, styles.label]}>{label.toUpperCase()}</Text>
            <View style={styles.inputRow}>
              <TextInput
                ref={inputRef}
                style={[typography.fieldInput, styles.input, disabled && styles.inputDisabled]}
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
              {Boolean(suffix) && (
                <Text numberOfLines={1} style={[typography.fieldSuffix, styles.suffix]}>
                  {suffix}
                </Text>
              )}
            </View>
          </View>

          {/* Right Action (Eye Toggle for Password) */}
          {secureTextEntry && (
            <TouchableOpacity
              style={styles.eyeButton}
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
      </TouchableWithoutFeedback>
      {Boolean(error) && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  outerWrapper: {
    marginBottom: 10,
  },
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.gray50,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  pillContainerFocused: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.surface.card,
  },
  pillContainerError: {
    borderColor: colors.status.error,
  },
  iconSquare: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.status.errorBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  label: {
    color: colors.text.secondary,
    marginBottom: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    color: colors.text.primary,
    padding: 0,
  },
  inputDisabled: {
    color: colors.text.muted,
  },
  suffix: {
    color: colors.text.muted,
    marginLeft: 'auto',
    flexShrink: 0,
  },
  eyeButton: {
    padding: 8,
    marginRight: 4,
  },
  errorText: {
    marginTop: 4,
    marginLeft: 14,
    fontSize: 10.5,
    color: colors.status.error,
    fontWeight: fontWeights.medium,
  },
});

export default CustomPillInput;
