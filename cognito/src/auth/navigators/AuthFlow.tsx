// src/auth/navigator/AuthFlow.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import type { LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../contexts/AuthContext';

// default screen implementations
import DefaultSplash     from '../screens/Splash';
import DefaultAuthScreen from '../screens/AuthScreen';
import DefaultHomeScreen from '../screens/HomeScreen';

import type { AuthFlowParamList } from './types';
const Stack = createNativeStackNavigator<AuthFlowParamList>();

export type AuthFlowProps = {
  SplashComponent?: React.ComponentType;
  AuthScreenComponent?: React.ComponentType<any>;
  HomeScreenComponent?: React.ComponentType<any>;
  linking: LinkingOptions<any>;
};

import { AuthContent } from '../components/AuthContent';

export default function AuthFlow({
  SplashComponent     = DefaultSplash,
  AuthScreenComponent = DefaultAuthScreen,
  HomeScreenComponent = DefaultHomeScreen,
  linking,
}: AuthFlowProps) {
  const { isLoading, isSignedIn } = useAuth();

  // We render *one* screen via AuthContent, inside a stack
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Root">
          {() => (
            <AuthContent
              isLoading={isLoading}
              isSignedIn={isSignedIn}
              SplashComponent={SplashComponent}
              AuthScreenComponent={AuthScreenComponent}
              HomeScreenComponent={HomeScreenComponent}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
