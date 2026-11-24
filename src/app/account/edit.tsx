import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';

import { Field, FormScreen } from '@/components/form-screen';
import { useToast } from '@/components/toast';
import { Avatar, Button, Card, Chip, PaletteProvider, Row, T, tap, usePalette } from '@/components/ui';
import { launchLocations, launchStates, type LaunchState, scheduleOptions, services } from '@/lib/catalog';
import { pickProfilePhoto } from '@/lib/photo';
import { useStore } from '@/lib/store';
import { clientPalette, formatNaira, initialsOf, providerPalette } from '@/lib/theme';

export default function EditProfileScreen() {
  const { state } = useStore();
  return (
    <PaletteProvider palette={state.role === 'provider' ? providerPalette : clientPalette}>
      <EditProfile />
    </PaletteProvider>
  );
}

function EditProfile() {
  const p = usePalette();
  const toast = useToast();
  const { state, dispatch } = useStore();
  const profile = state.profile!;
  const pp = state.role === 'provider' ? state.providerProfile : undefined;

  const [photo, setPhoto] = useState(profile.photo);
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone.replace(/^\+234/, ''));
  const [st, setSt] = useState<LaunchState>((profile.state as LaunchState) ?? 'Lagos');
  const [area, setArea] = useState(profile.area);
  const [picked, setPicked] = useState(pp?.services ?? []);
  const [areas, setAreas] = useState(pp?.areas ?? []);
  const [rate, setRate] = useState(pp?.hourlyRate ?? 2500);
  const [availability, setAvailability] = useState(pp?.availability ?? []);
  const [bio, setBio] = useState(pp?.bio ?? '');
  const [busy, setBusy] = useState(false);

  const digits = phone.replace(/\D/g, '').replace(/^0/, '');
  const errors = [
    name.trim().length < 2 && 'Enter your full name.',
    digits.length !== 10 && 'Enter a 10-digit phone number.',
    !area && 'Choose your area.',
    pp && !picked.length && 'Choose at least one service.',
    pp && !areas.length && 'Choose at least one work area.',
  ].filter(Boolean) as string[];

  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const choosePhoto = async (source: 'library' | 'camera') => {
    setBusy(true);
    const result = await pickProfilePhoto(source);
    setBusy(false);
    if (!result) return;
    if ('error' in result) toast.show(result.error);
    else {
      tap('success');
      setPhoto(result.uri);
    }
  };

  const save = () => {
    dispatch({ type: 'updateProfile', patch: { name: name.trim(), phone: `+234${digits}`, state: st, area, photo } });
    if (pp) {
      dispatch({ type: 'updateProviderProfile', patch: { services: picked, areas, hourlyRate: rate, availability, bio: bio.trim() } });
    }
    tap('success');
    router.back();
  };

  return (
    <>
      <FormScreen
        title="Edit profile"
        subtitle={pp ? 'Clients see your photo, first name, services and rate.' : 'Pros see your first name and photo once you book.'}
        footer={
          <>
            <Button label="Save changes" disabled={errors.length > 0} onPress={save} />
            {errors.length > 0 && (
              <T variant="caption" color={p.danger}>
                {errors[0]}
              </T>
            )}
          </>
        }>
        <View style={{ alignItems: 'center', gap: 12 }}>
          <Pressable accessibilityRole="button" accessibilityLabel="Change profile photo" onPress={() => choosePhoto('library')}>
            <Avatar initials={initialsOf(name)} color={p.accent} size={104} photo={photo} />
            <View
              style={{
                position: 'absolute',
                right: 0,
                bottom: 0,
                width: 34,
                height: 34,
                borderRadius: 17,
                backgroundColor: p.text,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 3,
                borderColor: p.bg,
              }}>
              <Ionicons name="camera" size={16} color={p.bg} />
            </View>
          </Pressable>
          <Row gap={8} style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button label={photo ? 'Change photo' : 'Upload photo'} icon="image-outline" size="md" variant="secondary" loading={busy} onPress={() => choosePhoto('library')} />
            {Platform.OS !== 'web' && <Button label="Take photo" icon="camera-outline" size="md" variant="secondary" onPress={() => choosePhoto('camera')} />}
            {photo && <Button label="Remove" size="md" variant="ghost" onPress={() => setPhoto(undefined)} />}
          </Row>
          <T variant="caption" muted>
            JPEG or PNG. A clear, friendly face photo builds trust.
          </T>
        </View>

        <Field label="Full name" value={name} onChangeText={setName} autoCapitalize="words" />
        <Field label="Phone number (+234)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={13} />

        <View style={{ gap: 10 }}>
          <T variant="caption" muted>
            State
          </T>
          <Row gap={8}>
            {launchStates.map((s) => (
              <Chip
                key={s}
                label={s}
                selected={st === s}
                onPress={() => {
                  setSt(s);
                  setArea('');
                  setAreas([]);
                }}
              />
            ))}
          </Row>
          <T variant="caption" muted>
            {pp ? 'Where you live' : 'Your area'}
          </T>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {launchLocations[st].map((a) => (
              <Chip key={a} label={a} selected={area === a} onPress={() => setArea(a)} />
            ))}
          </View>
        </View>

        {pp && (
          <>
            <T variant="heading">Work details</T>
            <View style={{ gap: 10 }}>
              <T variant="caption" muted>
                Services you offer
              </T>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {services.map((s) => (
                  <Chip key={s.id} label={s.short} icon={s.icon} selected={picked.includes(s.id)} onPress={() => toggle(picked, setPicked, s.id)} />
                ))}
              </View>
            </View>
            <View style={{ gap: 10 }}>
              <T variant="caption" muted>
                Areas you work in
              </T>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {launchLocations[st].map((a) => (
                  <Chip key={a} label={a} selected={areas.includes(a)} onPress={() => toggle(areas, setAreas, a)} />
                ))}
              </View>
            </View>
            <Card style={{ alignItems: 'center', gap: 8 }}>
              <T variant="overline" muted>
                Hourly rate
              </T>
              <Row gap={20}>
                <Step icon="remove" onPress={() => setRate(Math.max(1000, rate - 250))} />
                <T variant="title">{formatNaira(rate)}</T>
                <Step icon="add" onPress={() => setRate(rate + 250)} />
              </Row>
            </Card>
            <View style={{ gap: 10 }}>
              <T variant="caption" muted>
                Availability
              </T>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {scheduleOptions.map((a) => (
                  <Chip key={a} label={a} selected={availability.includes(a)} onPress={() => toggle(availability, setAvailability, a)} />
                ))}
              </View>
            </View>
            <Field label="About you" value={bio} onChangeText={setBio} multiline maxLength={280} />
          </>
        )}
      </FormScreen>
      {toast.node}
    </>
  );
}

function Step({ icon, onPress }: { icon: 'add' | 'remove'; onPress: () => void }) {
  const p = usePalette();
  return (
    <Pressable
      accessibilityLabel={icon === 'add' ? 'Increase rate' : 'Decrease rate'}
      onPress={() => {
        tap();
        onPress();
      }}
      style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: p.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={icon} size={22} color={p.text} />
    </Pressable>
  );
}

