import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { PaletteProvider } from '@/components/ui';
import { useStore } from '@/lib/store';
import { providerPalette as p } from '@/lib/theme';

export default function ProviderTabs() {
  const { state } = useStore();
  if (state.providerProfile?.status !== 'approved') return <Redirect href="/" />;

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
          options={{ title: 'Work', tabBarIcon: ({ color, size }) => <Ionicons name="flash" color={color as string} size={size} /> }}
        />
        <Tabs.Screen
          name="jobs"
          options={{ title: 'Jobs', tabBarIcon: ({ color, size }) => <Ionicons name="briefcase-outline" color={color as string} size={size} /> }}
        />
        <Tabs.Screen
          name="earnings"
          options={{ title: 'Earnings', tabBarIcon: ({ color, size }) => <Ionicons name="wallet-outline" color={color as string} size={size} /> }}
        />
        <Tabs.Screen
          name="account"
          options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" color={color as string} size={size} /> }}
        />
      </Tabs>
    </PaletteProvider>
  );
}
