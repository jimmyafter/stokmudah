import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { InventoryProvider, useInventory } from '@/store/inventory';

SplashScreen.preventAutoHideAsync();

function Gate({ children }: { children: ReactNode }) {
  const { ready } = useInventory();
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  const show = ready && (fontsLoaded || !!fontError);

  useEffect(() => {
    if (show) SplashScreen.hideAsync();
  }, [show]);

  return show ? <>{children}</> : null;
}

export default function RootLayout() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const palette = Colors[scheme];
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      background: palette.bg,
      card: palette.surface,
      text: palette.text,
      border: palette.border,
      primary: palette.primary,
    },
  };

  return (
    <InventoryProvider>
      <ThemeProvider value={navTheme}>
        <Gate>
          <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.bg } }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="camera" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="count" options={{ presentation: 'modal' }} />
            <Stack.Screen name="settings" />
            <Stack.Screen
              name="item/[id]"
              options={{
                presentation: 'formSheet',
                sheetAllowedDetents: [0.62, 1],
                sheetGrabberVisible: true,
                sheetCornerRadius: 32,
                sheetExpandsWhenScrolledToEdge: true,
                contentStyle: { backgroundColor: palette.bg },
              }}
            />
          </Stack>
        </Gate>
      </ThemeProvider>
    </InventoryProvider>
  );
}
