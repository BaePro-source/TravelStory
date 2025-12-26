/**
 * Travel Story App
 * React Native Travel Journal & Storybook Generator
 *
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

export default App;
