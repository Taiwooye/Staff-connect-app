import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { FormScreen } from '@/components/form-screen';
import { Button, Row, T, tap } from '@/components/ui';
import type { IconName } from '@/lib/catalog';
import { clientPalette, providerPalette, radius } from '@/lib/theme';
import type { Role } from '@/lib/store';

const options: {
  role: Role;
  title: string;
  body: string;
  icon: IconName;
  bullets: string[];
  dark: boolean;
}[] = [
  {
    role: 'client',
    title: 'I need help',
    body: 'Book trusted home and business help near you.',
    icon: 'home-outline',
    bullets: ['Request in under a minute', 'Track your pro live', 'Rate & rebook favourites'],
    dark: false,
  },
  {
    role: 'provider',
    title: 'I want to work',
    body: 'Get job requests from clients nearby.',
    icon: 'briefcase-outline',
    bullets: ['Go online when you choose', 'Accept jobs that fit you', 'Track daily earnings'],
    dark: true,
  },
];

export default function RolePicker() {
  const [role, setRole] = useState<Role | null>(null);

  return (
    <FormScreen
      title="How will you use StaffConnect?"
      subtitle="Each side has its own app experience. You can switch later from your account."
      step={0}
      total={4}
      footer={
        <Button
          label={role === 'provider' ? 'Continue as a professional' : role === 'client' ? 'Continue as a client' : 'Choose one'}
          disabled={!role}
          onPress={() => role && router.push({ pathname: '/onboarding/phone', params: { role } })}
        />
      }>
      {options.map((o) => {
        const selected = role === o.role;
        const pal = o.dark ? providerPalette : clientPalette;
        return (
          <Pressable
            key={o.role}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => {
              tap('medium');
              setRole(o.role);
            }}
            style={({ pressed }) => ({
              backgroundColor: pal.surface,
              borderRadius: radius.lg,
              borderWidth: 2,
              borderColor: selected ? pal.accent : o.dark ? pal.surface : clientPalette.border,
              padding: 20,
              gap: 14,
              transform: [{ scale: pressed ? 0.99 : 1 }],
            })}>
            <Row style={{ justifyContent: 'space-between' }}>
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  backgroundColor: pal.accentSoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Ionicons name={o.icon} size={26} color={pal.accent} />
              </View>
              <Ionicons
                name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                size={26}
                color={selected ? pal.accent : pal.textMuted}
              />
            </Row>
            <View style={{ gap: 4 }}>
              <T variant="heading" color={pal.text}>
                {o.title}
              </T>
              <T color={pal.textMuted}>{o.body}</T>
            </View>
            <View style={{ gap: 8 }}>
              {o.bullets.map((b) => (
                <Row key={b} gap={8}>
                  <Ionicons name="checkmark" size={16} color={pal.accent} />
                  <T variant="caption" color={pal.text}>
                    {b}
                  </T>
                </Row>
              ))}
            </View>
          </Pressable>
        );
      })}
    </FormScreen>
  );
}
