import React from 'react';

export type AuthContentProps = {
  isLoading:       boolean;
  isSignedIn:      boolean;
  SplashComponent: React.ComponentType;
  AuthScreenComponent: React.ComponentType<any>;
  HomeScreenComponent: React.ComponentType<any>;
};

export function AuthContent({
  isLoading,
  isSignedIn,
  SplashComponent,
  AuthScreenComponent,
  HomeScreenComponent,
}: AuthContentProps) {
  if (isLoading) {
    return <SplashComponent />;
  }
  return isSignedIn
    ? <HomeScreenComponent />
    : <AuthScreenComponent />;
}
