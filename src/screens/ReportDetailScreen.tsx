import React, { useEffect, useMemo } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../styles/colors';
import { DashboardStackParamList } from '../navigation/DashboardStackNavigator';
import { SaleSummaryView } from '../components/dashboard/SaleSummaryView';
import { MatrixReportView } from '../components/dashboard/MatrixReportView';

// Single shared detail screen for all 5 "View" report cards — which sub-view it
// renders is driven entirely by route.params.reportType, not a locally-swapped branch.
export function ReportDetailScreen(): React.JSX.Element {
  const { params } = useRoute<RouteProp<DashboardStackParamList, 'ReportDetail'>>();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Standard React Navigation recipe for hiding the tab bar from a screen nested in a
  // stack that sits inside a tab: getParent() resolves to the tab navigator, one level
  // up from this stack. CustomTabBar.tsx already reads tabBarStyle from the focused
  // route's descriptor options and returns null when it's 'none' — nothing further
  // needed there.
  useEffect(() => {
    const parent = navigation.getParent();
    parent?.setOptions({ tabBarStyle: { display: 'none' } });
    return () => parent?.setOptions({ tabBarStyle: undefined });
  }, [navigation]);

  const handleBackPress = (): void => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.primary} />
      {params.reportType === 'sale-summary' ? (
        <SaleSummaryView
          dateLabel={params.dateRangeLabel}
          records={params.records}
          totalSale={params.totalSale}
          onBackPress={handleBackPress}
        />
      ) : (
        <MatrixReportView
          title={params.title}
          subtitle={params.dateRangeLabel}
          tableData={params.tableData}
          defaultHead={params.defaultHead}
          defaultRows={[]}
          onBackPress={handleBackPress}
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.brand.primary,
  },
});

export default ReportDetailScreen;
