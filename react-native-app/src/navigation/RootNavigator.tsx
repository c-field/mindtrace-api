import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';
import { COLORS } from '../constants';
import { useAuth } from '../hooks';
import type { RootStackParamList } from '../types';

// Import navigators and screens
import TabNavigator from './TabNavigator';
import AuthScreen from '../screens/auth/AuthScreen';
import LoadingScreen from '../screens/auth/LoadingScreen';

const Stack = createStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="MainTabs" component={TabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;