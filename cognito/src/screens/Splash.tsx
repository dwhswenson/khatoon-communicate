// src/screens/Splash.tsx

import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { getTokens } from '../utils/tokenStorage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList }       from '../../App';
import { useAuth } from '../contexts/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function Splash({ navigation }: Props) {
  console.log('Splash screen loaded');
  const { isLoading, isSignedIn } = useAuth();
  useEffect(() => {
    if (!isLoading) {
      navigation.replace(isSignedIn ? 'Home' : 'Auth');
    }
  }, [isLoading, isSignedIn]);

  return (
    <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
      <ActivityIndicator size="large" />
    </View>
  );
}
