import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { VectorIcon } from '../common/VectorIcon';
import { useTheme } from '../../context/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { Colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { ScreenMetrics, moderateScale, scale, verticalScale } from '../../utils/responsive';

export interface DashboardHeaderProps {
  cashierName?: string;
  subtitle?: string;
  onLogoutPress?: () => void;
}

export function DashboardHeader({
  cashierName = 'app cashier',
  subtitle = 'Indolj Lens',
  onLogoutPress,
}: DashboardHeaderProps): React.JSX.Element {
  const { colors } = useTheme();
  const metrics = useResponsive();
  const styles = useMemo(() => createStyles(colors, metrics), [colors, metrics]);

  return (
    <View style={styles.container}>
      {/* Top Header Row */}
      <View style={styles.topRow}>
        <View style={styles.profileSection}>
          {/* Avatar Circle AC */}

          <View style={styles.profileTitles}>
            <Text style={[typography.caption, styles.dashboardSubtitle]}>{subtitle}</Text>
            <Text style={[typography.h2, styles.cashierName]}>{cashierName}</Text>
          </View>
        </View>

        {/* Logout Power Button */}
        <TouchableOpacity
          style={styles.powerButton}
          onPress={onLogoutPress}
          activeOpacity={0.8}
          accessibilityLabel="Sign out"
        >
          <VectorIcon name="log-out" size={20} color={colors.text.white} strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors: Colors, metrics: ScreenMetrics) => {
  const avatarSize = scale(48, metrics);
  const powerButtonSize = Math.max(44, scale(44, metrics));

  return StyleSheet.create({
    container: {
      backgroundColor: colors.brand.primary,
      paddingHorizontal: scale(20, metrics),
      paddingTop: verticalScale(16, metrics),
      paddingBottom: verticalScale(16, metrics),
      minHeight: verticalScale(80, metrics),
      justifyContent: 'center',
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    profileSection: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatarCircle: {
      width: avatarSize,
      height: avatarSize,
      borderRadius: avatarSize / 2,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: scale(12, metrics),
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    avatarText: {
      fontSize: moderateScale(18, 0.3, metrics),
      color: colors.text.white,
    },
    profileTitles: {
      justifyContent: 'center',
    },
    dashboardSubtitle: {
      color: 'rgba(255, 255, 255, 0.85)',
      marginBottom: scale(2, metrics),
    },
    cashierName: {
      fontSize: moderateScale(20, 0.3, metrics),
      color: colors.text.white,
    },
    powerButton: {
      width: powerButtonSize,
      height: powerButtonSize,
      borderRadius: powerButtonSize / 2,
      backgroundColor: 'rgba(255, 255, 255, 0.18)',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
};

export default DashboardHeader;
