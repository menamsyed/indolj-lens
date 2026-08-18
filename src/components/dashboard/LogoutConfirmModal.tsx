import React, { useMemo } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { VectorIcon } from '../common/VectorIcon';
import { useTheme } from '../../context/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { Colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { ScreenMetrics, moderateScale, scale, tabletContentCap, verticalScale } from '../../utils/responsive';

export interface LogoutConfirmModalProps {
  visible: boolean;
  onConfirmLogout: () => void;
  onCancel: () => void;
}

export function LogoutConfirmModal({
  visible,
  onConfirmLogout,
  onCancel,
}: LogoutConfirmModalProps): React.JSX.Element {
  const { colors, isDarkMode } = useTheme();
  const metrics = useResponsive();
  const styles = useMemo(() => createStyles(colors, metrics), [colors, metrics]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              {/* Top Red/White Icon Circle */}
              <View style={styles.iconCircle}>
                <VectorIcon
                  name="log-out"
                  size={28}
                  color={isDarkMode ? colors.text.white : colors.brand.primary}
                  strokeWidth={2.2}
                />
              </View>

              {/* Title & Description */}
              <Text style={[typography.h2, styles.title]}>Confirm Logout</Text>
              <Text style={[typography.bodyMedium, styles.message]}>
                Are you sure you want to log out of Indolj Lens?
              </Text>

              {/* Action Buttons Row */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onCancel}
                  activeOpacity={0.8}
                >
                  <Text style={[typography.buttonText, styles.cancelText]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.logoutButton}
                  onPress={onConfirmLogout}
                  activeOpacity={0.85}
                >
                  <Text style={[typography.buttonText, styles.logoutText]}>Log out</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const createStyles = (colors: Colors, metrics: ScreenMetrics) => {
  const iconCircleSize = scale(60, metrics);

  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: scale(24, metrics),
    },
    modalCard: {
      width: '100%',
      backgroundColor: colors.surface.card,
      borderRadius: moderateScale(24, 0.5, metrics),
      padding: moderateScale(24, 0.5, metrics),
      alignItems: 'center',
      shadowColor: colors.neutral.black,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 8,
      ...tabletContentCap(metrics),
    },
    iconCircle: {
      width: iconCircleSize,
      height: iconCircleSize,
      borderRadius: iconCircleSize / 2,
      backgroundColor: colors.status.errorBg,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: scale(16, metrics),
    },
    title: {
      fontSize: moderateScale(20, 0.3, metrics),
      color: colors.text.primary,
      marginBottom: scale(8, metrics),
      textAlign: 'center',
    },
    message: {
      fontSize: moderateScale(14, 0.3, metrics),
      color: colors.text.secondary,
      textAlign: 'center',
      lineHeight: verticalScale(20, metrics),
      marginBottom: scale(24, metrics),
    },
    buttonRow: {
      flexDirection: 'row',
      gap: scale(12, metrics),
      width: '100%',
    },
    cancelButton: {
      flex: 1,
      height: Math.max(44, verticalScale(48, metrics)),
      borderRadius: moderateScale(14, 0.5, metrics),
      backgroundColor: colors.neutral.gray100,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cancelText: {
      fontSize: moderateScale(14, 0.3, metrics),
      color: colors.text.primary,
    },
    logoutButton: {
      flex: 1,
      height: Math.max(44, verticalScale(48, metrics)),
      borderRadius: moderateScale(14, 0.5, metrics),
      backgroundColor: colors.brand.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoutText: {
      fontSize: moderateScale(14, 0.3, metrics),
      color: colors.text.white,
    },
  });
};

export default LogoutConfirmModal;
