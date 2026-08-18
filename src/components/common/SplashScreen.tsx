import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { Colors } from '../../styles/colors';
import { fontWeights } from '../../styles/typography';
import { ScreenMetrics, moderateScale, scale, verticalScale } from '../../utils/responsive';

// Logo asset path
const LOGO_SOURCE = require('../../assets/logo.png');

export interface SplashScreenProps {
  /** Optional loading message or status indicator */
  message?: string;
}

export function SplashScreen({ message }: SplashScreenProps): React.JSX.Element {
  const { colors } = useTheme();
  const metrics = useResponsive();
  const styles = useMemo(() => createStyles(colors, metrics), [colors, metrics]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.neutral.white}
      />
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Image
            source={LOGO_SOURCE}
            style={styles.logoImage}
            resizeMode="contain"
            accessibilityLabel="Indolj Lens Logo"
          />
        </Animated.View>
        {Boolean(message) && (
          <Text style={styles.statusText}>{message}</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: Colors, metrics: ScreenMetrics) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(20, 0.5, metrics),
  },
  logoWrapper: {
    width: '90%',
    maxWidth: scale(440, metrics),
    height: verticalScale(240, metrics),
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  statusText: {
    marginTop: verticalScale(24, metrics),
    fontSize: moderateScale(14, 0.3, metrics),
    color: colors.neutral.gray500,
    fontWeight: fontWeights.medium,
  },
});

export default SplashScreen;
