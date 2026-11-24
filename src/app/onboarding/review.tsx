import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, DemoNote, PaletteProvider, Row, T } from '@/components/ui';
import { useNow, useStore } from '@/lib/store';
import { providerPalette as p } from '@/lib/theme';

const checks = [
  { title: 'Application received', at: 0 },
  { title: 'Identity documents checked', at: 2000 },
  { title: 'References contacted', at: 4000 },
  { title: 'Account approved', at: 6000 },
];

export default function ReviewScreen() {
  const insets = useSafeAreaInsets();
  const { state, dispatch } = useStore();
  const now = useNow(500);
  const pp = state.providerProfile;
  if (!pp) return <Redirect href="/onboarding/provider" />;

  const elapsed = pp.status === 'approved' ? Infinity : now - pp.submittedAt;
  const approved = pp.status === 'approved';

  return (
    <PaletteProvider palette={p}>
      <View style={{ flex: 1, backgroundColor: p.bg, paddingTop: insets.top + 40, paddingHorizontal: 24, paddingBottom: insets.bottom + 20 }}>
        <View style={{ flex: 1, gap: 28 }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 24,
              backgroundColor: approved ? 'rgba(52,211,153,0.15)' : p.accentSoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Ionicons name={approved ? 'shield-checkmark' : 'hourglass-outline'} size={36} color={approved ? p.success : p.accent} />
          </View>
          <View style={{ gap: 8 }}>
            <T variant="display">{approved ? `You're approved,\n${state.profile?.name.split(' ')[0]}!` : 'We’re reviewing\nyour application'}</T>
            <T muted>
              {approved
                ? 'Go online whenever you’re ready. Job requests near your areas will come straight to you.'
                : 'This usually takes 1–2 business days. We’ll send you a text as soon as you’re approved.'}
            </T>
          </View>
          <View style={{ gap: 18 }}>
            {checks.map((c, i) => {
              const isLast = i === checks.length - 1;
              const done = approved || (!isLast && elapsed >= c.at + 2000);
              const active = !done && elapsed >= c.at;
              return (
                <Row key={c.title} gap={14}>
                  <View style={{ width: 28, alignItems: 'center' }}>
                    {done ? (
                      <Ionicons name="checkmark-circle" size={26} color={p.success} />
                    ) : active ? (
                      <ActivityIndicator color={p.accent} />
                    ) : (
                      <Ionicons name="ellipse-outline" size={24} color={p.border} />
                    )}
                  </View>
                  <T variant="label" color={done || active ? p.text : p.textMuted}>
                    {c.title}
                  </T>
                </Row>
              );
            })}
          </View>
        </View>
        <View style={{ gap: 12 }}>
          {!approved && <DemoNote>Demo: review is sped up and approves automatically in a few seconds.</DemoNote>}
          <Button
            label={approved ? 'Start earning' : 'Waiting for approval…'}
            disabled={!approved}
            icon={approved ? 'flash' : undefined}
            onPress={() => router.replace('/provider')}
          />
          <Button
            label="Book help instead"
            variant="ghost"
            size="md"
            onPress={() => {
              dispatch({ type: 'setRole', role: 'client' });
              router.replace('/client');
            }}
          />
        </View>
      </View>
    </PaletteProvider>
  );
}
