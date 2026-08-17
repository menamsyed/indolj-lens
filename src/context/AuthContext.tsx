import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser } from '../api/services/authService';
import { setClientAuthToken, setClientMerchantHost } from '../api/client';
import { buildMerchantBaseUrl } from '../api/config/routes';
import {
  saveSecureCredentials,
  resetSecureCredentials,
} from '../utils/secureStorage';
import {
  AuthToken,
  LoginCredentials,
  LoginResponseTuple,
  UserProfile,
} from '../types/auth';

export const STORAGE_KEYS = {
  TOKEN: '@indolj_auth_token',
  USER: '@indolj_user_profile',
  PERMISSIONS: '@indolj_permissions',
  RESPONSE_TUPLE: '@indolj_login_response_tuple',
  BIOMETRIC_ENABLED: '@indolj_biometric_enabled',
  EXPLICIT_LOGOUT: '@indolj_explicit_logout',
  MERCHANT_SLUG: '@indolj_merchant_slug',
} as const;

export interface AuthContextType {
  user: UserProfile | null;
  token: AuthToken | null;
  permissions: string[];
  loginResponseTuple: LoginResponseTuple | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
  hasPermission: (permissionName: string) => boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  setLoginResponse: (tuple: LoginResponseTuple, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<AuthToken | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loginResponseTuple, setLoginResponseTuple] = useState<LoginResponseTuple | null>(null);
  const [isHydrating, setIsHydrating] = useState<boolean>(true);

  // Restore session from AsyncStorage on cold start
  useEffect(() => {
    const hydrateSession = async (): Promise<void> => {
      try {
        const [storedToken, storedUser, storedPermissions, storedTuple, storedMerchantSlug] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
          AsyncStorage.getItem(STORAGE_KEYS.USER),
          AsyncStorage.getItem(STORAGE_KEYS.PERMISSIONS),
          AsyncStorage.getItem(STORAGE_KEYS.RESPONSE_TUPLE),
          AsyncStorage.getItem(STORAGE_KEYS.MERCHANT_SLUG),
        ]);

        if (storedToken && storedUser) {
          // Re-arm the API client with stored merchant host
          if (storedMerchantSlug) {
            setClientMerchantHost(buildMerchantBaseUrl(storedMerchantSlug));
          }
          // Intentionally keep token as null in AuthContext state on cold start so the app always
          // routes to the Login screen first. If biometric login is enabled, the Login screen will
          // display the biometric icon and prompt for biometric authentication to enter the app.
        }
      } catch (err) {
        console.warn('Failed to hydrate auth session from storage:', err);
      } finally {
        setIsHydrating(false);
      }
    };

    hydrateSession();
  }, []);

  // Directly store the 4-tuple login response in state & storage
  const setLoginResponse = useCallback(
    async (tuple: LoginResponseTuple, rememberMe = true): Promise<void> => {
      const authToken: AuthToken = tuple[0];
      const userProfile: UserProfile = tuple[1];
      const grantedPermissions: string[] = tuple[3] || [];

      setToken(authToken);
      setUser(userProfile);
      setPermissions(grantedPermissions);
      setLoginResponseTuple(tuple);
      setClientAuthToken(authToken.access_token);

      await AsyncStorage.setItem(STORAGE_KEYS.EXPLICIT_LOGOUT, 'false');

      if (rememberMe) {
        await Promise.all([
          AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, 'true'),
          AsyncStorage.setItem(STORAGE_KEYS.TOKEN, JSON.stringify(authToken)),
          AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userProfile)),
          AsyncStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(grantedPermissions)),
          AsyncStorage.setItem(STORAGE_KEYS.RESPONSE_TUPLE, JSON.stringify(tuple)),
        ]);
      } else {
        await Promise.all([
          AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, 'false'),
          AsyncStorage.removeItem(STORAGE_KEYS.TOKEN),
          AsyncStorage.removeItem(STORAGE_KEYS.USER),
          AsyncStorage.removeItem(STORAGE_KEYS.PERMISSIONS),
          AsyncStorage.removeItem(STORAGE_KEYS.RESPONSE_TUPLE),
        ]);
      }
    },
    []
  );

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<void> => {
      const merchantSlug = credentials.merchantSlug.trim().toLowerCase();

      // Point the client at this merchant's host BEFORE issuing the login request
      setClientMerchantHost(buildMerchantBaseUrl(merchantSlug));

      const tuple: LoginResponseTuple = await loginUser(credentials);
      await AsyncStorage.setItem(STORAGE_KEYS.MERCHANT_SLUG, merchantSlug);
      await setLoginResponse(tuple, credentials.remember_me !== false);

      // Save encrypted password in Keychain/Keystore for Biometric Login
      if (credentials.remember_me !== false && tuple[1]?.email) {
        await saveSecureCredentials(tuple[1].email, {
          email: tuple[1].email,
          password: credentials.password,
          token: tuple[0].access_token,
          merchantSlug,
        });
      }
    },
    [setLoginResponse]
  );

  const logout = useCallback(async (): Promise<void> => {
    setToken(null);
    setUser(null);
    setPermissions([]);
    setLoginResponseTuple(null);
    setClientAuthToken(null);

    // Banking-Grade Guard: Set explicit logout flag to true so auto-biometrics is suppressed on next launch
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.EXPLICIT_LOGOUT, 'true'),
      AsyncStorage.removeItem(STORAGE_KEYS.TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.USER),
      AsyncStorage.removeItem(STORAGE_KEYS.PERMISSIONS),
      AsyncStorage.removeItem(STORAGE_KEYS.RESPONSE_TUPLE),
      resetSecureCredentials(),
    ]);
  }, []);

  const hasPermission = useCallback(
    (permissionName: string): boolean => {
      if (!permissions || permissions.length === 0) return false;
      return permissions.includes(permissionName);
    },
    [permissions]
  );

  const value: AuthContextType = {
    user,
    token,
    permissions,
    loginResponseTuple,
    isAuthenticated: Boolean(token?.access_token),
    isHydrating,
    hasPermission,
    login,
    setLoginResponse,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
