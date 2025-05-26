// src/auth/screens/AuthScreen.tsx

import React, { useEffect } from 'react';
import {
  Platform,
  View,
  Button,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthFlowParamList } from '../navigators/types';
import { useAuth } from '../contexts/AuthContext';
import { useWebAuth } from '../hooks/useWebAuth';
import { parseRedirectParams } from '../utils/redirect';

WebBrowser.maybeCompleteAuthSession();

const {
  COGNITO_DOMAIN,
  COGNITO_CLIENT_ID,
  EXCHANGE_API_URL,
} = (Constants.manifest?.extra ?? {}) as Record<string,string>;

type Props = NativeStackScreenProps<AuthFlowParamList, 'Auth'>;

export default function AuthScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'khatoon',
    path:   'redirect',
  });

  const { login, handleRedirect, loading } = useWebAuth({
    domain:      COGNITO_DOMAIN,
    clientId:    COGNITO_CLIENT_ID,
    redirectUri,
    exchangeUrl: `${EXCHANGE_API_URL}/exchange`,
  });

  const isWeb = Platform.OS === 'web';
  console.log('isWeb', isWeb);
  console.log('redirectUri', redirectUri);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId:     COGNITO_CLIENT_ID,
      responseType: AuthSession.ResponseType.Code,
      scopes:       ['openid','email','profile'],
      redirectUri,
    },
    {
      authorizationEndpoint: `https://${COGNITO_DOMAIN}/oauth2/authorize`,
      tokenEndpoint:         `https://${COGNITO_DOMAIN}/oauth2/token`,
    }
  );
  console.log('request', request);

  useEffect(() => {
    console.log("In useEffect");
    if (isWeb && window.location.search.includes('code=')) {
      (async () => {
        try {
          const { code, codeVerifier } = parseRedirectParams(window.location.search);
          console.log('code', code, 'verifier', codeVerifier);
          await signIn(code, codeVerifier, redirectUri);
          console.log("heading to home");
          navigation.replace('Home');
        } catch (e: any) {
          Alert.alert('Login error', e.message);
        }
      })();
    } else if (!isWeb && response?.type === 'success') {
      (async () => {
        try {
          const { code, codeVerifier } = response.params;
          console.log('native code', code, 'verifier', codeVerifier);
          await signIn(code, codeVerifier, redirectUri);
          navigation.replace('Home');
        } catch (e: any) {
          Alert.alert('Login error', e.message);
        }
      })();
    }
  }, [response]);

  if (isWeb) {
    console.log("In web");
    return (
      <View testID="Auth-root" style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <Button
          title="Log in with Cognito"
          onPress={login}
          disabled={loading}
        />
        {loading && <ActivityIndicator style={{ marginTop: 10 }} />}
      </View>
    );
  }

  // Native popup flow: wait until request is ready
  if (!request) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
      <Button
        title="Log in with Cognito"
        onPress={() => promptAsync()}
      />
    </View>
  );
}
