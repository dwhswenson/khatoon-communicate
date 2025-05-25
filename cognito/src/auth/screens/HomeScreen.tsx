// src/auth/screens/HomeScreen.tsx

import React from 'react';
import { Platform, View, Text, Button } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthFlowParamList } from '../navigators/types';
import { useAuth } from '../contexts/AuthContext';
import { buildLogoutUrl } from '../utils/urls';

const {
  COGNITO_DOMAIN,
  COGNITO_CLIENT_ID,
} = (Constants.manifest?.extra ?? {}) as Record<string,string>;

type Props = NativeStackScreenProps<AuthFlowParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { userEmail, signOut } = useAuth();

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'khatoon',
    path:   'redirect',
  });

  const handleSignOut = async () => {
    await signOut();

    const logoutUrl = buildLogoutUrl({
      domain:      COGNITO_DOMAIN,
      clientId:    COGNITO_CLIENT_ID,
      redirectUri,
    });

    if (Platform.OS === 'web') {
      window.location.assign(logoutUrl);
    } else {
      await WebBrowser.openAuthSessionAsync(logoutUrl, redirectUri);
      navigation.reset({
        index:  0,
        routes: [{ name: 'Auth' }],
      });
    }
  };

  return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
      {userEmail ? (
        <Text style={{ marginBottom: 20 }}>
          Logged in as: {userEmail}
        </Text>
      ) : null}
      <Text>You’re signed in! 🎉</Text>
      <Button title="Sign Out" onPress={handleSignOut} />
    </View>
  );
}
