import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../styles/colors';
import { VectorIcon } from '../components/common/VectorIcon';
import { LoginForm } from '../components/auth/LoginForm';
import { typography } from '../styles/typography';

export function LoginScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
    <View style={styles.screenContainer}>
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
          <LoginForm />
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
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
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  ambientCircle: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  greetingTextContainer: {
    flex: 1,
    justifyContent: 'center',
    zIndex: 2,
  },
  greetingTitle: {
    color: colors.text.white,
    marginBottom: 6,
  },
  greetingSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  bowlWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
    zIndex: 2,
  },
  steamWispRow: {
    width: 40,
    height: 16,
    position: 'relative',
    marginBottom: -4,
  },
  steamWisp: {
    position: 'absolute',
    bottom: 0,
    width: 3,
    height: 10,
    borderRadius: 1.5,
    backgroundColor: colors.text.white,
  },
  steamPos1: {
    left: 8,
  },
  steamPos2: {
    left: 18,
  },
  steamPos3: {
    left: 28,
  },
  whiteCardContainer: {
    flex: 1,
    backgroundColor: colors.surface.card,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 22,
    paddingTop: 28,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
});

export default LoginScreen;
