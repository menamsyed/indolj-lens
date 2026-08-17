import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { typography, fontWeights } from '../styles/typography';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VectorIcon } from '../components/common/VectorIcon';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

export interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const translateY = useRef(new Animated.Value(-100)).current;
  const scale = useRef(new Animated.Value(0.92)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const hideToast = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -80,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToast(null);
    });
  }, [opacity, scale, translateY]);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setToast({ id: Date.now().toString(), message, type });

      translateY.setValue(-80);
      scale.setValue(0.92);
      opacity.setValue(0);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 12,
          friction: 9,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 8,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();

      timeoutRef.current = setTimeout(() => {
        hideToast();
      }, 3500);
    },
    [hideToast, opacity, scale, translateY]
  );

  const showSuccess = useCallback(
    (message: string) => showToast(message, 'success'),
    [showToast]
  );

  const showError = useCallback(
    (message: string) => showToast(message, 'error'),
    [showToast]
  );

  const getStatusColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return '#10B981'; // Sonner emerald green
      case 'error':
        return '#EF4444'; // Sonner crimson red
      default:
        return '#3B82F6'; // Sonner slate blue
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, hideToast }}>
      {children}
      {toast && (
        <SafeAreaView style={styles.toastContainer} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.sonnerToastCard,
              {
                opacity,
                transform: [{ translateY }, { scale }],
              },
            ]}
          >
            {/* Sonner Status Badge */}
            <View style={[styles.statusBadgeCircle, { backgroundColor: getStatusColor(toast.type) }]}>
              {toast.type === 'success' ? (
                <VectorIcon name="check" size={11} color="#FFFFFF" />
              ) : (
                <Text style={styles.statusExclamationText}>!</Text>
              )}
            </View>

            {/* Short Left-Aligned Text */}
            <Text style={styles.sonnerText} numberOfLines={1}>
              {toast.message}
            </Text>

            {/* Sonner Dismiss Cross Button */}
            <TouchableOpacity
              style={styles.closeCrossButton}
              onPress={hideToast}
              activeOpacity={0.6}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel="Dismiss notification"
            >
              <Text style={styles.closeCrossText}>✕</Text>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  sonnerToastCard: {
    width: '92%',
    maxWidth: 420,
    height: 48,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 8,
  },
  statusBadgeCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusExclamationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: fontWeights.heavy,
    lineHeight: 14,
  },
  sonnerText: {
    flex: 1,
    color: '#0F172A',
    fontSize: 13.5,
    fontWeight: fontWeights.medium,
    textAlign: 'left',
  },
  closeCrossButton: {
    marginLeft: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeCrossText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: fontWeights.bold,
    lineHeight: 14,
  },
});

export default ToastContext;
