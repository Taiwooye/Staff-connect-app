import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { FormScreen } from '@/components/form-screen';
import { Button, PaletteProvider, Row, T, tap } from '@/components/ui';
import { services } from '@/lib/catalog';
import { type Frequency, frequencies } from '@/lib/matching';
import { useStore } from '@/lib/store';
import { clientPalette as p, radius } from '@/lib/theme';

export default function NeedsScreen() {
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const { state, dispatch } = useStore();
  const [picked, setPicked] = useState<string[]>(state.clientPrefs?.services ?? []);
  const [frequency, setFrequency] = useState<Frequency | null>(state.clientPrefs?.frequency ?? null);

  const save = () => {
    if (!frequency) return;
    tap('success');
    dispatch({ type: 'setClientPrefs', prefs: { services: picked, frequency } });
    if (edit) router.back();
    else router.replace('/matches');
  };

  return (
    <PaletteProvider palette={p}>
      <FormScreen
        title="What help are you looking for?"
        subtitle="We’ll suggest professionals near you who match. You can still book any service later."
        step={edit ? undefined : 4}
        total={edit ? undefined : 5}
        onBack={edit ? undefined : () => router.replace('/client')}
        footer={
          <Button
            label={edit ? 'Save preferences' : 'Show my matches'}
            icon={edit ? undefined : 'sparkles'}
            disabled={!picked.length || !frequency}
            onPress={save}
          />
        }>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {services.map((s) => {
            const on = picked.includes(s.id);
            return (
              <Pressable
                key={s.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                onPress={() => {
                  tap();
                  setPicked(on ? picked.filter((x) => x !== s.id) : [...picked, s.id]);
                }}
                style={{
                  width: '47.5%',
                  padding: 14,
                  gap: 10,
                  borderRadius: radius.md,
                  borderWidth: 2,
                  borderColor: on ? p.accent : p.border,
                  backgroundColor: on ? p.accentSoft : p.surface,
                }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: s.tint, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name={s.icon} size={22} color={p.text} />
                  </View>
                  {on && <Ionicons name="checkmark-circle" size={22} color={p.accent} />}
                </Row>
                <T variant="label">{s.label}</T>
              </Pressable>
            );
          })}
        </View>

        <View style={{ gap: 10 }}>
          <T variant="heading">How often?</T>
          {frequencies.map((f) => {
            const on = frequency === f.id;
            return (
              <Pressable
                key={f.id}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                onPress={() => {
                  tap();
                  setFrequency(f.id);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  padding: 14,
                  borderRadius: radius.md,
                  borderWidth: 2,
                  borderColor: on ? p.accent : p.border,
                  backgroundColor: p.surface,
                }}>
                <Ionicons name={on ? 'radio-button-on' : 'radio-button-off'} size={22} color={on ? p.accent : p.textMuted} />
                <View style={{ flex: 1 }}>
                  <T variant="label">{f.label}</T>
                  <T variant="caption" muted>
                    {f.hint}
                  </T>
                </View>
              </Pressable>
            );
          })}
        </View>
      </FormScreen>
    </PaletteProvider>
  );
}
