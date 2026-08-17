/**
 * Auth DTOs, User Profile, Permission & Response Tuple Interfaces
 * Strictly aligned with http://salesdemo.indoljpos.com/auth/login specification.
 */

export interface LoginRequestDTO {
  email: string;
  password: string;
  is_hash?: number;             // Default: 0
  remember_me?: boolean;         // Default: true
  install_check_reload?: boolean; // Default: false
  install_no?: boolean;          // Default: false
}

/**
 * App-level login params: the wire DTO above plus the merchant host slug, which
 * is used to route the request (client.ts baseURL) and is never sent in the POST body.
 */
export interface LoginCredentials extends LoginRequestDTO {
  merchantSlug: string;          // e.g. "salesdemo" -> http://salesdemo.indoljpos.com
}

export interface AuthToken {
  access_token: string;
  token_type: 'Bearer' | string;
  expires_at: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phn_no: string;
  user_type: string;
  branch_id: number;
  is_active: number;
  is_banned?: number;
  permission_group_id?: number;
  sales_limit: number;
  foc_limit: string;
  user_passcode: string;
  address?: string | null;
  image?: string | null;
  slug?: string | null;
  restaurant_id?: number | null;
  till_id?: number | null;
  sbr_ntn?: string | null;
  sbr_pos_id?: string | null;
  sbr_user_id?: string | null;
  sbr_password?: string | null;
  sbr_enabled?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export type Permission =
  | 'POS'
  | 'Order edit'
  | 'Daily Report'
  | 'Work period'
  | 'Order history'
  | 'Delivery'
  | 'Submit'
  | 'Monthly Report'
  | 'Sales Report'
  | 'Sales Summary Report'
  | 'Dashboard'
  | string;

/**
 * Strict 4-element response tuple returned by POST /auth/login:
 * [0] AuthToken object
 * [1] UserProfile object
 * [2] Status Code number (e.g. 0)
 * [3] Permissions string array
 */
export type LoginResponseTuple = [
  AuthToken,
  UserProfile,
  number,
  string[]
];
