/**
 * Travel Story App
 * React Native Travel Journal & Storybook Generator
 *
 * @format
 */

import React from 'react';
import {StatusBar} from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

function App() {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />
      <AppNavigator />
    </>
  );
}

export default App;
