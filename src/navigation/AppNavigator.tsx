import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../config/firebase';

import HomeScreen from '../screens/HomeScreen';
import DiaryWriteScreen from '../screens/DiaryWriteScreen';
import StorybookViewScreen from '../screens/StorybookViewScreen';
import StoryBookScreen from '../screens/StoryBookScreen';
import DiaryListScreen from '../screens/DiaryListScreen';
import LoginScreen from '../screens/LoginScreen';
import { RootStackParamList } from '../types';


export type MainTabParamList = {
  Home: undefined;
  Storybooks: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 60,
        },
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#999999',
        headerShown: false,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: '나의 여행',
        }}
      />
      <Tab.Screen
        name="Storybooks"
        component={StoryBookScreen}
        options={{
          tabBarLabel: '스토리북',
        }}
      />
    </Tab.Navigator>
  );
};


const AppNavigator = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const subscriber = onAuthStateChanged(auth(), (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });
    return subscriber; // unsubscribe on unmount
  }, [initializing]);

  if (initializing) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="DiaryList" component={DiaryListScreen} />
            <Stack.Screen name="DiaryWrite" component={DiaryWriteScreen} />
            <Stack.Screen name="StorybookView" component={StorybookViewScreen} />

          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};


export default AppNavigator;
