// src/screens/Splash.tsx

import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { getTokens } from '../utils/tokenStorage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList }       from '../../App';
import { refreshTokens, scheduleProactiveRefresh } from '../utils/refreshTokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function Splash({ navigation }: Props) {
  console.log('Splash screen loaded');
  useEffect(() => {
    (async () => {
      const tokens = await getTokens();
      if (tokens) {
        scheduleProactiveRefresh(tokens);
        console.log('Tokens found:', tokens);

        // check expiry and refresh if needed
        const now = Date.now();
        const expiry = tokens.fetchedAt + tokens.expiresIn * 1000;
        if (now > expiry) {
          const ok = await refreshTokens();
          if (!ok) {
            return navigation.replace("Auth");
          }
        }

        navigation.replace('Home');
      } else {
        navigation.replace('Auth');
      }
    })();
  }, []);

  return (
    <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
      <ActivityIndicator size="large" />
    </View>
  );
}
