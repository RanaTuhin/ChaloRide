import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ChaloRideProvider } from '@/state/chaloride-store';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ChaloRideProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="ride/[id]" options={{ title: 'Your Ride' }} />
          <Stack.Screen name="support" options={{ title: 'Support' }} />
          <Stack.Screen name="auth/sign-in" options={{ title: 'Sign in' }} />
          <Stack.Screen name="auth/sign-up" options={{ title: 'Create account' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Add payment method' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </ChaloRideProvider>
  );
}
