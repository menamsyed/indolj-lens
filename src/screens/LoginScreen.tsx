import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';
import { Colors } from '../styles/colors';
import { VectorIcon } from '../components/common/VectorIcon';
import { LoginForm } from '../components/auth/LoginForm';
import { typography } from '../styles/typography';
import {
  ScreenMetrics,
  moderateScale,
  scale,
  tabletContentCap,
  verticalScale,
} from '../utils/responsive';

export function LoginScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const metrics = useResponsive();
  const styles = useMemo(() => createStyles(colors, metrics), [colors, metrics]);
  // Dynamic 4-period time-aware greeting calculation with exclamation mark
  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) return 'Good morning!';
    if (hour >= 12 && hour < 17) return 'Good afternoon!';
    if (hour >= 17 && hour < 22) return 'Good evening!';
    return 'Good night!';
  };

  // Ambient animations
  const bowlBob = useRef(new Animated.Value(0)).current;
  const steam1 = useRef(new Animated.Value(0)).current;
  const steam2 = useRef(new Animated.Value(0)).current;
  const steam3 = useRef(new Animated.Value(0)).current;

  // Sheet entrance
  const sheetTranslateY = useRef(new Animated.Value(24)).current;
  const sheetOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Bowl bobbing loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(bowlBob, {
          toValue: -3,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bowlBob, {
          toValue: 3,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 2. Steam wisps staggered loops
    const animateSteam = (anim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2800,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateSteam(steam1, 0);
    animateSteam(steam2, 900);
    animateSteam(steam3, 1800);

    // 3. Sheet entrance
    Animated.parallel([
      Animated.spring(sheetTranslateY, {
        toValue: 0,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(sheetOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [bowlBob, sheetOpacity, sheetTranslateY, steam1, steam2, steam3]);

  return (
    <SafeAreaView style={styles.screenContainer} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.primary} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Red Header Top Section */}
        <View style={styles.topRedHeader}>
          {/* Ambient Translucent Accent Circle on Right */}
          <View style={styles.ambientCircle} />

          {/* Left Greeting Text */}
          <View style={styles.greetingTextContainer}>
            <Text style={[typography.greetingTitle, styles.greetingTitle]}>{getGreeting()}</Text>
            <Text style={[typography.greetingSubtitle, styles.greetingSubtitle]}>
              Let's get the kitchen running
            </Text>
          </View>

          {/* Right Steaming Bowl Icon */}
          <View style={styles.bowlWrapper}>
            <View style={styles.steamWispRow}>
              <Animated.View
                style={[
                  styles.steamWisp,
                  styles.steamPos1,
                  {
                    opacity: steam1.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, 0.8, 0],
                    }),
                    transform: [
                      {
                        translateY: steam1.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -16],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.steamWisp,
                  styles.steamPos2,
                  {
                    opacity: steam2.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, 0.8, 0],
                    }),
                    transform: [
                      {
                        translateY: steam2.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -16],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.steamWisp,
                  styles.steamPos3,
                  {
                    opacity: steam3.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, 0.8, 0],
                    }),
                    transform: [
                      {
                        translateY: steam3.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -16],
                        }),
                      },
                    ],
                  },
                ]}
              />
            </View>

            <Animated.View style={{ transform: [{ translateY: bowlBob }] }}>
              <VectorIcon name="bowl" size={44} color={colors.text.white} strokeWidth={2} />
            </Animated.View>
          </View>
        </View>

        {/* White Card Container */}
        <Animated.View
          style={[
            styles.whiteCardContainer,
            {
              opacity: sheetOpacity,
              transform: [{ translateY: sheetTranslateY }],
            },
          ]}
        >
          <ScrollView
            contentContainerStyle={styles.formScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <LoginForm />
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: Colors, metrics: ScreenMetrics) => {
  const ambientCircleSize = scale(170, metrics);
  const steamWispSize = scale(3, metrics);

  return StyleSheet.create({
    screenContainer: {
      flex: 1,
      backgroundColor: colors.brand.primary,
    },
    keyboardView: {
      flex: 1,
    },
    topRedHeader: {
      height: '32%',
      backgroundColor: colors.brand.primary,
      paddingHorizontal: scale(24, metrics),
      // SafeAreaView now reserves the real notch/status-bar/dynamic-island inset —
      // this is just modest breathing room below it, not a device-specific hack.
      paddingTop: verticalScale(12, metrics),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden',
    },
    ambientCircle: {
      position: 'absolute',
      top: -scale(30, metrics),
      right: -scale(30, metrics),
      width: ambientCircleSize,
      height: ambientCircleSize,
      borderRadius: ambientCircleSize / 2,
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
    },
    greetingTextContainer: {
      flex: 1,
      justifyContent: 'center',
      zIndex: 2,
    },
    greetingTitle: {
      color: colors.text.white,
      marginBottom: verticalScale(6, metrics),
    },
    greetingSubtitle: {
      color: 'rgba(255, 255, 255, 0.85)',
    },
    bowlWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: scale(16, metrics),
      zIndex: 2,
    },
    steamWispRow: {
      width: scale(40, metrics),
      height: verticalScale(16, metrics),
      position: 'relative',
      marginBottom: -verticalScale(4, metrics),
    },
    steamWisp: {
      position: 'absolute',
      bottom: 0,
      width: steamWispSize,
      height: verticalScale(10, metrics),
      borderRadius: steamWispSize / 2,
      backgroundColor: colors.text.white,
    },
    steamPos1: {
      left: scale(8, metrics),
    },
    steamPos2: {
      left: scale(18, metrics),
    },
    steamPos3: {
      left: scale(28, metrics),
    },
    whiteCardContainer: {
      flex: 1,
      backgroundColor: colors.surface.card,
      borderTopLeftRadius: moderateScale(32, 0.5, metrics),
      borderTopRightRadius: moderateScale(32, 0.5, metrics),
      paddingHorizontal: scale(22, metrics),
      paddingTop: verticalScale(28, metrics),
      shadowColor: colors.neutral.black,
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
      ...tabletContentCap(metrics),
    },
    formScrollContent: {
      paddingBottom: verticalScale(24, metrics),
    },
  });
};

export default LoginScreen;
