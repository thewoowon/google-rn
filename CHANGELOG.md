# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2025-01-15

### Changed
- **BREAKING**: Renamed package from `@openauth/google-rn` to `@thewoowon/google-rn`
- Renamed Android package from `com.openauth.googlern` to `com.thewoowon.googlern`
- Renamed iOS podspec from `openauth-google-rn` to `thewoowon-google-rn`
- Updated all documentation and example files with new package name
- Updated GitHub repository URLs from `openauth/google-rn` to `thewoowon/google-rn`

### Migration Guide
If upgrading from 0.1.0:
1. Update your `package.json`: `@openauth/google-rn` → `@thewoowon/google-rn`
2. Update imports: `import { useGoogleAuth } from '@thewoowon/google-rn'`
3. Android: Update MainApplication import to `com.thewoowon.googlern.GoogleAuthPackage`
4. iOS: Run `pod install` to update to new podspec name

## [0.1.0] - 2024-11-09

### Added
- Initial release of `@thewoowon/google-rn`
- Google OAuth 2.0 authentication for React Native
- `useGoogleAuth` hook with complete authentication flow
- iOS native module with ASWebAuthenticationSession
- Android native module with Custom Tabs
- Token management with automatic expiration handling
- Secure storage using AsyncStorage
- PKCE (Proof Key for Code Exchange) implementation
- Web Crypto API integration for secure operations
- TypeScript support with complete type definitions
- Comprehensive example app
- Full documentation and installation guide

### Features
- ✅ Sign in with Google
- ✅ Sign out functionality
- ✅ Get access token
- ✅ Automatic token refresh
- ✅ User profile information
- ✅ Email verification status
- ✅ Profile picture support
- ✅ Custom scopes support
- ✅ OAuth state verification
- ✅ Error handling

### Native Modules
- **iOS**: Swift-based module using ASWebAuthenticationSession
- **Android**: Kotlin-based module using Chrome Custom Tabs
- Support for iOS 13.0+
- Support for Android API 21+

### Security
- PKCE flow for enhanced security
- State parameter validation
- Secure token storage
- HTTPS enforcement
- URL scheme validation

### Documentation
- Complete README with examples
- Installation guide
- API reference
- Platform-specific setup instructions
- Troubleshooting guide

## [Unreleased]

### Planned Features
- Token refresh implementation
- Revoke token functionality
- Silent sign-in
- Google One Tap sign-in
- Expo compatibility
- Web support via react-native-web

### Improvements
- Enhanced error messages
- Better TypeScript types
- Performance optimizations
- More comprehensive testing

---

## Version History

- **0.1.0** - Initial release (2024-11-09)
