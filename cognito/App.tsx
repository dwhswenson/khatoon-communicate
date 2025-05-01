// App.tsx

import React from 'react';
import { AuthProvider, AuthFlow } from './src/auth';

const linking = {
 prefixes: [
   'khatoon://',
   'http://localhost:8081',
   'https://localhost:8081',
 ],
 config: {
   screens: {
     Splash: '',
     Auth: { path: 'redirect', parse: { code: (c: string) => c } },
     Home: 'home',
   }
 }
};

export default function App() {
  return (
    <AuthProvider>
      <AuthFlow linking={linking} />
    </AuthProvider>
  );
}
