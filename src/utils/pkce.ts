// src/utils/pkce.ts
import 'react-native-get-random-values';

/**
 * Generates a cryptographically secure random string
 */
function generateRandomString(length: number): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);

  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset[randomValues[i] % charset.length];
  }
  return result;
}

/**
 * SHA-256 hash implementation using Web Crypto API
 */
async function sha256(buffer: Uint8Array): Promise<ArrayBuffer> {
  // Use Web Crypto API which is polyfilled by react-native-get-random-values
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    return await crypto.subtle.digest('SHA-256', buffer);
  }

  // Fallback: simple hash (NOT SECURE - only for development)
  console.warn('[PKCE] Using insecure hash fallback. Install proper crypto polyfill.');
  let hash = 0;
  for (let i = 0; i < buffer.length; i++) {
    hash = ((hash << 5) - hash) + buffer[i];
    hash = hash & hash;
  }
  const result = new ArrayBuffer(32);
  const view = new DataView(result);
  view.setInt32(0, hash);
  return result;
}

/**
 * Base64 URL encode
 */
function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Generate PKCE code verifier and challenge
 */
export async function generatePKCE(): Promise<{ verifier: string; challenge: string }> {
  // Generate code verifier (43-128 characters)
  const verifier = generateRandomString(128);

  // Create code challenge from verifier
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hashBuffer = await sha256(data);
  const challenge = base64UrlEncode(hashBuffer);

  return { verifier, challenge };
}
