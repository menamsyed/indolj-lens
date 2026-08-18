import React, { useEffect, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLoginContainer } from '../../hooks/useLoginContainer';
import { CustomPillInput } from '../common/CustomPillInput';
import { ToggleSwitch } from '../common/ToggleSwitch';
import { VectorIcon } from '../common/VectorIcon';
import { useTheme } from '../../context/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { Colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { ScreenMetrics, moderateScale, scale, verticalScale } from '../../utils/responsive';

const SECURITY_ICON = require('../../assets/security.png');

export function LoginForm(): React.JSX.Element {
  const {
    merchantName,
    email,
    password,
    rememberMe,
    merchantError,
    emailError,
    passwordError,
    isLoading,
    isBiometricAvailable,
    hasStoredSession,
    setMerchantName,
    setEmail,
    setPassword,
    setRememberMe,
    handleSubmit,
    handleBiometricAuth,
  } = useLoginContainer();

  const { colors, isDarkMode } = useTheme();
  const metrics = useResponsive();
  const styles = useMemo(() => createStyles(colors, metrics), [colors, metrics]);
  const showFingerprintButton = isBiometricAvailable && hasStoredSession;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // In dark mode, render biometric fingerprint icon & border in whitish placeholder color (colors.text.muted)
  const biometricBorderColor = isDarkMode ? colors.text.muted : colors.brand.primary;
  const securityIconTintColor = isDarkMode ? colors.text.muted : undefined;

  useEffect(() => {
    if (showFingerprintButton) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.06,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.96,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [pulseAnim, showFingerprintButton]);

  return (
    <View style={styles.formContainer}>
      {/* Field 1: Merchant slug — resolves to {merchant}.indoljpos.com */}
      <CustomPillInput
        label="Merchant"
        value={merchantName}
        onChangeText={setMerchantName}
        placeholder="myrestaurant"
        suffix=".indoljpos.com"
        leftIcon="store"
        autoCapitalize="none"
        error={merchantError}
        disabled={isLoading}
      />

      {/* Field 2: Username */}
      <CustomPillInput
        label="Username"
        value={email}
        onChangeText={setEmail}
        placeholder="user@mail.com"
        leftIcon="user"
        keyboardType="email-address"
        autoCapitalize="none"
        error={emailError}
        disabled={isLoading}
      />

      {/* Field 3: Password */}
      <CustomPillInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
        leftIcon="lock"
        secureTextEntry
        error={passwordError}
        disabled={isLoading}
      />

      {/* Biometric Login Toggle Switch Row with space-between */}
      <View style={styles.toggleRow}>
        <ToggleSwitch
          label="Biometric login"
          value={rememberMe}
          onValueChange={setRememberMe}
          disabled={isLoading}
        />
      </View>

      {/* Primary Log In Button (Takes Entire Width) */}
      <TouchableOpacity
        style={[styles.loginButtonFullWidth, isLoading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
        activeOpacity={0.85}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.text.white} size="small" />
        ) : (
          <>
            <Text style={[typography.primaryButton, styles.loginButtonText]}>Log in</Text>
            <View style={styles.arrowIconWrapper}>
              <VectorIcon name="arrow-right" size={18} color={colors.text.white} strokeWidth={2.5} />
            </View>
          </>
        )}
      </TouchableOpacity>

      {/* Biometric Fingerprint Button (Next Line, Centered, security.png asset) */}
      {showFingerprintButton && (
        <View style={styles.biometricContainerCentered}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={[styles.animatedBiometricCircle, { borderColor: biometricBorderColor }]}
              onPress={handleBiometricAuth}
              disabled={isLoading}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Sign in with Fingerprint Biometrics"
            >
              <Image
                source={SECURITY_ICON}
                style={[styles.securityIconImage, Boolean(securityIconTintColor) && { tintColor: securityIconTintColor }]}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: Colors, metrics: ScreenMetrics) => {
  const biometricCircleSize = scale(64, metrics);

  return StyleSheet.create({
    formContainer: {
      width: '100%',
    },
    toggleRow: {
      marginBottom: verticalScale(20, metrics),
      marginTop: verticalScale(4, metrics),
    },
    loginButtonFullWidth: {
      width: '100%',
      height: Math.max(44, verticalScale(52, metrics)),
      backgroundColor: colors.brand.primary,
      borderRadius: moderateScale(26, 0.5, metrics),
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.brand.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,
    },
    buttonDisabled: {
      opacity: 0.65,
    },
    loginButtonText: {
      color: colors.text.white,
      marginRight: scale(8, metrics),
    },
    arrowIconWrapper: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    biometricContainerCentered: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: verticalScale(22, metrics),
    },
    animatedBiometricCircle: {
      width: biometricCircleSize,
      height: biometricCircleSize,
      borderRadius: biometricCircleSize / 2,
      borderWidth: 1.5,
      borderColor: colors.brand.primary,
      backgroundColor: colors.status.errorBg,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.brand.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
      padding: moderateScale(12, 0.5, metrics),
    },
    securityIconImage: {
      width: '100%',
      height: '100%',
    },
  });
};

export default LoginForm;
