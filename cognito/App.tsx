import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthProvider } from './src/contexts/AuthContext';

// Screens (we’ll build these next)
import Splash from './src/screens/Splash';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';

export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  Splash: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// configure prefixes + route-to-screen mapping
const linking = {
  prefixes: [
    'khatoon://',              // native deep link
    //'https://localhost:8081',  // web secure
    //'http://localhost:8081'    // web insecure
  ],
  config: {
    screens: {
      Splash: '',
      Auth: 'redirect',  // any of the above + /redirect → AuthScreen
      Home: 'home'       // home → Home
    }
  }
};


export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer linking={linking}>
        <Stack.Navigator initialRouteName="Splash">
          <Stack.Screen
           name="Splash"
           component={Splash}
           options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'Welcome' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
