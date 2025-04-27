// src/screens/AuthScreen.tsx

import React, { useEffect } from 'react';
import {
  Platform,
  View,
  Button,
  ActivityIndicator,
  Alert
} from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import Constants from 'expo-constants';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

WebBrowser.maybeCompleteAuthSession();

const {
  COGNITO_DOMAIN,
  COGNITO_CLIENT_ID,
  EXCHANGE_API_URL
} = (Constants.manifest?.extra ?? {}) as Record<string,string>;

const discovery = {
  authorizationEndpoint: `https://${COGNITO_DOMAIN}/oauth2/authorize`,
  tokenEndpoint:         `https://${COGNITO_DOMAIN}/oauth2/token`,
};

type Props = NativeStackScreenProps<RootStackParamList, 'Auth'>;

export default function AuthScreen({ navigation }: Props) {
  const isWeb = Platform.OS === 'web';

  const redirectUri = AuthSession.makeRedirectUri({
    scheme:   'khatoon',
    path:     'redirect',
    useProxy: false,
  });

  console.log(`[AuthScreen] running on ${isWeb ? 'web' : 'native'}`);
  console.log('[AuthScreen] redirectUri:', redirectUri);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId:     COGNITO_CLIENT_ID,
      responseType: AuthSession.ResponseType.Code,
      scopes:       ['openid','email','profile'],
      redirectUri,
    },
    discovery
  );

  //
  // PKCE helpers for web
  //
  function randomString(length: number) {
    const arr = new Uint8Array(length);
    // browser crypto only on web
    crypto.getRandomValues(arr);
    return Array.from(arr).map(b => ('0' + b.toString(16)).slice(-2)).join('');
  }

  async function sha256Base64Url(str: string) {
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      str,
      { encoding: Crypto.CryptoEncoding.BASE64 }
    );
    // convert base64 to base64url
    return hash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  async function generatePkcePair() {
    const codeVerifier = randomString(32);
    const codeChallenge = await sha256Base64Url(codeVerifier);
    return { codeVerifier, codeChallenge };
  }

  // Web full-page redirect login
  const webLogin = async () => {
    try {
      const { codeVerifier, codeChallenge } = await generatePkcePair();
      sessionStorage.setItem('pkce_verifier', codeVerifier);

      const params = new URLSearchParams({
        response_type:         'code',
        client_id:             COGNITO_CLIENT_ID,
        redirect_uri:          redirectUri,
        code_challenge:        codeChallenge,
        code_challenge_method: 'S256',
        scope:                 'openid email profile',
      });

      window.location.assign(
        `https://${COGNITO_DOMAIN}/oauth2/authorize?${params.toString()}`
      );
    } catch (err: any) {
      Alert.alert('PKCE error', err.message);
    }
  };

  // Effect: handle callback (web) or popup response (native)
  useEffect(() => {
    console.group('[AuthScreen] useEffect triggered');
    console.log('response:', response);

    if (isWeb) {
      const { pathname, search } = window.location;
      if (pathname === '/redirect' && search.includes('code=')) {
        const ps = new URLSearchParams(search);
        const code = ps.get('code')!;
        const codeVerifier = sessionStorage.getItem('pkce_verifier')!;
        console.log('Extracted code:', code, 'verifier:', codeVerifier);

        console.group('[Auth:exchange]');
        console.log('Posting to:', `${EXCHANGE_API_URL}/exchange`);
        console.log('Payload:', { code, redirectUri, codeVerifier });

        fetch(`${EXCHANGE_API_URL}/exchange`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, redirectUri, codeVerifier }),
        })
          .then(async res => {
            console.log('HTTP status:', res.status);
            const text = await res.text();
            console.log('Response body text:', text);
            if (!res.ok) {
              // show the raw response so we know what went wrong
              throw new Error(`Exchange failed ${res.status}: ${text}`);
            }
            try {
              const data = JSON.parse(text);
              console.log('Parsed tokens:', data);
              return data;
            } catch {
              console.warn('Non-JSON response, skipping parse');
              return {};
            }
          })
          .then(tokens => {
            console.log('Success—navigating to Home');
            window.history.replaceState({}, '', '/');
            navigation.replace('Home');
          })
          .catch(err => {
            console.error('Exchange error:', err);
            Alert.alert('Login Error', err.message);
          })
          .finally(() => console.groupEnd());
      }
    } else if (response?.type === 'success') {
      const { code, codeVerifier } = response.params;
      (async () => {
        try {
          const res = await fetch(`${EXCHANGE_API_URL}/exchange`, {
            method:  'POST',
            headers: {'Content-Type':'application/json'},
            body:    JSON.stringify({ code, redirectUri, codeVerifier }),
          });
          if (!res.ok) throw new Error(`Exchange failed: ${res.status}`);
          const tokens = await res.json();
          console.log('Tokens:', tokens);
          // TODO: persist tokens

          navigation.replace('Home');
        } catch (e: any) {
          Alert.alert('Login error', e.message);
        }
      })();
    }
  }, [response]);

  // Render
  if (isWeb) {
    return (
      <View style={{ flex:1,justifyContent:'center',alignItems:'center' }}>
        <Button title="Log in with Cognito" onPress={webLogin} />
      </View>
    );
  }

  if (!request) {
    return (
      <View style={{ flex:1,justifyContent:'center',alignItems:'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex:1,justifyContent:'center',alignItems:'center' }}>
      <Button
        title="Log in with Cognito"
        onPress={() => promptAsync({ useProxy: false })}
      />
    </View>
  );
}
