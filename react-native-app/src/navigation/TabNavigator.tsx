import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, DIMENSIONS, SPACING } from '../constants';
import type { MainTabParamList } from '../types';

// Import screens
import TrackScreen from '../screens/main/TrackScreen';
import AnalyzeScreen from '../screens/main/AnalyzeScreen';
import ExportScreen from '../screens/main/ExportScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Track':
              iconName = focused ? 'add-circle' : 'add-circle-outline';
              break;
            case 'Analyze':
              iconName = focused ? 'analytics' : 'analytics-outline';
              break;
            case 'Export':
              iconName = focused ? 'download' : 'download-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textTertiary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          height: DIMENSIONS.tabBarHeight,
          paddingBottom: SPACING.sm,
          paddingTop: SPACING.sm,
        },
        headerStyle: {
          backgroundColor: COLORS.background,
          height: DIMENSIONS.headerHeight,
        },
        headerTintColor: COLORS.textPrimary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Track" 
        component={TrackScreen}
        options={{ title: 'Track Thoughts' }}
      />
      <Tab.Screen 
        name="Analyze" 
        component={AnalyzeScreen}
        options={{ title: 'Analyze Patterns' }}
      />
      <Tab.Screen 
        name="Export" 
        component={ExportScreen}
        options={{ title: 'Export Data' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;