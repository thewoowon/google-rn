// Main entry point for @openauth/google-rn
import { NativeModules } from 'react-native';

// Export hooks
export { useGoogleAuth } from './hooks/useGoogleAuth';

// Export utilities
export { TokenManager } from './utils/tokenManager';
export { SecureStorage } from './utils/storage';
export { generatePKCE } from './utils/pkce';

// Export types
export type {
  GoogleToken,
  GoogleUser,
  GoogleAuthConfig,
  SignInResult,
  UseGoogleAuthResult,
  GoogleAuthModuleInterface,
} from './types';

// Export native module
const { GoogleAuthModule } = NativeModules;
export default GoogleAuthModule;
