// App.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// Screens
import Splash     from './src/screens/Splash';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';

export type RootStackParamList = {
  Splash: undefined;
  Auth:   undefined;
  Home:   undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Tell React Navigation about your callback URLs
const linking = {
  prefixes: [
    'khatoon://',
    'http://localhost:8081',
    'https://localhost:8081',
  ],
  config: {
    screens: {
      Splash: '',
      Auth:   { path: 'redirect', parse: { code: (c: string) => c } },
      Home:   'home',
    }
  }
};

function AppNav() {
  const { isSignedIn } = useAuth();

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator>
        {isSignedIn ? (
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export function Core() {
  const { isLoading } = useAuth();

  // 1) While rehydrating/refreshing, just show Splash
  if (isLoading) {
    return <Splash />;
  }

  // 2) Once loading is done, mount the navigator (with linking)
  return (
    <AppNav />
  );
}

// Wrap the whole thing in AuthProvider
export default function App() {
  return (
    <AuthProvider>
      <Core />
    </AuthProvider>
  );
}
