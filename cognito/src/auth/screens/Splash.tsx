// src/screens/Splash.tsx

import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import RootStackParamList from '../../../App';

export default function Splash() {
  console.log('Splash screen loaded');
  return (
    <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
      <ActivityIndicator size="large" />
    </View>
  );
}
