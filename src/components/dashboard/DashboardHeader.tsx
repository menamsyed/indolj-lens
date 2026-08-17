import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { VectorIcon } from '../common/VectorIcon';
import { useTheme } from '../../context/ThemeContext';
import { Colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

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
  const styles = useMemo(() => createStyles(colors), [colors]);

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

const createStyles = (colors: Colors) => StyleSheet.create({
  container: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    minHeight: 80,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    fontSize: 18,
    color: colors.text.white,
  },
  profileTitles: {
    justifyContent: 'center',
  },
  dashboardSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 2,
  },
  cashierName: {
    fontSize: 20,
    color: colors.text.white,
  },
  powerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DashboardHeader;
