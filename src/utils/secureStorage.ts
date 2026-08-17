import Keychain, {
  setGenericPassword,
  getGenericPassword,
  resetGenericPassword,
  ACCESSIBLE,
} from 'react-native-keychain';

const KEYCHAIN_SERVICE = 'com.indolj.merchant.pos.credentials';

export interface StoredCredentials {
  email: string;
  password?: string;
  token?: string;
  merchantSlug?: string;
}

/**
 * Helper to safely get the setGenericPassword function from Keychain module
 */
const getSetPasswordFn = () => {
  if (typeof setGenericPassword === 'function') return setGenericPassword;
  if (Keychain && typeof Keychain.setGenericPassword === 'function') return Keychain.setGenericPassword;
  return null;
};

/**
 * Helper to safely get the getGenericPassword function from Keychain module
 */
const getGetPasswordFn = () => {
  if (typeof getGenericPassword === 'function') return getGenericPassword;
  if (Keychain && typeof Keychain.getGenericPassword === 'function') return Keychain.getGenericPassword;
  return null;
};

/**
 * Helper to safely get the resetGenericPassword function from Keychain module
 */
const getResetPasswordFn = () => {
  if (typeof resetGenericPassword === 'function') return resetGenericPassword;
  if (Keychain && typeof Keychain.resetGenericPassword === 'function') return Keychain.resetGenericPassword;
  return null;
};

/**
 * Saves encrypted user credentials to iOS Keychain / Android Keystore.
 */
export async function saveSecureCredentials(
  username: string,
  credentials: StoredCredentials
): Promise<boolean> {
  try {
    const fn = getSetPasswordFn();
    if (!fn) {
      console.warn('Keychain setGenericPassword is not available on this platform/environment');
      return false;
    }
    const payload = JSON.stringify(credentials);
    const accessible = ACCESSIBLE?.WHEN_UNLOCKED_THIS_DEVICE_ONLY || 'AccessibleWhenUnlockedThisDeviceOnly';
    await fn(username, payload, {
      service: KEYCHAIN_SERVICE,
      accessible,
    });
    return true;
  } catch (error) {
    console.warn('Failed to save to Keychain/Keystore:', error);
    return false;
  }
}

/**
 * Retrieves encrypted user credentials from iOS Keychain / Android Keystore.
 */
export async function getSecureCredentials(): Promise<StoredCredentials | null> {
  try {
    const fn = getGetPasswordFn();
    if (!fn) {
      console.warn('Keychain getGenericPassword is not available on this platform/environment');
      return null;
    }
    const credentials = await fn({
      service: KEYCHAIN_SERVICE,
    });

    if (credentials && typeof credentials === 'object' && 'password' in credentials && credentials.password) {
      return JSON.parse(credentials.password) as StoredCredentials;
    }
    return null;
  } catch (error) {
    console.warn('Failed to read from Keychain/Keystore:', error);
    return null;
  }
}

/**
 * Wipes encrypted credentials from iOS Keychain / Android Keystore.
 */
export async function resetSecureCredentials(): Promise<boolean> {
  try {
    const fn = getResetPasswordFn();
    if (!fn) {
      console.warn('Keychain resetGenericPassword is not available on this platform/environment');
      return false;
    }
    await fn({ service: KEYCHAIN_SERVICE });
    return true;
  } catch (error) {
    console.warn('Failed to reset Keychain/Keystore:', error);
    return false;
  }
}

export default {
  saveSecureCredentials,
  getSecureCredentials,
  resetSecureCredentials,
};
