import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { F } from '@/theme';

export default function MainLayout() {
  const inset = useSafeAreaInsets();
  return <Tabs backBehavior="history" screenOptions={{
    headerShown: false, tabBarHideOnKeyboard: true,
    tabBarActiveTintColor: '#E0BE83', tabBarInactiveTintColor: '#96A29E',
    tabBarStyle: { backgroundColor: '#101A18', borderTopColor: '#2A3934', height: 76 + inset.bottom, paddingTop: 6, paddingBottom: Math.max(inset.bottom, 6) },
    tabBarLabelStyle: { fontFamily: F.taSemi, fontSize: 11, lineHeight: 22, flexShrink: 0 },
    sceneStyle: { backgroundColor: '#0C1412' },
  }}>
    <Tabs.Screen name="index" options={{ title: 'முகப்பு', tabBarIcon: ({ focused, size }) => <Ionicons name="home-outline" color={focused ? '#E0BE83' : '#96A29E'} size={size} /> }} />
    <Tabs.Screen name="reading" options={{ title: 'வாசிப்பு', tabBarIcon: ({ focused, size }) => <Ionicons name="book-outline" color={focused ? '#E0BE83' : '#96A29E'} size={size} /> }} />
    <Tabs.Screen name="mantras" options={{ title: 'மந்திரம்', tabBarIcon: ({ focused, size }) => <Ionicons name="musical-notes-outline" color={focused ? '#E0BE83' : '#96A29E'} size={size} /> }} />
    <Tabs.Screen name="companion" options={{ title: 'கேளுங்கள்', tabBarIcon: ({ focused, size }) => <Ionicons name="chatbubble-ellipses-outline" color={focused ? '#E0BE83' : '#96A29E'} size={size} /> }} />
  </Tabs>;
}
