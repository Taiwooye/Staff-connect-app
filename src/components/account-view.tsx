import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { IconName } from '@/lib/catalog';
import { useStore } from '@/lib/store';
import { clientPalette, initialsOf, providerPalette, radius } from '@/lib/theme';

import { useToast } from './toast';
import { Avatar, Card, Row, T, tap, usePalette } from './ui';

export function AccountView({ mode, children }: { mode: 'client' | 'provider'; children?: ReactNode }) {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { state, dispatch } = useStore();
  const profile = state.profile;
  const initials = initialsOf(profile?.name ?? '');
  const bank = state.bankAccount;

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
          { icon: 'help-circle-outline', label: 'Pro support', msg: 'Support inbox is not connected in the demo.' },
        ];

  const other = mode === 'client' ? providerPalette : clientPalette;

  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16, gap: 16, paddingBottom: 40 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Edit profile" onPress={() => router.push('/account/edit')}>
          <Row>
            <View>
              <Avatar initials={initials} color={p.accent} size={72} photo={profile?.photo} />
              <View
                style={{
                  position: 'absolute',
                  right: -2,
                  bottom: -2,
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: p.text,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: p.bg,
                }}>
                <Ionicons name="camera" size={13} color={p.bg} />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <T variant="title">{profile?.name}</T>
              <T muted>
                {profile?.phone} · {profile?.area}, {profile?.state}
              </T>
              <T variant="label" color={p.accent}>
                {profile?.photo ? 'Edit profile' : 'Add a photo & edit profile'}
              </T>
            </View>
          </Row>
        </Pressable>

        {children}

        <Card style={{ padding: 0 }}>
          <MenuRow icon="person-outline" label="Edit profile" detail="Photo, name, phone, area" onPress={() => router.push('/account/edit')} />
          <MenuRow
            icon="card-outline"
            label={bank ? 'Bank account' : 'Add bank account'}
            detail={bank ? `${bank.bank} ····${bank.accountNumber.slice(-4)}` : mode === 'provider' ? 'Needed to get paid' : 'For refunds and transfers'}
            onPress={() => router.push('/account/bank')}
            highlight={!bank && mode === 'provider'}
            first={false}
          />
        </Card>

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
        <Pressable onPress={() => router.push('/admin')} style={{ alignItems: 'center', padding: 6 }}>
          <T variant="caption" color={p.accent}>
            StaffConnect revenue (admin demo)
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

function MenuRow({
  icon,
  label,
  detail,
  onPress,
  highlight,
  first = true,
}: {
  icon: IconName;
  label: string;
  detail: string;
  onPress: () => void;
  highlight?: boolean;
  first?: boolean;
}) {
  const p = usePalette();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        padding: 16,
        borderTopWidth: first ? 0 : 1,
        borderTopColor: p.border,
        opacity: pressed ? 0.6 : 1,
      })}>
      <Ionicons name={icon} size={22} color={highlight ? p.accent : p.text} />
      <View style={{ flex: 1 }}>
        <T variant="label">{label}</T>
        <T variant="caption" color={highlight ? p.accent : p.textMuted}>
          {detail}
        </T>
      </View>
      <Ionicons name="chevron-forward" size={18} color={p.textMuted} />
    </Pressable>
  );
}
