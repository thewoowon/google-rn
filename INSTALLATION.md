# Installation Guide

Complete installation guide for `@openauth/google-rn`.

## Prerequisites

- React Native >= 0.73.0
- React >= 18.0.0
- iOS 13.0 or later
- Android API 21 or later

## Installation

### 1. Install the package

```bash
# Using yarn
yarn add @openauth/google-rn

# Using npm
npm install @openauth/google-rn
```

### 2. Install peer dependencies

```bash
# Using yarn
yarn add @react-native-async-storage/async-storage react-native-get-random-values

# Using npm
npm install @react-native-async-storage/async-storage react-native-get-random-values
```

### 3. iOS Setup

#### Install CocoaPods dependencies

```bash
cd ios && pod install && cd ..
```

#### Configure Info.plist

Add the following to your `ios/YourApp/Info.plist`:

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

Replace `YOUR_CLIENT_ID` with your actual Google OAuth Client ID.

#### Handle URL callbacks in AppDelegate

In `ios/YourApp/AppDelegate.mm`, add:

```objc
#import <React/RCTLinkingManager.h>

// Add this method
- (BOOL)application:(UIApplication *)application
   openURL:(NSURL *)url
   options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  return [RCTLinkingManager application:application openURL:url options:options];
}
```

### 4. Android Setup

#### Update AndroidManifest.xml

Add the following to your `android/app/src/main/AndroidManifest.xml`:

```xml
<activity
  android:name=".MainActivity"
  android:launchMode="singleTask"
  android:configChanges="keyboard|keyboardHidden|orientation|screenSize|uiMode">
  
  <!-- Add this intent filter -->
  <intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="com.googleusercontent.apps.YOUR_CLIENT_ID" />
  </intent-filter>
</activity>
```

#### Update MainApplication (if needed)

In `android/app/src/main/java/.../MainApplication.kt` or `.java`, add the package:

```kotlin
import com.openauth.googlern.GoogleAuthPackage

override fun getPackages(): List<ReactPackage> =
    PackageList(this).packages.apply {
        add(GoogleAuthPackage())
    }
```

#### Update build.gradle

In your `android/app/build.gradle`, ensure you have:

```gradle
android {
    compileSdkVersion 33
    
    defaultConfig {
        minSdkVersion 21
        targetSdkVersion 33
    }
}
```

### 5. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Configure OAuth consent screen if needed
6. Create two OAuth client IDs:
   - **iOS**: Type: iOS, Bundle ID: your iOS bundle ID
   - **Android**: Type: Android, Package name: your Android package name, SHA-1: your app's SHA-1
   - **Web** (for development): Type: Web application

## Configuration

### Initialize in your app

```tsx
import React, { useEffect } from 'react';
import { NativeModules } from 'react-native';

const { GoogleAuthModule } = NativeModules;

function App() {
  useEffect(() => {
    GoogleAuthModule.configure({
      clientId: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
      redirectUri: 'com.googleusercontent.apps.YOUR_CLIENT_ID:/oauth2callback',
      scopes: ['openid', 'profile', 'email'],
    });
  }, []);

  // Your app code...
}
```

### Environment Variables (Recommended)

Create a `.env` file:

```env
GOOGLE_CLIENT_ID_IOS=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_ID_ANDROID=yyy.apps.googleusercontent.com
GOOGLE_CLIENT_ID_WEB=zzz.apps.googleusercontent.com
```

Use with `react-native-config`:

```tsx
import Config from 'react-native-config';

GoogleAuthModule.configure({
  clientId: Platform.select({
    ios: Config.GOOGLE_CLIENT_ID_IOS,
    android: Config.GOOGLE_CLIENT_ID_ANDROID,
  }),
  redirectUri: `com.googleusercontent.apps.${clientId}:/oauth2callback`,
  scopes: ['openid', 'profile', 'email'],
});
```

## Troubleshooting

### iOS Issues

**Problem**: "No application is registered for the callback scheme"
- **Solution**: Ensure the URL scheme in Info.plist matches your redirect URI

**Problem**: Browser doesn't return to app after sign in
- **Solution**: Check AppDelegate implementation of `openURL` method

### Android Issues

**Problem**: "Intent not handled"
- **Solution**: Verify the intent filter in AndroidManifest.xml matches your scheme

**Problem**: "Google Sign-In failed with error code 10"
- **Solution**: Check SHA-1 certificate fingerprint in Google Console matches your app's certificate

### Getting SHA-1 Fingerprint

Debug keystore:
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Release keystore:
```bash
keytool -list -v -keystore /path/to/your/release.keystore -alias your-alias
```

## Testing

### Test in Development

1. Start Metro bundler:
   ```bash
   npx react-native start
   ```

2. Run on iOS:
   ```bash
   npx react-native run-ios
   ```

3. Run on Android:
   ```bash
   npx react-native run-android
   ```

### Test the OAuth Flow

1. Tap "Sign In with Google"
2. Browser should open with Google sign-in page
3. Sign in with your Google account
4. App should return with user information

## Next Steps

- Check out the [Example App](./example/App.tsx)
- Read the [API Documentation](./README.md#api-reference)
- See [Advanced Usage](./docs/ADVANCED.md) for custom implementations
