import React, { useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useWidgetsData } from '../hooks/useWidgetsData';
import { useDateBranchFilter, buildBranchOptionsList } from '../hooks/useDateBranchFilter';
import { useResponsive } from '../hooks/useResponsive';
import { Colors } from '../styles/colors';
import { SaleSummaryRecord } from '../types/dashboard';
import { ScreenMetrics, scale, tabletContentCap, verticalScale } from '../utils/responsive';
import { DashboardStackParamList } from '../navigation/DashboardStackNavigator';

import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { FloatingFilterBar } from '../components/dashboard/FloatingFilterBar';
import { BranchSummaryCard } from '../components/dashboard/BranchSummaryCard';
import { SalesOverviewCard } from '../components/dashboard/SalesOverviewCard';
import { OrderInsightsCard } from '../components/dashboard/OrderInsightsCard';
import { PaymentBreakdownCard } from '../components/dashboard/PaymentBreakdownCard';
import { PartyWiseSalesCard } from '../components/dashboard/PartyWiseSalesCard';
import { SalesTrendCard } from '../components/dashboard/SalesTrendCard';
import { ReportNavigationCard } from '../components/dashboard/ReportNavigationCard';
import { FilterBottomSheet } from '../components/dashboard/FilterBottomSheet';
import { LogoutConfirmModal } from '../components/dashboard/LogoutConfirmModal';

export function DashboardScreen(): React.JSX.Element {
  const { user, logout } = useAuth();
  const { colors } = useTheme();
  const metrics = useResponsive();
  const navigation = useNavigation<NativeStackNavigationProp<DashboardStackParamList>>();
  const styles = useMemo(() => createStyles(colors, metrics), [colors, metrics]);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);

  const {
    selectedDateRange,
    selectedBranch,
    customFromDate,
    customToDate,
    displayDateLabel,
    dateRangeLabel,
    isFilterSheetOpen,
    isDateDefault,
    isBranchDefault,
    activeFilterCount,
    openFilterSheet,
    closeFilterSheet,
    applyFilters,
  } = useDateBranchFilter();

  // Consume Live Widgets API Container Hook (100% Pure Dynamic Binding)
  const {
    branches,
    branchWise,
    itemWise,
    categoryWise,
    newOrderList,
    totalSalesAmount,
    prevPeriodText,
    grossSaleVal,
    netSaleVal,
    taxVal,
    totalVal,
    discountVal,
    focVal,
    refundVal,
    cancelledVal,
    cancelledOrderCountVal,
    saleIncTaxVal,
    serviceChargesVal,
    deliveryChargesVal,
    overallGrowth,
    salesTaxGrowth,
    discountGrowth,
    ordersGrowth,
    avgOrderValueGrowth,
    ordersCount,
    avgOrderValueDisplay,
    totalOrdersCount,
    totalCustomersCount,
    orderChannels,
    paymentPieData,
    paymentLegend,
    paymentTotalDisplay,
    partyChannels,
    partyTotalDisplay,
    trendTotalAmount,
    trendTotalOrders,
    trendAvgOrderAmount,
    trendBarData,
    isLoading,
    isRefreshing,
    refetch,
  } = useWidgetsData({
    dateRangePreset: selectedDateRange,
    customFromDate: customFromDate ?? undefined,
    customToDate: customToDate ?? undefined,
    selectedBranchId: selectedBranch.id,
  });

  const branchOptionsList = buildBranchOptionsList(branches);

  // Map backend newOrderList matrix table to SaleSummaryRecord[] safely
  const mappedSummaryRecords: SaleSummaryRecord[] = Array.isArray(newOrderList?.tbody) && newOrderList.tbody.length > 0
    ? newOrderList.tbody.map((row) => ({
      tokenNo: String(row?.[0] || ''),
      time: String(row?.[1] || ''),
      branch: String(row?.[2] || ''),
      orderType: String(row?.[3] || 'Takeaway'),
      saleAmount: String(row?.[4] || '0'),
    }))
    : [];

  const handleConfirmLogout = (): void => {
    setIsLogoutModalOpen(false);
    logout();
  };

  // Live Metrics Array for SalesOverviewCard (Dynamic Live API Binding)
  const liveOverviewMetrics = [
    { label: 'Gross Sale', value: grossSaleVal, iconName: 'chart' as const, iconBgColor: '#E8F8F5', iconColor: '#27AE60' },
    { label: 'Refund', value: refundVal, iconName: 'back' as const, iconBgColor: '#FDEDEC', iconColor: '#E74C3C' },
    { label: 'Cancelled', value: cancelledVal, iconName: 'lock' as const, iconBgColor: '#FDEDEC', iconColor: '#E74C3C' },
    { label: 'Cancelled Order Count', value: cancelledOrderCountVal, iconName: 'user' as const, iconBgColor: '#E8F8F5', iconColor: '#16A085', isCount: true },
    { label: 'FOC', value: focVal, iconName: 'utensils' as const, iconBgColor: '#E8F8F5', iconColor: '#27AE60' },
    { label: 'Discount', value: discountVal, iconName: 'percent' as const, iconBgColor: '#FEF9E7', iconColor: '#F39C12' },
    { label: 'Net Sale', value: netSaleVal, iconName: 'store' as const, iconBgColor: '#EBF5FB', iconColor: '#2980B9' },
    { label: 'Tax', value: taxVal, iconName: 'file-text' as const, iconBgColor: '#F5EEF8', iconColor: '#8E44AD' },
    { label: 'Sale Inc Tax', value: saleIncTaxVal, iconName: 'bowl' as const, iconBgColor: '#E8F8F5', iconColor: '#1ABC9C' },
    { label: 'Service Charges', value: serviceChargesVal, iconName: 'coffee' as const, iconBgColor: '#FEF9E7', iconColor: '#F39C12' },
    { label: 'Delivery Charges', value: deliveryChargesVal, iconName: 'pizza' as const, iconBgColor: '#FDEDEC', iconColor: '#E74C3C' },
    { label: 'Total', value: totalVal, iconName: 'check' as const, iconBgColor: '#E8F8F5', iconColor: '#27AE60' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.primary} />
      <View style={styles.container}>
        {/* POS Dashboard Header */}
        <DashboardHeader
          cashierName={user?.name || 'Cashier'}
          onLogoutPress={() => setIsLogoutModalOpen(true)}
        />

        {/* Main Dashboard Scrollable Content */}
        <ScrollView
          style={styles.scrollBody}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refetch}
              tintColor={colors.brand.primary}
              colors={[colors.brand.primary]}
            />
          }
        >
          {/* 1. Top Hero Banner Card: TOTAL SALES */}
          <BranchSummaryCard
            dateString={displayDateLabel}
            netSalesAmount={totalSalesAmount}
            prevPeriodText={prevPeriodText}
            ordersCount={ordersCount}
            ordersGrowth={ordersGrowth}
            avgOrderValue={avgOrderValueDisplay}
            avgOrderValueGrowth={avgOrderValueGrowth}
            discountAmount={discountVal}
            discountGrowth={discountGrowth}
            salesTaxAmount={taxVal}
            salesTaxGrowth={salesTaxGrowth}
            overallGrowth={overallGrowth}
            isLoading={isLoading}
          />

          {/* 2. Sales Overview (12 Grid Metric Items) */}
          <SalesOverviewCard metrics={liveOverviewMetrics} isLoading={isLoading} />

          {/* 3. Order Insights */}
          <OrderInsightsCard
            totalOrders={totalOrdersCount}
            totalCustomers={totalCustomersCount}
            channels={orderChannels}
            isLoading={isLoading}
          />

          {/* 4. Payment Breakdown */}
          <PaymentBreakdownCard
            totalAmount={paymentTotalDisplay}
            legend={paymentLegend}
            pieData={paymentPieData}
            isLoading={isLoading}
          />

          {/* 5. Party wise Sales */}
          <PartyWiseSalesCard
            totalAmount={partyTotalDisplay}
            parties={partyChannels}
            isLoading={isLoading}
          />

          {/* 7. Sales Trend */}
          <SalesTrendCard
            totalAmount={trendTotalAmount}
            totalOrders={trendTotalOrders}
            avgOrderAmount={trendAvgOrderAmount}
            barData={trendBarData}
            isLoading={isLoading}
          />
          {/* 6. Sale Summary (--> View Details) */}
          <ReportNavigationCard
            title="Sale Summary"
            subtitle="Tap to view report"
            onPress={() => navigation.navigate('ReportDetail', {
              reportType: 'sale-summary',
              records: mappedSummaryRecords,
              totalSale: totalSalesAmount,
              dateRangeLabel,
            })}
            isLoading={isLoading}
          />

          {/* 8. Branch Wise Sales (--> View Details) */}
          <ReportNavigationCard
            title="Branch Wise Sales"
            subtitle="Tap to view report"
            onPress={() => navigation.navigate('ReportDetail', {
              reportType: 'branch-wise',
              title: 'Branch Wise Sales',
              tableData: branchWise,
              dateRangeLabel,
            })}
            isLoading={isLoading}
          />

          {/* 9. Item Wise Sales (--> View Details) */}
          <ReportNavigationCard
            title="Item Wise Sales"
            subtitle="Tap to view report"
            onPress={() => navigation.navigate('ReportDetail', {
              reportType: 'item-wise',
              title: 'Item Wise Sales',
              tableData: itemWise,
              dateRangeLabel,
            })}
            isLoading={isLoading}
          />

          {/* 10. Category Wise Sales (--> View Details) */}
          <ReportNavigationCard
            title="Category Wise Sales"
            subtitle="Tap to view report"
            onPress={() => navigation.navigate('ReportDetail', {
              reportType: 'category-wise',
              title: 'Category Wise Sales',
              tableData: categoryWise,
              dateRangeLabel,
            })}
            isLoading={isLoading}
          />

          {/* 11. Online Orders List (--> View Details) */}
          <ReportNavigationCard
            title="Online Orders List"
            subtitle="Tap to view report"
            onPress={() => navigation.navigate('ReportDetail', {
              reportType: 'online-orders',
              title: 'Online Orders List',
              tableData: newOrderList,
              dateRangeLabel,
            })}
            isLoading={isLoading}
          />
        </ScrollView>

        {/* Floating Filter Trigger + Active Filter Summary */}
        <FloatingFilterBar
          isDateDefault={isDateDefault}
          isBranchDefault={isBranchDefault}
          dateLabel={displayDateLabel}
          branchName={selectedBranch.name}
          activeCount={activeFilterCount}
          onPress={openFilterSheet}
        />

        {/* Combined Branch + Date Range Bottom Sheet */}
        <FilterBottomSheet
          visible={isFilterSheetOpen}
          selectedDateRange={selectedDateRange}
          selectedBranch={selectedBranch}
          branches={branchOptionsList}
          onApply={applyFilters}
          onClose={closeFilterSheet}
        />

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

const createStyles = (colors: Colors, metrics: ScreenMetrics) => StyleSheet.create({
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
    ...tabletContentCap(metrics),
  },
});

export default DashboardScreen;
