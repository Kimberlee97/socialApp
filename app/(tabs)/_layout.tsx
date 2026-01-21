import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; 
import { styles, colors } from './_layoutStyles';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.active,
        tabBarInactiveTintColor: colors.inactive,
        tabBarShowLabel: false, 
        
        tabBarStyle: {
          ...styles.tabBar, 
          
          height: 70 + insets.bottom, 
          
          paddingBottom: insets.bottom + 10,
        },
      }}
    >
      
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              size={28} 
              color={color} 
            />
          ),
        }}
      />

      <Tabs.Screen
        name="create"
        options={{
          title: 'New Post',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "add-circle" : "add-circle-outline"} 
              size={28} 
              color={color} 
            />
          ),
        }}
      />

    </Tabs>
  );
}