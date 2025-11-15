// src/utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Secure storage utility using AsyncStorage
 *
 * Note: For production apps, consider using:
 * - react-native-keychain for iOS/Android secure storage
 * - expo-secure-store for Expo projects
 *
 * This implementation uses AsyncStorage which is NOT encrypted by default.
 * It's suitable for non-sensitive data or development purposes.
 */
export const SecureStorage = {
  /**
   * Store a value
   * @param key Storage key
   * @param value Value to store (will be JSON stringified)
   */
  async set(key: string, value: unknown): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('[SecureStorage:set] Failed to store key', key, error);
      throw error;
    }
  },

  /**
   * Retrieve a value
   * @param key Storage key
   * @returns Parsed value or null if not found
   */
  async get<T = unknown>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? (JSON.parse(jsonValue) as T) : null;
    } catch (error) {
      console.error('[SecureStorage:get] Failed to get key', key, error);
      return null;
    }
  },

  /**
   * Remove a value
   * @param key Storage key
   */
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('[SecureStorage:remove] Failed to remove key', key, error);
      throw error;
    }
  },

  /**
   * Clear all storage
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('[SecureStorage:clear] Failed to clear storage', error);
      throw error;
    }
  },

  /**
   * Get all keys
   */
  async getAllKeys(): Promise<readonly string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('[SecureStorage:getAllKeys] Failed to get keys', error);
      return [];
    }
  },
};
