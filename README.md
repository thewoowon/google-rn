# @thewoowon/google-rn

<div align="center">

[![npm version](https://img.shields.io/npm/v/@thewoowon/google-rn.svg)](https://www.npmjs.com/package/@thewoowon/google-rn)
[![license](https://img.shields.io/npm/l/@thewoowon/google-rn.svg)](https://github.com/thewoowon/google-rn/blob/main/LICENSE)
[![downloads](https://img.shields.io/npm/dm/@thewoowon/google-rn.svg)](https://www.npmjs.com/package/@thewoowon/google-rn)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue.svg)](https://www.typescriptlang.org/)

**Lightweight, secure, and 100% free Google OAuth2 library for React Native**

[Installation](#installation) • [Usage](#usage) • [API](#api-reference) • [Platform Setup](#platform-setup) • [Contributing](#contributing)

</div>

---

## ✨ Features

- 🚀 **Easy to use** - Simple React hook API
- 🔒 **Secure** - PKCE flow, state validation, secure token storage
- 📱 **Cross-platform** - iOS & Android support
- 🎯 **TypeScript** - Full type safety with complete type definitions
- 🆓 **100% Free** - No subscriptions, no hidden costs
- 🪶 **Lightweight** - Minimal dependencies
- 🔧 **Flexible** - Customizable scopes and configuration
- 📦 **Well-documented** - Comprehensive guides and examples

## Installation

```bash
yarn add @thewoowon/google-rn
# or
npm install @thewoowon/google-rn
```

### Dependencies

This package requires the following peer dependencies:

```bash
yarn add @react-native-async-storage/async-storage react-native-get-random-values
```

## Usage

### Basic Example

```tsx
import React from 'react';
import { View, Button, Text } from 'react-native';
import { useGoogleAuth } from '@thewoowon/google-rn';

function App() {
  const { user, loading, signIn, signOut, isAuthenticated } = useGoogleAuth();

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {isAuthenticated ? (
        <>
          <Text>Welcome, {user?.name || user?.email}!</Text>
          <Button title="Sign Out" onPress={signOut} />
        </>
      ) : (
        <Button title="Sign In with Google" onPress={signIn} />
      )}
    </View>
  );
}

export default App;
```

### Getting Access Token

```tsx
import { useGoogleAuth } from '@thewoowon/google-rn';

function MyComponent() {
  const { getAccessToken } = useGoogleAuth();

  const callApi = async () => {
    const token = await getAccessToken();
    if (token) {
      // Use the token for API calls
      const response = await fetch('https://api.example.com/data', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  };

  return <Button title="Call API" onPress={callApi} />;
}
```

## API Reference

### `useGoogleAuth()`

React hook for Google OAuth authentication.

**Returns:**

```typescript
{
  user: GoogleUser | null;        // Current user or null if not signed in
  loading: boolean;                 // Whether auth operation is in progress
  signIn: () => Promise<void>;      // Sign in with Google
  signOut: () => Promise<void>;     // Sign out
  getAccessToken: () => Promise<string | null>; // Get current access token
  isAuthenticated: boolean;         // Whether user is authenticated
}
```

### Types

```typescript
interface GoogleUser {
  id: string;
  email: string;
  emailVerified?: boolean;
  name?: string;
  givenName?: string;
  familyName?: string;
  photoUrl?: string;
  locale?: string;
}

interface GoogleToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  idToken?: string;
  tokenType?: string;
  scope?: string;
}
```

## Utilities

The package also exports utility functions for advanced use cases:

```typescript
import {
  TokenManager,
  SecureStorage,
  generatePKCE,
} from '@thewoowon/google-rn';

// Token management
await TokenManager.save(token);
const token = await TokenManager.load();
await TokenManager.clear();
const isExpired = await TokenManager.isExpired();

// Secure storage
await SecureStorage.set('key', value);
const value = await SecureStorage.get('key');
await SecureStorage.remove('key');

// PKCE generation for OAuth
const { verifier, challenge } = await generatePKCE();
```

## Platform Setup

### iOS Setup

1. Add URL scheme to your `Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>com.googleusercontent.apps.YOUR_CLIENT_ID</string>
    </array>
  </dict>
</array>
```

### Android Setup

1. Add intent filter to your `AndroidManifest.xml`:

```xml
<activity
  android:name=".MainActivity"
  android:launchMode="singleTask">
  <intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="com.googleusercontent.apps.YOUR_CLIENT_ID" />
  </intent-filter>
</activity>
```

## Security Notes

- This package uses `@react-native-async-storage/async-storage` for token storage, which is NOT encrypted by default
- For production apps with sensitive data, consider using:
  - [react-native-keychain](https://github.com/oblador/react-native-keychain) for iOS/Android secure storage
  - [expo-secure-store](https://docs.expo.dev/versions/latest/sdk/securestore/) for Expo projects
- PKCE (Proof Key for Code Exchange) is implemented for enhanced security

## 📚 Documentation

- [Installation Guide](./INSTALLATION.md) - Detailed setup instructions
- [Example App](./example/App.tsx) - Full working example
- [Contributing Guide](./CONTRIBUTING.md) - How to contribute
- [Changelog](./CHANGELOG.md) - Version history

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) to get started.

## 📄 License

MIT © thewoowon

## 🙏 Acknowledgments

- Built with React Native
- Uses ASWebAuthenticationSession for iOS
- Uses Chrome Custom Tabs for Android
- Inspired by the need for a free, simple Google OAuth solution

## 💬 Support

- 🐛 [Report an Issue](https://github.com/thewoowon/google-rn/issues)
- 💡 [Request a Feature](https://github.com/thewoowon/google-rn/issues)
- 📖 [View Documentation](./INSTALLATION.md)

---

<div align="center">

Made with ❤️ by thewoowon

**[⭐ Star us on GitHub](https://github.com/thewoowon/google-rn)**

</div>
