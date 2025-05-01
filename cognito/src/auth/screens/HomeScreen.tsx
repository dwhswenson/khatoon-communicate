// src/screens/HomeScreen.tsx

import React from 'react';
import { Platform, View, Text, Button } from 'react-native';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { clearTokens } from '../utils/tokenStorage';
import { RootStackParamList } from '../../App';

// Grab your Cognito info from app.config.js → Constants.manifest.extra
const { COGNITO_DOMAIN, COGNITO_CLIENT_ID } =
  (Constants.manifest?.extra ?? {}) as Record<string, string>;

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { userEmail, signOut } = useAuth();
  console.log('userEmail', userEmail);
  const handleSignOut = async () => {
    await signOut()

    // cognito logout
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'khatoon',
      path: 'redirect',
      useProxy: false,   // use your registered localhost URLs
    });
    const logoutUrl =
      `https://${COGNITO_DOMAIN}/logout?` +
      `client_id=${COGNITO_CLIENT_ID}` +
      `&logout_uri=${encodeURIComponent(redirectUri)}`;

    // logout: web
    if (Platform.OS === 'web') {
      console.log("Logging out: " + logoutUrl);
      window.location.assign(logoutUrl);
      return
    }

    // logout: native
    await WebBrowser.openAuthSessionAsync(logoutUrl, redirectUri);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Auth' }],
    });
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      { userEmail ? (
        <Text style={{ marginBottom: 20 }}>
          Logged in as: {userEmail}
        </Text>
      ) : null }
      <Text>You’re signed in! 🎉</Text>
      <Button title="Sign Out" onPress={handleSignOut} />
    </View>
  );
}
