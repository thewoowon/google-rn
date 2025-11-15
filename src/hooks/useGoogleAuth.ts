import { useState, useEffect, useCallback } from 'react';
import { NativeModules } from 'react-native';
import { TokenManager } from '../utils/tokenManager';
import type { GoogleUser, UseGoogleAuthResult } from '../types';

const { GoogleAuthModule } = NativeModules;

/**
 * React hook for Google OAuth authentication
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, loading, signIn, signOut, isAuthenticated } = useGoogleAuth();
 *
 *   if (loading) return <Text>Loading...</Text>;
 *
 *   return isAuthenticated ? (
 *     <Button title="Sign Out" onPress={signOut} />
 *   ) : (
 *     <Button title="Sign In with Google" onPress={signIn} />
 *   );
 * }
 * ```
 */
export function useGoogleAuth(): UseGoogleAuthResult {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * Sign in with Google
   */
  const signIn = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const result = await GoogleAuthModule.signIn();
      await TokenManager.save({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresAt: Date.now() + (result.expiresIn || 3600) * 1000,
        idToken: result.idToken,
      });
      setUser(result.user);
    } catch (error) {
      console.error('[GoogleAuth] signIn failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sign out
   */
  const signOut = useCallback(async (): Promise<void> => {
    try {
      if (GoogleAuthModule?.signOut) {
        await GoogleAuthModule.signOut();
      }
      await TokenManager.clear();
      setUser(null);
    } catch (error) {
      console.error('[GoogleAuth] signOut failed:', error);
      throw error;
    }
  }, []);

  /**
   * Get current access token
   */
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    return await TokenManager.getValidAccessToken();
  }, []);

  /**
   * Initialize - check for existing valid token
   */
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const token = await TokenManager.load();
        if (!token || !mounted) return;

        const isExpired = await TokenManager.isExpired();
        if (!isExpired && mounted) {
          // Try to get user info from native module
          if (GoogleAuthModule?.getCurrentUser) {
            const currentUser = await GoogleAuthModule.getCurrentUser();
            if (currentUser && mounted) {
              setUser(currentUser);
            }
          } else {
            // Set a placeholder user if native module doesn't support getCurrentUser
            setUser({
              id: '',
              email: '',
              name: 'User',
            });
          }
        } else if (mounted) {
          // Token expired, clear it
          await TokenManager.clear();
        }
      } catch (error) {
        console.error('[GoogleAuth] init failed:', error);
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    user,
    loading,
    signIn,
    signOut,
    getAccessToken,
    isAuthenticated: user !== null,
  };
}
