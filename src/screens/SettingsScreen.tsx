import React, { useMemo, useState } from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';
import { Colors } from '../styles/colors';
import { typography, fontWeights } from '../styles/typography';
import {
  ScreenMetrics,
  moderateScale,
  scale,
  tabletContentCap,
  verticalScale,
} from '../utils/responsive';

import { VectorIcon } from '../components/common/VectorIcon';
import { ToggleSwitch } from '../components/common/ToggleSwitch';
import { LogoutConfirmModal } from '../components/dashboard/LogoutConfirmModal';

export function SettingsScreen(): React.JSX.Element {
  const { user, logout } = useAuth();
  const { colors, isDarkMode, toggleDarkMode } = useTheme();
  const metrics = useResponsive();
  const styles = useMemo(() => createStyles(colors, metrics), [colors, metrics]);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);

  const handleConfirmLogout = (): void => {
    setIsLogoutModalOpen(false);
    logout();
  };

  const merchantName = user?.name || 'Merchant';
  const email = user?.email || '—';

  // In dark mode, render icons in bright white/light color for crisp contrast & high visibility
  const iconColor = isDarkMode ? colors.text.white : colors.brand.primary;
  const dangerIconColor = isDarkMode ? '#FF4D4D' : colors.status.error;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.primary} />
      <View style={styles.container}>
        {/* Header: Settings Title + Logout Button */}
        <View style={styles.header}>
          <Text style={[typography.h2, styles.headerTitle]}>Settings</Text>
          <TouchableOpacity
            style={styles.headerLogoutBtn}
            onPress={() => setIsLogoutModalOpen(true)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Logout"
          >
            <VectorIcon name="log-out" size={20} color={colors.text.white} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Centered Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarCircle}>
              {user?.image ? (
                <Image source={{ uri: user.image }} style={styles.avatarImage} />
              ) : (
                <VectorIcon name="user" size={42} color={iconColor} />
              )}
            </View>

            {/* Merchant Name Row */}
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <VectorIcon name="store" size={18} color={iconColor} />
              </View>
              <View style={styles.infoTextGroup}>
                <Text style={[typography.caption, styles.infoLabel]}>MERCHANT NAME</Text>
                <Text style={[typography.bodyMedium, styles.infoValue]} numberOfLines={1}>
                  {merchantName}
                </Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            {/* Email Row */}
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <VectorIcon name="file-text" size={18} color={iconColor} />
              </View>
              <View style={styles.infoTextGroup}>
                <Text style={[typography.caption, styles.infoLabel]}>EMAIL</Text>
                <Text style={[typography.bodyMedium, styles.infoValue]} numberOfLines={1}>
                  {email}
                </Text>
              </View>
            </View>
          </View>

          {/* Preferences & Action List Container */}
          <View style={styles.listContainer}>
            {/* Theme Toggle Row — Spaced Between */}
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={styles.rowIconBox}>
                  <VectorIcon name={isDarkMode ? 'moon' : 'sun'} size={18} color={iconColor} />
                </View>
                <Text style={[typography.bodyMedium, styles.rowLabel]}>
                  {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                </Text>
              </View>
              <ToggleSwitch variant="theme" value={isDarkMode} onValueChange={toggleDarkMode} />
            </View>

            <View style={styles.divider} />

            {/* Logout Row */}
            <TouchableRow style={styles.row} onPress={() => setIsLogoutModalOpen(true)}>
              <View style={styles.rowLeft}>
                <View style={[styles.rowIconBox, styles.rowIconBoxDanger]}>
                  <VectorIcon name="log-out" size={18} color={dangerIconColor} />
                </View>
                <Text style={[typography.bodyMedium, styles.rowLabelDanger]}>Logout</Text>
              </View>
            </TouchableRow>
          </View>
        </ScrollView>

        {/* Logout Confirmation Modal */}
        <LogoutConfirmModal
          visible={isLogoutModalOpen}
          onCancel={() => setIsLogoutModalOpen(false)}
          onConfirmLogout={handleConfirmLogout}
        />
      </View>
    </SafeAreaView>
  );
}

function TouchableRow({
  style,
  onPress,
  children,
}: {
  style: StyleProp<ViewStyle>;
  onPress: () => void;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <TouchableOpacity style={style} onPress={onPress} activeOpacity={0.7}>
      {children}
    </TouchableOpacity>
  );
}

const createStyles = (colors: Colors, metrics: ScreenMetrics) => {
  const avatarSize = scale(80, metrics);
  const infoIconBoxSize = scale(36, metrics);
  const rowIconBoxSize = scale(34, metrics);
  const headerLogoutBtnSize = Math.max(44, scale(44, metrics));

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.brand.primary,
    },
    container: {
      flex: 1,
      backgroundColor: colors.surface.background,
    },
    header: {
      backgroundColor: colors.brand.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: scale(20, metrics),
      paddingTop: verticalScale(16, metrics),
      paddingBottom: verticalScale(16, metrics),
      minHeight: verticalScale(80, metrics),
    },
    headerTitle: {
      color: colors.text.white,
      fontSize: moderateScale(22, 0.3, metrics),
      fontWeight: fontWeights.bold,
    },
    headerLogoutBtn: {
      width: headerLogoutBtnSize,
      height: headerLogoutBtnSize,
      borderRadius: headerLogoutBtnSize / 2,
      backgroundColor: 'rgba(255, 255, 255, 0.18)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollContent: {
      padding: scale(16, metrics),
      paddingBottom: verticalScale(110, metrics),
      ...tabletContentCap(metrics),
    },
    profileCard: {
      backgroundColor: colors.surface.card,
      borderRadius: moderateScale(20, 0.5, metrics),
      padding: moderateScale(20, 0.5, metrics),
      alignItems: 'center',
      marginBottom: verticalScale(16, metrics),
    },
    avatarCircle: {
      width: avatarSize,
      height: avatarSize,
      borderRadius: avatarSize / 2,
      backgroundColor: colors.brand.tint,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: verticalScale(20, metrics),
    },
    avatarImage: {
      width: avatarSize,
      height: avatarSize,
      borderRadius: avatarSize / 2,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      paddingVertical: verticalScale(8, metrics),
      gap: scale(14, metrics),
    },
    infoIconBox: {
      width: infoIconBoxSize,
      height: infoIconBoxSize,
      borderRadius: moderateScale(10, 0.5, metrics),
      backgroundColor: colors.brand.tint,
      justifyContent: 'center',
      alignItems: 'center',
    },
    infoTextGroup: {
      flex: 1,
    },
    infoLabel: {
      fontSize: moderateScale(10.5, 0.3, metrics),
      color: colors.text.muted,
      fontWeight: fontWeights.bold,
      letterSpacing: 0.8,
      marginBottom: verticalScale(2, metrics),
    },
    infoValue: {
      fontSize: moderateScale(15, 0.3, metrics),
      color: colors.text.primary,
      fontWeight: fontWeights.semiBold,
    },
    infoDivider: {
      height: 1,
      backgroundColor: colors.border.light,
      width: '100%',
      marginVertical: verticalScale(6, metrics),
    },
    listContainer: {
      backgroundColor: colors.surface.card,
      borderRadius: moderateScale(20, 0.5, metrics),
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: scale(16, metrics),
      paddingVertical: verticalScale(16, metrics),
    },
    divider: {
      height: 1,
      backgroundColor: colors.border.light,
      marginLeft: scale(16, metrics),
    },
    rowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(12, metrics),
    },
    rowIconBox: {
      width: rowIconBoxSize,
      height: rowIconBoxSize,
      borderRadius: moderateScale(9, 0.5, metrics),
      backgroundColor: colors.brand.tint,
      justifyContent: 'center',
      alignItems: 'center',
    },
    rowIconBoxDanger: {
      backgroundColor: colors.status.errorBg,
    },
    rowLabel: {
      fontSize: moderateScale(15, 0.3, metrics),
      color: colors.text.primary,
      fontWeight: fontWeights.medium,
    },
    rowLabelDanger: {
      fontSize: moderateScale(15, 0.3, metrics),
      color: colors.status.error,
      fontWeight: fontWeights.semiBold,
    },
  });
};

export default SettingsScreen;
