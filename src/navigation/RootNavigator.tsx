import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AuthStackWrapper } from './AuthStackWrapper';
import { AppStackWrapper } from './AppStackWrapper';
import { SplashScreen } from '../components/common/SplashScreen';

export function RootNavigator(): React.JSX.Element {
  const { isAuthenticated, isHydrating } = useAuth();

  if (isHydrating) {
    return <SplashScreen message="" />;
  }

  return isAuthenticated ? <AppStackWrapper /> : <AuthStackWrapper />;
}

export default RootNavigator;
