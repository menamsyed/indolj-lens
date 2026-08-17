# Indolj Merchant POS — Authentication Specification

## 1. API Contract Overview

The authentication layer integrates with the Indolj POS authentication endpoint:

- **Base URL**: `http://salesdemo.indoljpos.com`
- **Endpoint**: `POST /auth/login`
- **Headers**:
  ```http
  Accept: application/json, text/plain, */*
  Content-Type: application/json
  ```

---

## 2. Request Data Transfer Object (`LoginRequestDTO`)

```typescript
export interface LoginRequestDTO {
  email: string;
  password: string;
  is_hash?: number;             // Default: 0
  remember_me?: boolean;         // Default: true
  install_check_reload?: boolean; // Default: false
  install_no?: boolean;          // Default: false
}
```

---

## 3. Response Tuple Specification (`LoginResponseTuple`)

The backend API returns an explicit **4-element tuple** array `[AuthToken, UserProfile, number, string[]]`:

```typescript
export type LoginResponseTuple = [
  AuthToken,       // Element 0: Access token object
  UserProfile,     // Element 1: Merchant user profile
  number,          // Element 2: HTTP Response Status Code (e.g. 200)
  string[]         // Element 3: Granted permissions list
];
```

### Data Interface Definitions

```typescript
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
  sales_limit: number;
  foc_limit: string;
  user_passcode: string;
  address?: string | null;
  image?: string | null;
  restaurant_id?: number | null;
  till_id?: number | null;
  [key: string]: unknown;
}

export type Permission = 
  | 'POS'
  | 'Order edit'
  | 'Daily Report'
  | 'Work period'
  | string;
```

---

## 4. Auth Context & State Management

The global session state is managed via `AuthContext`:

```typescript
export interface AuthContextType {
  user: UserProfile | null;
  token: AuthToken | null;
  permissions: string[];
  isAuthenticated: boolean;
  hasPermission: (permissionName: string) => boolean;
  login: (credentials: LoginRequestDTO) => Promise<void>;
  logout: () => Promise<void>;
}
```

### Token Hydration & Persistence
- Tokens and user profiles are stored locally using `@react-native-async-storage/async-storage`.
- Upon app restart, `AuthContext` hydrates session state automatically to restore authentication status without requiring re-login.
