import client from '../client';
import { ENDPOINTS } from '../config/routes';
import { LoginRequestDTO, LoginResponseTuple } from '../../types/auth';

/**
 * Executes Authentication Login POST request to http://salesdemo.indoljpos.com/auth/login
 * Parses and returns the 4-element response tuple directly:
 * [0] AuthToken, [1] UserProfile, [2] status, [3] permissions array
 */
export async function loginUser(
  credentials: LoginRequestDTO
): Promise<LoginResponseTuple> {
  const payload: LoginRequestDTO = {
    email: credentials.email.trim(),
    password: credentials.password,
    is_hash: credentials.is_hash ?? 0,
    remember_me: credentials.remember_me ?? true,
    install_check_reload: credentials.install_check_reload ?? false,
    install_no: credentials.install_no ?? false,
  };

  try {
    const response = await client.post<LoginResponseTuple>(
      ENDPOINTS.LOGIN,
      payload
    );

    const data = response.data;
    if (Array.isArray(data) && data.length >= 4) {
      return data;
    }

    throw new Error('Invalid login response format');
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const axiosError = error as {
        response?: {
          data?: { message?: string; error?: string };
          status?: number;
        };
      };
      const serverMessage =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        (axiosError.response?.status === 401
          ? 'Invalid email or password'
          : `Server Error (${axiosError.response?.status || '500'})`);
      throw new Error(serverMessage);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network connection error');
  }
}

export default {
  loginUser,
};
