// src/screens/Splash.tsx

import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { getTokens } from '../utils/tokenStorage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList }       from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function Splash({ navigation }: Props) {
  console.log('Splash screen loaded');
  useEffect(() => {
    (async () => {
      const tokens = await getTokens();
      if (tokens) {
        console.log('Tokens found:', tokens);
        // optionally check expiry here and refresh if needed…
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
