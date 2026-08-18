import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ReportDetailScreen } from '../screens/ReportDetailScreen';
import { MatrixTableResponse } from '../api/services/widgetService';
import { SaleSummaryRecord } from '../types/dashboard';

export type ReportType = 'sale-summary' | 'branch-wise' | 'item-wise' | 'category-wise' | 'online-orders';

// Discriminated union: 'sale-summary' renders SaleSummaryView (its own record shape),
// every other report type renders the generic MatrixReportView (a title + table shape).
export type ReportDetailParams =
  | { reportType: 'sale-summary'; records: SaleSummaryRecord[]; totalSale: string; dateRangeLabel: string }
  | {
      reportType: 'branch-wise' | 'item-wise' | 'category-wise' | 'online-orders';
      title: string;
      tableData: MatrixTableResponse | null;
      defaultHead: string[];
      dateRangeLabel: string;
    };

export type DashboardStackParamList = {
  DashboardMain: undefined;
  ReportDetail: ReportDetailParams;
};

const Stack = createNativeStackNavigator<DashboardStackParamList>();

// Nests a stack inside the Dashboard tab so drill-down report screens are real pushed
// routes: DashboardMain stays mounted underneath (native scroll position is preserved
// for free), and ReportDetailScreen hides the tab bar via navigation.getParent() —
// see CustomTabBar.tsx for the corresponding read of that option.
export function DashboardStackNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardMain" component={DashboardScreen} />
      <Stack.Screen
        name="ReportDetail"
        component={ReportDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}

export default DashboardStackNavigator;
