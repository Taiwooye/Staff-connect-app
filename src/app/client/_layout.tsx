import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { PaletteProvider } from '@/components/ui';
import { useStore } from '@/lib/store';
import { clientPalette as p } from '@/lib/theme';

export default function ClientTabs() {
  const { state } = useStore();
  if (!state.profile) return <Redirect href="/welcome" />;

  return (
    <PaletteProvider palette={p}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: p.accent,
          tabBarInactiveTintColor: p.textMuted,
          tabBarStyle: { backgroundColor: p.surface, borderTopColor: p.border, height: 64, paddingTop: 6 },
          tabBarLabelStyle: { fontWeight: '600', fontSize: 11 },
          sceneStyle: { backgroundColor: p.bg },
        }}>
        <Tabs.Screen
          name="index"
          options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color as string} size={size} /> }}
        />
        <Tabs.Screen
          name="activity"
          options={{ title: 'Bookings', tabBarIcon: ({ color, size }) => <Ionicons name="receipt-outline" color={color as string} size={size} /> }}
        />
        <Tabs.Screen
          name="account"
          options={{ title: 'Account', tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" color={color as string} size={size} /> }}
        />
      </Tabs>
    </PaletteProvider>
  );
}
