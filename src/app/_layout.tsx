import { CormorantGaramond_500Medium } from '@expo-google-fonts/cormorant-garamond/500Medium';
import { CormorantGaramond_600SemiBold } from '@expo-google-fonts/cormorant-garamond/600SemiBold';
import { NotoSerifDevanagari_600SemiBold } from '@expo-google-fonts/noto-serif-devanagari/600SemiBold';
import { NotoSerifTamil_400Regular } from '@expo-google-fonts/noto-serif-tamil/400Regular';
import { NotoSerifTamil_600SemiBold } from '@expo-google-fonts/noto-serif-tamil/600SemiBold';
import { NotoSerifTamil_700Bold } from '@expo-google-fonts/noto-serif-tamil/700Bold';
import { useFonts } from 'expo-font';
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
