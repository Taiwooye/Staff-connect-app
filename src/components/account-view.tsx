import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { IconName } from '@/lib/catalog';
import { useStore } from '@/lib/store';
import { clientPalette, providerPalette, radius } from '@/lib/theme';

import { useToast } from './toast';
import { Avatar, Card, Row, T, tap, usePalette } from './ui';

export function AccountView({ mode, children }: { mode: 'client' | 'provider'; children?: ReactNode }) {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { state, dispatch } = useStore();
  const profile = state.profile;
  const initials = (profile?.name ?? '?')
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const switchTo = (role: 'client' | 'provider') => {
    tap('medium');
    dispatch({ type: 'setRole', role });
    router.replace('/');
  };

  const items: { icon: IconName; label: string; msg: string }[] =
    mode === 'client'
      ? [
          { icon: 'wallet-outline', label: 'Payment methods', msg: 'Payments are recorded only in this demo.' },
          { icon: 'shield-checkmark-outline', label: 'Safety toolkit', msg: 'Trusted contacts & emergency help (demo).' },
          { icon: 'help-circle-outline', label: 'Help & support', msg: 'Support inbox is not connected in the demo.' },
        ]
      : [
          { icon: 'document-text-outline', label: 'Documents', msg: 'All 4 documents approved (demo).' },
          { icon: 'card-outline', label: 'Payout account', msg: 'Add a bank account for payouts (demo).' },
          { icon: 'help-circle-outline', label: 'Pro support', msg: 'Support inbox is not connected in the demo.' },
        ];

  const other = mode === 'client' ? providerPalette : clientPalette;

  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16, gap: 16, paddingBottom: 40 }}>
        <Row>
          <Avatar initials={initials} color={p.accent} size={64} />
          <View style={{ flex: 1 }}>
            <T variant="title">{profile?.name}</T>
            <T muted>
              {profile?.phone} · {profile?.area}, {profile?.state}
            </T>
          </View>
        </Row>

        {children}

        <Card style={{ padding: 0 }}>
          {items.map((it, i) => (
            <Pressable
              key={it.label}
              onPress={() => toast.show(it.msg)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                padding: 16,
                borderTopWidth: i ? 1 : 0,
                borderTopColor: p.border,
                opacity: pressed ? 0.6 : 1,
              })}>
              <Ionicons name={it.icon} size={22} color={p.text} />
              <T variant="label" style={{ flex: 1 }}>
                {it.label}
              </T>
              <Ionicons name="chevron-forward" size={18} color={p.textMuted} />
            </Pressable>
          ))}
        </Card>

        <Pressable onPress={() => switchTo(mode === 'client' ? 'provider' : 'client')}>
          <View style={{ backgroundColor: other.surface, borderRadius: radius.lg, padding: 18, gap: 8, borderWidth: 1, borderColor: other.border }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Ionicons name={mode === 'client' ? 'briefcase' : 'home'} size={26} color={other.accent} />
              <Ionicons name="arrow-forward" size={22} color={other.text} />
            </Row>
            <T variant="heading" color={other.text}>
              {mode === 'client' ? 'Earn with StaffConnect' : 'Switch to booking help'}
            </T>
            <T color={other.textMuted}>
              {mode === 'client'
                ? state.providerProfile
                  ? 'Open your professional app.'
                  : 'Offer your skills and get jobs nearby. Takes about 5 minutes to apply.'
                : 'Need help at home? Open the client app.'}
            </T>
          </View>
        </Pressable>

        <Pressable
          onPress={() => {
            dispatch({ type: 'reset' });
            router.replace('/welcome');
          }}
          style={{ alignItems: 'center', padding: 12 }}>
          <T variant="label" color={p.danger}>
            Sign out & reset demo
          </T>
        </Pressable>
        <T variant="caption" muted style={{ textAlign: 'center' }}>
          StaffConnect mobile prototype · All profiles and jobs are fictional and stay on this device.
        </T>
      </ScrollView>
      {toast.node}
    </View>
  );
}
