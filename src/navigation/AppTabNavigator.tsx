import React from 'react';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { DashboardStackNavigator } from './DashboardStackNavigator';
import { BranchesScreen } from '../screens/BranchesScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { CustomTabBar } from './CustomTabBar';

export type AppTabParamList = {
  Dashboard: undefined;
  Branches: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();

// Defined outside the component so it's a stable reference across renders (avoids react-navigation
// re-mounting the tab bar on every AppTabNavigator render).
function renderTabBar(props: BottomTabBarProps): React.JSX.Element {
  return <CustomTabBar {...props} />;
}

export function AppTabNavigator(): React.JSX.Element {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      // Default backBehavior ('firstRoute') seeds the tab history with every route
      // before the focused one in declaration order — since Branches is declared
      // before Dashboard but Dashboard is the initialRouteName, the very first
      // Android hardware back press would otherwise jump straight to Branches.
      // 'none' means back at the tab-root level does nothing (propagates up to the
      // OS/exit), matching standard bottom-tab app-shell behavior.
      backBehavior="none"
      screenOptions={{ headerShown: false, lazy: true }}
      tabBar={renderTabBar}
    >
      <Tab.Screen name="Branches" component={BranchesScreen} />
      <Tab.Screen name="Dashboard" component={DashboardStackNavigator} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default AppTabNavigator;
