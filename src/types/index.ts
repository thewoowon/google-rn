// src/types/index.ts

/**
 * Google OAuth token information
 */
export interface GoogleToken {
  /** OAuth access token */
  accessToken: string;
  /** OAuth refresh token (optional) */
  refreshToken?: string;
  /** Token expiration timestamp (UNIX timestamp in milliseconds) */
  expiresAt?: number;
  /** ID token (JWT) containing user information */
  idToken?: string;
  /** Token type (usually "Bearer") */
  tokenType?: string;
  /** Scope of access granted */
  scope?: string;
}

/**
 * Google user information
 */
export interface GoogleUser {
  /** User's unique Google ID */
  id: string;
  /** User's email address */
  email: string;
  /** Whether email is verified */
  emailVerified?: boolean;
  /** User's full name */
  name?: string;
  /** User's given name (first name) */
  givenName?: string;
  /** User's family name (last name) */
  familyName?: string;
  /** User's profile picture URL */
  photoUrl?: string;
  /** User's locale */
  locale?: string;
}

/**
 * Google OAuth configuration
 */
export interface GoogleAuthConfig {
  /** Google OAuth client ID */
  clientId: string;
  /** OAuth redirect URI */
  redirectUri: string;
  /** OAuth scopes to request */
  scopes?: string[];
  /** Whether to use PKCE flow */
  usePKCE?: boolean;
  /** Additional parameters */
  extraParams?: Record<string, string>;
}

/**
 * Sign-in result
 */
export interface SignInResult {
  /** User information */
  user: GoogleUser;
  /** Token information */
  token: GoogleToken;
}

/**
 * useGoogleAuth hook return value
 */
export interface UseGoogleAuthResult {
  /** Current user (null if not signed in) */
  user: GoogleUser | null;
  /** Whether auth operation is in progress */
  loading: boolean;
  /** Sign in with Google */
  signIn: () => Promise<void>;
  /** Sign out */
  signOut: () => Promise<void>;
  /** Get current access token */
  getAccessToken: () => Promise<string | null>;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
}

/**
 * Native module interface
 */
export interface GoogleAuthModuleInterface {
  /** Initialize Google Auth with configuration */
  configure: (config: GoogleAuthConfig) => Promise<void>;
  /** Sign in with Google */
  signIn: () => Promise<SignInResult>;
  /** Sign out */
  signOut: () => Promise<void>;
  /** Get current user */
  getCurrentUser: () => Promise<GoogleUser | null>;
}
