import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LaunchLoader } from '@/components/launch-loader';
import { NotificationBanner } from '@/components/notifications';
import { PaletteProvider } from '@/components/ui';
import { StoreProvider, useStore } from '@/lib/store';
import { providerPalette } from '@/lib/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

function Shell() {
  const { state } = useStore();
  // The animated launch loader shows on every app start, right after the native splash.
  const [showLoader, setShowLoader] = useState(true);
  const hideLoader = useCallback(() => setShowLoader(false), []);

  useEffect(() => {
    if (state.hydrated) SplashScreen.hideAsync().catch(() => {});
  }, [state.hydrated]);

  if (!state.hydrated) return null;

  return (
    <>
      <StatusBar style={state.role === 'provider' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" options={{ animation: 'none' }} />
        <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
        <Stack.Screen name="client" options={{ animation: 'fade' }} />
        <Stack.Screen name="provider" options={{ animation: 'fade' }} />
        <Stack.Screen name="book/[service]" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="trip/[id]" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="work/[id]" options={{ animation: 'fade', gestureEnabled: false }} />
      </Stack>
      {state.role === 'provider' && (
        <PaletteProvider palette={providerPalette}>
          <NotificationBanner />
        </PaletteProvider>
      )}
      {showLoader && <LaunchLoader onDone={hideLoader} />}
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StoreProvider>
          {Platform.OS === 'web' ? (
            // On desktop browsers, present the app inside a phone-sized frame.
            <View style={styles.webBackdrop}>
              <View style={styles.webFrame}>
                <Shell />
              </View>
            </View>
          ) : (
            <Shell />
          )}
        </StoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  webBackdrop: { flex: 1, backgroundColor: '#0E1A14', alignItems: 'center' },
  webFrame: { flex: 1, width: '100%', maxWidth: 440, overflow: 'hidden', backgroundColor: '#F6F7F5' },
});
