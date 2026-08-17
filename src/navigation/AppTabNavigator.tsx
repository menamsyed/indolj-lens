import React from 'react';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '../screens/DashboardScreen';
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
      screenOptions={{ headerShown: false, lazy: true }}
      tabBar={renderTabBar}
    >
      <Tab.Screen name="Branches" component={BranchesScreen} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default AppTabNavigator;
