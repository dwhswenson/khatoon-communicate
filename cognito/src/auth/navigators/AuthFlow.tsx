// src/auth/navigator/AuthFlow.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import type { LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../contexts/AuthContext';

import DefaultSplash     from '../screens/Splash';
import DefaultAuthScreen from '../screens/AuthScreen';
import DefaultHomeScreen from '../screens/HomeScreen';

import type { AuthFlowParamList } from './types';

const Stack = createNativeStackNavigator<AuthFlowParamList>();

export type AuthFlowProps = {
  linking: LinkingOptions<any>;
  SplashComponent?: React.ComponentType;
  AuthScreenComponent?: React.ComponentType<any>;
  HomeScreenComponent?: React.ComponentType<any>;
};

export default function AuthFlow({
  linking,
  SplashComponent     = DefaultSplash,
  AuthScreenComponent = DefaultAuthScreen,
  HomeScreenComponent = DefaultHomeScreen,
}: AuthFlowProps) {
  const { isLoading, isSignedIn } = useAuth();

  if (isLoading) {
    return <SplashComponent />;
  }

  // We render *one* screen via AuthContent, inside a stack
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isSignedIn ? (
          <Stack.Screen
            name="Home"
            component={HomeScreenComponent}
          />
        ) : (
          <Stack.Screen
            name="Auth"
            component={AuthScreenComponent}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
