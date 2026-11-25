import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Field, FormScreen } from '@/components/form-screen';
import { Button, Chip, PaletteProvider, T } from '@/components/ui';
import { launchLocations, launchStates, type LaunchState } from '@/lib/catalog';
import { useStore } from '@/lib/store';
import { clientPalette, providerPalette } from '@/lib/theme';

export default function DetailsScreen() {
  const { role, phone } = useLocalSearchParams<{ role: string; phone: string }>();
  const isProvider = role === 'provider';
  const { state, dispatch } = useStore();
  const [name, setName] = useState(state.profile?.name ?? '');
  const [st, setSt] = useState<LaunchState>((state.profile?.state as LaunchState) ?? 'Lagos');
  const [area, setArea] = useState(state.profile?.area ?? '');

  const valid = name.trim().length >= 2 && !!area;

  const finish = () => {
    dispatch({ type: 'setProfile', profile: { name: name.trim(), phone: phone ?? '', state: st, area } });
    dispatch({ type: 'setRole', role: isProvider ? 'provider' : 'client' });
    if (router.canDismiss()) router.dismissAll();
    router.replace(isProvider ? '/onboarding/provider' : '/onboarding/needs');
  };

  return (
    <PaletteProvider palette={isProvider ? providerPalette : clientPalette}>
      <FormScreen
        title={isProvider ? 'Tell clients who you are' : 'Nice to meet you'}
        subtitle={
          isProvider
            ? 'Use your real first and last name. Clients see your first name and initial.'
            : 'We use your area to find help close to you.'
        }
        step={3}
        total={5}
        footer={<Button label="Continue" disabled={!valid} onPress={finish} />}>
        <Field label="Full name" value={name} onChangeText={setName} placeholder="e.g. Ada Obi" autoFocus autoCapitalize="words" />
        <View style={{ gap: 10 }}>
          <T variant="caption" muted>
            State
          </T>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {launchStates.map((s) => (
              <Chip
                key={s}
                label={s}
                selected={st === s}
                onPress={() => {
                  setSt(s);
                  setArea('');
                }}
              />
            ))}
          </View>
        </View>
        <View style={{ gap: 10 }}>
          <T variant="caption" muted>
            {isProvider ? 'Where you live' : 'Your area'}
          </T>
          <T variant="caption" muted>
            We’re starting in these areas of Lagos and Oyo, with more on the way.
          </T>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {launchLocations[st].map((a) => (
              <Chip key={a} label={a} selected={area === a} onPress={() => setArea(a)} icon="location-outline" />
            ))}
          </View>
        </View>
      </FormScreen>
    </PaletteProvider>
  );
}
