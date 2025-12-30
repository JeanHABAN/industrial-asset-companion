import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />

   

      {/* Devices Tab */}
      <Tabs.Screen
        name="devices"
        options={{
          title: '⚙️ Devices',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="cpu.fill" color={color} />
          ),
        }}
      />

      {/* Lift Stations Tab */}
      <Tabs.Screen
        name="lift-stations"
        options={{
          title: '💧 Lift Stations',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="drop.fill" color={color} />
          ),
        }}
      />
         {/* Explore Tab */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
