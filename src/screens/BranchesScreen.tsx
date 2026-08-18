import React, { useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useBranches } from '../hooks/useBranches';
import { useBranchWiseSummaries } from '../hooks/useBranchWiseSummaries';
import { useDateBranchFilter, buildBranchOptionsList } from '../hooks/useDateBranchFilter';
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

import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { FloatingFilterBar } from '../components/dashboard/FloatingFilterBar';
import { BranchWiseSalesCard } from '../components/dashboard/BranchWiseSalesCard';
import { FilterBottomSheet } from '../components/dashboard/FilterBottomSheet';
import { LogoutConfirmModal } from '../components/dashboard/LogoutConfirmModal';
import { VectorIcon } from '../components/common/VectorIcon';

export function BranchesScreen(): React.JSX.Element {
  const { user, logout } = useAuth();
  const { colors } = useTheme();
  const metrics = useResponsive();
  const styles = useMemo(() => createStyles(colors, metrics), [colors, metrics]);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);

  const {
    selectedDateRange,
    selectedBranch,
    displayDateLabel,
    from,
    to,
    isFilterSheetOpen,
    isDateDefault,
    isBranchDefault,
    activeFilterCount,
    openFilterSheet,
    closeFilterSheet,
    applyFilters,
  } = useDateBranchFilter();

  // This tab's branch filter is independent of the Dashboard tab's — it always lists every real
  // branch regardless of what's selected here (matches the reference app's behavior), and picking
  // a branch above is a no-op for now since useBranchWiseSummaries always covers every branch.
  const { branches, isLoading: isBranchesLoading, refetch: refetchBranches } = useBranches();
  const branchOptionsList = buildBranchOptionsList(branches);

  const { summaries: branchSummaries, isLoading: isSummariesLoading } = useBranchWiseSummaries(
    branches,
    from,
    to,
    true
  );

  const isLoading = isBranchesLoading || isSummariesLoading;

  const handleConfirmLogout = (): void => {
    setIsLogoutModalOpen(false);
    logout();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.primary} />
      <View style={styles.container}>
        <DashboardHeader
          cashierName={user?.name || 'Cashier'}
          onLogoutPress={() => setIsLogoutModalOpen(true)}
        />

        <ScrollView
          style={styles.scrollBody}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={refetchBranches}
              tintColor={colors.brand.primary}
              colors={[colors.brand.primary]}
            />
          }
        >
          {isLoading ? (
            <>
              <Text style={[typography.caption, styles.sectionHeaderTitle]}>ALL BRANCHES</Text>
              <BranchWiseSalesCard isLoading />
              <BranchWiseSalesCard isLoading />
            </>
          ) : branchSummaries.length > 0 ? (
            <>
              <Text style={[typography.caption, styles.sectionHeaderTitle]}>ALL BRANCHES</Text>
              {branchSummaries.map((summary) => (
                <BranchWiseSalesCard
                  key={summary.branchId}
                  branchName={summary.branchName}
                  totalSales={summary.netSalesAmount}
                  ordersCount={summary.ordersCount}
                  customersCount={summary.customersCount}
                  discountAmount={summary.discountAmount}
                  taxAmount={summary.taxAmount}
                  netSalesAmount={summary.netSalesAmount}
                  channels={summary.channels}
                />
              ))}
            </>
          ) : (
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyStateIconCircle}>
                <VectorIcon name="store" size={40} color={colors.text.muted} />
              </View>
              <Text style={[typography.bodyMedium, styles.emptyStateTitle]}>No branch activity yet</Text>
              <Text style={[typography.caption, styles.emptyStateText]}>
                No branches had sales in this period.
              </Text>
            </View>
          )}
        </ScrollView>

        <FloatingFilterBar
          isDateDefault={isDateDefault}
          isBranchDefault={isBranchDefault}
          dateLabel={displayDateLabel}
          branchName={selectedBranch.name}
          activeCount={activeFilterCount}
          onPress={openFilterSheet}
        />

        <FilterBottomSheet
          visible={isFilterSheetOpen}
          selectedDateRange={selectedDateRange}
          selectedBranch={selectedBranch}
          branches={branchOptionsList}
          onApply={applyFilters}
          onClose={closeFilterSheet}
        />

        <LogoutConfirmModal
          visible={isLogoutModalOpen}
          onCancel={() => setIsLogoutModalOpen(false)}
          onConfirmLogout={handleConfirmLogout}
        />
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: Colors, metrics: ScreenMetrics) => {
  const emptyStateIconSize = scale(56, metrics);

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.brand.primary,
    },
    container: {
      flex: 1,
      backgroundColor: colors.surface.background,
    },
    scrollBody: {
      flex: 1,
    },
    scrollContent: {
      padding: scale(16, metrics),
      paddingBottom: verticalScale(110, metrics),
      flexGrow: 1,
      ...tabletContentCap(metrics),
    },
    sectionHeaderTitle: {
      fontSize: moderateScale(12, 0.3, metrics),
      color: colors.text.muted,
      letterSpacing: 0.8,
      marginBottom: verticalScale(12, metrics),
      marginTop: verticalScale(4, metrics),
    },
    emptyStateContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: scale(20, metrics),
    },
    emptyStateIconCircle: {
      width: emptyStateIconSize,
      height: emptyStateIconSize,
      borderRadius: emptyStateIconSize / 2,
      backgroundColor: colors.neutral.gray100,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyStateTitle: {
      fontSize: moderateScale(14, 0.3, metrics),
      color: colors.text.primary,
      fontWeight: fontWeights.semiBold,
    },
    emptyStateText: {
      fontSize: moderateScale(13, 0.3, metrics),
      color: colors.text.muted,
      textAlign: 'center',
    },
  });
};

export default BranchesScreen;
