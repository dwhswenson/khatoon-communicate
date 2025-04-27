import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens (we’ll build these next)
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';

export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
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
      Auth: 'redirect',  // any of the above + /redirect → AuthScreen
      Home: ''                // root → Home
    }
  }
};


export default function App() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator initialRouteName="Auth">
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
  );
}
