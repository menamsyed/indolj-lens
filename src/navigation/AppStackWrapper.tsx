import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppTabNavigator } from './AppTabNavigator';

export type AppStackParamList = {
  Main: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppStackWrapper(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={AppTabNavigator} />
    </Stack.Navigator>
  );
}

export default AppStackWrapper;
