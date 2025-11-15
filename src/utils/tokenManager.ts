// src/utils/tokenManager.ts
import { SecureStorage } from './storage';
import type { GoogleToken } from '../types';

const TOKEN_KEY = 'google_oauth_token';

/**
 * Token Manager - handles OAuth token storage and lifecycle
 */
export const TokenManager = {
  /**
   * Save token to secure storage
   */
  async save(token: GoogleToken): Promise<void> {
    await SecureStorage.set(TOKEN_KEY, token);
  },

  /**
   * Load token from secure storage
   */
  async load(): Promise<GoogleToken | null> {
    return await SecureStorage.get<GoogleToken>(TOKEN_KEY);
  },

  /**
   * Clear stored token
   */
  async clear(): Promise<void> {
    await SecureStorage.remove(TOKEN_KEY);
  },

  /**
   * Check if token is expired
   */
  async isExpired(): Promise<boolean> {
    const token = await this.load();
    if (!token?.expiresAt) return true;
    return Date.now() > token.expiresAt;
  },

  /**
   * Get valid access token (returns null if expired or not found)
   */
  async getValidAccessToken(): Promise<string | null> {
    const token = await this.load();
    if (!token) return null;

    const expired = await this.isExpired();
    if (expired) {
      await this.clear();
      return null;
    }

    return token.accessToken;
  },
};
