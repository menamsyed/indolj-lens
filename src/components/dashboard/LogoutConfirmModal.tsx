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
import { Colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

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
  const styles = useMemo(() => createStyles(colors), [colors]);

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

const createStyles = (colors: Colors) => StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.surface.card,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.status.errorBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.neutral.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  logoutButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 14,
    color: colors.text.white,
  },
});

export default LogoutConfirmModal;
