// src/auth/navigator/AuthFlow.tsx

import React from 'react';
import { NavigationContainer, type LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../contexts/AuthContext';

// default screen implementations
import DefaultSplash     from '../screens/Splash';
import DefaultAuthScreen from '../screens/AuthScreen';
import DefaultHomeScreen from '../screens/HomeScreen';

export type AuthFlowProps = {
  SplashComponent?: React.ComponentType;
  AuthScreenComponent?: React.ComponentType<any>;
  HomeScreenComponent?: React.ComponentType<any>;
  linking: LinkingOptions<any>;
};

export default function AuthFlow({
  SplashComponent     = DefaultSplash,
  AuthScreenComponent = DefaultAuthScreen,
  HomeScreenComponent = DefaultHomeScreen,
  linking,
}: AuthFlowProps) {
  const { isLoading, isSignedIn } = useAuth();
  const Stack = createNativeStackNavigator();

  // Show the splash override (or default) while the context is loading
  if (isLoading) {
    return <SplashComponent />;
  }

  // Once loaded, mount the navigator
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator>
        {isSignedIn ? (
          <Stack.Screen
            name="Home"
            component={HomeScreenComponent}
            options={{ headerShown: false }}
          />
        ) : (
          <Stack.Screen
            name="Auth"
            component={AuthScreenComponent}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
