import { useCallback, useEffect, useRef, useState } from 'react';
import ReactNativeBiometrics from 'react-native-biometrics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LoginCredentials, LoginResponseTuple } from '../types/auth';
import { getSecureCredentials } from '../utils/secureStorage';

const rnBiometrics = new ReactNativeBiometrics();

export interface UseLoginContainerReturn {
  merchantName: string;
  email: string;
  password: string;
  rememberMe: boolean;
  merchantError: string | undefined;
  emailError: string | undefined;
  passwordError: string | undefined;
  isLoading: boolean;
  isBiometricAvailable: boolean;
  biometryType: string | null;
  hasStoredSession: boolean;
  setMerchantName: (value: string) => void;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  setRememberMe: (value: boolean) => void;
  handleSubmit: () => Promise<void>;
  handleBiometricAuth: () => Promise<void>;
}

export function useLoginContainer(): UseLoginContainerReturn {
  const { login, setLoginResponse } = useAuth();
  const { showSuccess, showError } = useToast();

  const [merchantName, setMerchantNameState] = useState<string>('');
  const [email, setEmailState] = useState<string>('');
  const [password, setPasswordState] = useState<string>('');
  const [rememberMe, setRememberMeState] = useState<boolean>(true);

  const [merchantError, setMerchantError] = useState<string | undefined>(undefined);
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [passwordError, setPasswordError] = useState<string | undefined>(undefined);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState<boolean>(true);
  const [biometryType, setBiometryType] = useState<string | null>(null);
  const [hasStoredSession, setHasStoredSession] = useState<boolean>(false);

  const hasAutoPromptedRef = useRef<boolean>(false);

  // Native Biometrics Auth Prompt (Queries live OS sensor directly)
  const handleBiometricAuth = async (): Promise<void> => {
    try {
      // 1. Live OS Hardware Check directly at execution time
      const sensorResult = await rnBiometrics.isSensorAvailable();
      const { available, biometryType: type } = sensorResult || {};
      const sensorAvailable = Boolean(available);

      setIsBiometricAvailable(sensorAvailable);
      if (type) setBiometryType(type);

      if (!sensorAvailable) {
        showError('Biometric sensor is not available or enrolled in device settings');
        return;
      }

      // 2. Open OS Biometric Fingerprint / Face prompt
      const promptResult = await rnBiometrics.simplePrompt({
        promptMessage: 'Confirm fingerprint to Log in',
        cancelButtonText: 'Cancel',
      });

      if (promptResult && promptResult.success) {
        setIsLoading(true);

        // Check if full response tuple is already saved in storage for instant login
        const storedTupleStr = await AsyncStorage.getItem(STORAGE_KEYS.RESPONSE_TUPLE);
        if (storedTupleStr) {
          try {
            const parsedTuple = JSON.parse(storedTupleStr) as LoginResponseTuple;
            if (parsedTuple && Array.isArray(parsedTuple) && parsedTuple.length >= 2) {
              await setLoginResponse(parsedTuple, true);
              showSuccess('Signed in successfully');
              return;
            }
          } catch {
            // fallback to network login below
          }
        }

        // Retrieve real encrypted credentials from hardware Keychain / Keystore
        const securePayload = await getSecureCredentials();
        const targetEmail = securePayload?.email || email.trim();
        const targetPassword = securePayload?.password || password;
        const targetMerchantSlug = securePayload?.merchantSlug || merchantName.trim();

        const payload: LoginCredentials = {
          merchantSlug: targetMerchantSlug,
          email: targetEmail,
          password: targetPassword,
          is_hash: 0,
          remember_me: true,
          install_check_reload: false,
          install_no: false,
        };

        await login(payload);
        showSuccess('Signed in successfully');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Biometrics authentication canceled or failed';
      showError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Evaluate saved credentials and auto-prompt biometrics on cold start
  useEffect(() => {
    let isMounted = true;

    const evaluateColdStartAuth = async (): Promise<void> => {
      try {
        // 1. Read persistent preferences
        const [savedMerchantSlug, savedRememberMe] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.MERCHANT_SLUG),
          AsyncStorage.getItem('@indolj_remember_me'),
        ]);

        if (isMounted && savedMerchantSlug) {
          setMerchantNameState(savedMerchantSlug);
        }
        if (isMounted && savedRememberMe !== null) {
          setRememberMeState(savedRememberMe === 'true');
        }

        // 2. Read hardware biometric capability from OS
        const resultObject = await rnBiometrics.isSensorAvailable();
        const { available, biometryType: type } = resultObject || {};
        const sensorAvailable = Boolean(available);

        if (isMounted) {
          setIsBiometricAvailable(sensorAvailable);
          setBiometryType(type || (sensorAvailable ? 'Fingerprint' : null));
        }

        // 3. Read persistent storage flags
        const [biometricEnabledFlag, explicitLogoutFlag, storedTokenStr] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED),
          AsyncStorage.getItem(STORAGE_KEYS.EXPLICIT_LOGOUT),
          AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
        ]);

        const isBiometricEnabled = biometricEnabledFlag === 'true';
        const isExplicitLogout = explicitLogoutFlag === 'true';
        const hasSavedSession = Boolean(storedTokenStr) || isBiometricEnabled;

        const validStoredSession = hasSavedSession && !isExplicitLogout;
        if (isMounted) {
          setHasStoredSession(validStoredSession);
        }

        // 4. Guard Evaluation: Auto-prompt ONLY if biometrics enrolled & enabled AND NOT explicit logout AND sensor available
        if (
          isMounted &&
          sensorAvailable &&
          validStoredSession &&
          !hasAutoPromptedRef.current
        ) {
          hasAutoPromptedRef.current = true;
          setTimeout(() => {
            if (isMounted) {
              handleBiometricAuth();
            }
          }, 400);
        }
      } catch {
        if (isMounted) {
          setIsBiometricAvailable(true);
          setHasStoredSession(true);
        }
      }
    };

    evaluateColdStartAuth();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setMerchantName = (value: string): void => {
    setMerchantNameState(value);
    if (merchantError) setMerchantError(undefined);
  };

  const setEmail = (value: string): void => {
    setEmailState(value);
    if (emailError) setEmailError(undefined);
  };

  const setPassword = (value: string): void => {
    setPasswordState(value);
    if (passwordError) setPasswordError(undefined);
  };

  const setRememberMe = (value: boolean): void => {
    setRememberMeState(value);
  };

  const validate = (): boolean => {
    let isValid = true;
    setMerchantError(undefined);
    setEmailError(undefined);
    setPasswordError(undefined);

    if (!merchantName.trim()) {
      setMerchantError('Merchant name is required');
      isValid = false;
    }

    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      setEmailError('Enter a valid email address');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = useCallback(async (): Promise<void> => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      const payload: LoginCredentials = {
        merchantSlug: merchantName.trim(),
        email: email.trim(),
        password,
        is_hash: 0,
        remember_me: rememberMe,
        install_check_reload: false,
        install_no: false,
      };

      await login(payload);
      showSuccess('Logged in successfully');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Invalid credentials or network connection failed';
      showError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [merchantName, email, password, rememberMe, validate, login, showSuccess, showError]);

  return {
    merchantName,
    email,
    password,
    rememberMe,
    merchantError,
    emailError,
    passwordError,
    isLoading,
    isBiometricAvailable,
    biometryType,
    hasStoredSession,
    setMerchantName,
    setEmail,
    setPassword,
    setRememberMe,
    handleSubmit,
    handleBiometricAuth,
  };
}

export default useLoginContainer;
