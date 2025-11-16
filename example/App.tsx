import React, { useEffect } from 'react';
import {
  Button,
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useGoogleAuth } from '@thewoowon/google-rn';

export default function App() {
  const { user, loading, signIn, signOut, isAuthenticated, getAccessToken } =
    useGoogleAuth();

  useEffect(() => {
    // Configure Google Auth on mount
    // In production, you'd load these from environment variables
    const configure = async () => {
      // Example: GoogleAuthModule.configure({
      //   clientId: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
      //   redirectUri: 'com.googleusercontent.apps.YOUR_CLIENT_ID:/oauth2callback',
      //   scopes: ['openid', 'profile', 'email']
      // });
    };

    configure();
  }, []);

  const handleSignIn = async () => {
    try {
      await signIn();
      Alert.alert('Success', 'Signed in successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in. Please try again.');
      console.error('Sign in error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      Alert.alert('Success', 'Signed out successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out.');
      console.error('Sign out error:', error);
    }
  };

  const handleGetToken = async () => {
    const token = await getAccessToken();
    if (token) {
      Alert.alert('Access Token', token.substring(0, 50) + '...');
    } else {
      Alert.alert('No Token', 'No valid access token available');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>@openauth/google-rn</Text>
          <Text style={styles.subtitle}>Google OAuth Example</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4285F4" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : isAuthenticated && user ? (
          <View style={styles.userContainer}>
            {user.photoUrl ? (
              <Image
                source={{ uri: user.photoUrl }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>
                  {user.name?.charAt(0) || user.email?.charAt(0) || '?'}
                </Text>
              </View>
            )}

            <Text style={styles.welcomeText}>Welcome!</Text>
            <Text style={styles.userName}>{user.name || 'User'}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>

            {user.emailVerified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ Verified</Text>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <Button
                title="Get Access Token"
                onPress={handleGetToken}
                color="#4285F4"
              />
              <View style={styles.buttonSpacer} />
              <Button
                title="Sign Out"
                onPress={handleSignOut}
                color="#DB4437"
              />
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>User Info:</Text>
              <Text style={styles.infoText}>ID: {user.id}</Text>
              {user.locale && (
                <Text style={styles.infoText}>Locale: {user.locale}</Text>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>
              Sign in with your Google account to get started
            </Text>
            <View style={styles.googleButton}>
              <Button
                title="Sign In with Google"
                onPress={handleSignIn}
                color="#4285F4"
              />
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Powered by @openauth/google-rn
          </Text>
          <Text style={styles.footerSubtext}>
            Free & Open Source React Native Google OAuth
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  userContainer: {
    flex: 1,
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  avatarPlaceholder: {
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    color: 'white',
    fontWeight: 'bold',
  },
  welcomeText: {
    fontSize: 20,
    color: '#666',
    marginBottom: 8,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  verifiedBadge: {
    backgroundColor: '#0F9D58',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 24,
  },
  verifiedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 24,
  },
  buttonSpacer: {
    height: 12,
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  signInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  googleButton: {
    width: '100%',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 10,
    color: '#bbb',
  },
});
