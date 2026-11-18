import { Tabs } from 'expo-router/js-tabs';
import { Bell, ClipboardList, Home, User } from 'lucide-react-native';
import React from 'react';
import { Platform } from 'react-native';

import { AppColors } from '@/constants/colors';
import { useNotifications } from '@/hooks/useNotifications';

export default function TabsLayout() {
  const { unreadCount } = useNotifications();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: AppColors.primary,
        tabBarInactiveTintColor: AppColors.textSecondary,
        tabBarStyle: {
          backgroundColor: AppColors.surface,
          borderTopColor: AppColors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 82 : 60,
          paddingTop: 6,
          paddingBottom: Platform.OS === 'ios' ? 24 : 7,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 11,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home color={color} size={21} strokeWidth={1.9} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'My Tasks',
          tabBarIcon: ({ color }) => (
            <ClipboardList color={color} size={21} strokeWidth={1.9} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarBadge: unreadCount > 0 ? (unreadCount > 9 ? '9+' : unreadCount) : undefined,
          tabBarBadgeStyle: {
            backgroundColor: AppColors.primary,
            color: '#FFFFFF',
            fontSize: 10,
            fontFamily: 'Inter_600SemiBold',
          },
          tabBarIcon: ({ color }) => <Bell color={color} size={21} strokeWidth={1.9} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User color={color} size={21} strokeWidth={1.9} />,
        }}
      />
    </Tabs>
  );
}
