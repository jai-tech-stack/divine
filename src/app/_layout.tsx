import { CormorantGaramond_500Medium, CormorantGaramond_600SemiBold } from '@expo-google-fonts/cormorant-garamond';
import { NotoSerifDevanagari_600SemiBold } from '@expo-google-fonts/noto-serif-devanagari';
import { NotoSerifTamil_400Regular, NotoSerifTamil_600SemiBold, NotoSerifTamil_700Bold, useFonts } from '@expo-google-fonts/noto-serif-tamil';
import { setAudioModeAsync } from 'expo-audio';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';

import { C } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

const theme = { ...DarkTheme, colors: { ...DarkTheme.colors, background: C.night, card: C.night, primary: C.gold, text: C.cream } };

export default function RootLayout() {
  const [loaded, error] = useFonts({
    NotoSerifTamil_400Regular,
    NotoSerifTamil_600SemiBold,
    NotoSerifTamil_700Bold,
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
    NotoSerifDevanagari_600SemiBold,
  });

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true }).catch(() => {});
  }, []);

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync().catch(() => {});
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <ThemeProvider value={theme}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.night }, animation: 'fade' }}>
        <Stack.Screen name="stories/[id]/index" options={{ animation: 'fade', presentation: 'fullScreenModal' }} />
      </Stack>
    </ThemeProvider>
  );
}
