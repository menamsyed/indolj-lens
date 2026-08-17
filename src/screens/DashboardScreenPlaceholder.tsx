import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { CustomButton } from '../components/common/CustomButton';
import { typography, fontWeights } from '../styles/typography';
import { Colors } from '../styles/colors';

export function DashboardScreenPlaceholder(): React.JSX.Element {
  const { user, logout } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.welcomeTitle}>
          Welcome, {user?.name || 'Merchant Cashier'}!
        </Text>
        <Text style={styles.subtitle}>
          Branch ID: {user?.branch_id || 2} | Email: {user?.email}
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>POS Merchant Dashboard</Text>
          <Text style={styles.cardBody}>
            You are securely authenticated into Indolj POS.
          </Text>
        </View>

        <View style={styles.buttonWrapper}>
          <CustomButton title="Sign Out" onPress={logout} variant="outline" />
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.background,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  card: {
    backgroundColor: colors.surface.card,
    borderRadius: 12,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: colors.border.light,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: fontWeights.bold,
    color: colors.brand.primary,
    marginBottom: 8,
  },
  cardBody: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  buttonWrapper: {
    marginTop: 16,
  },
});

export default DashboardScreenPlaceholder;
