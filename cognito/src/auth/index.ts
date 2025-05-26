// src/auth/index.ts

/**
 * @packageDocumentation
 * @module expognito
 *
 * A unified authentication solution for React Native & React Web using AWS
 * Cognito with PKCE.
 *
 * ### Features
 * - **AuthProvider** + **useAuth** hook for central token management and
 *   session state
 * - **AuthFlow** navigator component that wires up React Navigation and deep linking
 *
 * ### Quickstart
 * ```tsx
 * import React from 'react';
 * import { AuthProvider, AuthFlow } from '@khatoon/auth';
 * import { navigationLinking } from './linkingConfig';
 *
 * export default function App() {
 *   return (
 *     <AuthProvider>
 *       <AuthFlow linking={navigationLinking} />
 *     </AuthProvider>
 *   );
 * }
 * ```
 *
 * ### Exports
 * - `AuthProvider` — wrap your app to enable authentication context
 * - `useAuth` — hook to access `isSignedIn`, `userEmail`, `signIn`, `signOut`, etc.
 * - `AuthFlow` — ready-to-use React Navigation stack for auth screens
 * - `AuthFlowProps` — parameters accepted by `AuthFlow` component
 */


export { AuthProvider, useAuth } from './contexts/AuthContext';
export { default as AuthFlow }    from './navigators/AuthFlow';
