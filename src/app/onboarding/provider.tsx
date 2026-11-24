import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { Field, FormScreen } from '@/components/form-screen';
import { Button, Card, Chip, DemoNote, PaletteProvider, Row, T, tap, usePalette } from '@/components/ui';
import { getService, launchLocations, type LaunchState, services } from '@/lib/catalog';
import { type DocKey, useStore } from '@/lib/store';
import { formatNaira, providerPalette, radius } from '@/lib/theme';

const availabilityOptions = ['Weekday mornings', 'Weekday afternoons', 'Evenings', 'Weekends', 'Live-in'];

const docList: { key: DocKey; title: string; body: string; icon: 'card-outline' | 'camera-outline' | 'document-text-outline' | 'people-outline' }[] = [
  { key: 'id', title: 'Government ID', body: 'NIN slip, voter’s card, or passport', icon: 'card-outline' },
  { key: 'selfie', title: 'Selfie check', body: 'A clear photo to match your ID', icon: 'camera-outline' },
  { key: 'address', title: 'Proof of address', body: 'Utility bill or tenancy letter', icon: 'document-text-outline' },
  { key: 'reference', title: 'Two references', body: 'Past employers or community leaders', icon: 'people-outline' },
];

const TOTAL = 6;

export default function ProviderOnboarding() {
  return (
    <PaletteProvider palette={providerPalette}>
      <Wizard />
    </PaletteProvider>
  );
}

function Wizard() {
  const p = usePalette();
  const { state, dispatch } = useStore();
  const homeState = (state.profile?.state as LaunchState) ?? 'Lagos';

  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>(state.profile?.area ? [state.profile.area] : []);
  const [rate, setRate] = useState<number | null>(null);
  const [availability, setAvailability] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [docs, setDocs] = useState<Record<DocKey, boolean>>({ id: false, selfie: false, address: false, reference: false });
  const [uploading, setUploading] = useState<DocKey | null>(null);
  const [agreed, setAgreed] = useState(false);

  const suggested = picked.length ? Math.max(...picked.map((id) => getService(id).hourlyRate)) : 2500;
  const hourly = rate ?? suggested;

  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const back = () => (step === 0 ? (router.canGoBack() ? router.back() : switchToClient()) : setStep(step - 1));

  const switchToClient = () => {
    dispatch({ type: 'setRole', role: 'client' });
    router.replace('/');
  };

  const upload = (key: DocKey) => {
    if (docs[key] || uploading) return;
    setUploading(key);
    setTimeout(() => {
      tap('success');
      setDocs((d) => ({ ...d, [key]: true }));
      setUploading(null);
    }, 1100);
  };

  const submit = () => {
    dispatch({
      type: 'submitProvider',
      providerProfile: {
        services: picked,
        areas,
        hourlyRate: hourly,
        availability,
        bio: bio.trim(),
        docs,
        status: 'review',
        submittedAt: Date.now(),
      },
    });
    router.replace('/onboarding/review');
  };

  const steps = [
    {
      title: 'What services do you offer?',
      subtitle: 'Pick everything you’re confident doing. You’ll only get requests for these.',
      valid: picked.length > 0,
      body: (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {services.map((s) => {
            const on = picked.includes(s.id);
            return (
              <Pressable
                key={s.id}
                onPress={() => {
                  tap();
                  toggle(picked, setPicked, s.id);
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
                  <Ionicons name={s.icon} size={24} color={on ? p.accent : p.text} />
                  {on && <Ionicons name="checkmark-circle" size={20} color={p.accent} />}
                </Row>
                <T variant="label">{s.label}</T>
              </Pressable>
            );
          })}
        </View>
      ),
    },
    {
      title: 'Where can you work?',
      subtitle: `Choose areas in ${homeState} you can reach easily. Shorter trips mean more jobs.`,
      valid: areas.length > 0,
      body: (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {launchLocations[homeState].map((a) => (
            <Chip key={a} label={a} selected={areas.includes(a)} onPress={() => toggle(areas, setAreas, a)} />
          ))}
        </View>
      ),
    },
    {
      title: 'Set your rate & hours',
      subtitle: 'Clients see your hourly rate. StaffConnect keeps 10% of every payment.',
      valid: availability.length > 0,
      body: (
        <>
          <Card style={{ alignItems: 'center', gap: 10 }}>
            <T variant="overline" muted>
              Hourly rate
            </T>
            <Row gap={20}>
              <RoundBtn icon="remove" onPress={() => setRate(Math.max(1000, hourly - 250))} />
              <T variant="display">{formatNaira(hourly)}</T>
              <RoundBtn icon="add" onPress={() => setRate(hourly + 250)} />
            </Row>
            <T variant="caption" muted>
              You take home {formatNaira(hourly * 0.9)}/hr after the 10% fee · Suggested {formatNaira(suggested)}
            </T>
          </Card>
          <View style={{ gap: 10 }}>
            <T variant="caption" muted>
              When are you usually available?
            </T>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {availabilityOptions.map((a) => (
                <Chip key={a} label={a} selected={availability.includes(a)} onPress={() => toggle(availability, setAvailability, a)} />
              ))}
            </View>
          </View>
        </>
      ),
    },
    {
      title: 'Introduce yourself',
      subtitle: 'A short, friendly note helps clients choose you. Mention experience and what you enjoy.',
      valid: bio.trim().length >= 20,
      body: (
        <>
          <Field
            label="About you"
            value={bio}
            onChangeText={setBio}
            multiline
            maxLength={280}
            placeholder="e.g. I have 4 years of experience keeping busy family homes tidy, and I love cooking Nigerian dishes."
          />
          <T variant="caption" muted>
            {bio.trim().length < 20 ? `${20 - bio.trim().length} more characters needed` : `${bio.length}/280`}
          </T>
        </>
      ),
    },
    {
      title: 'Verify your identity',
      subtitle: 'Verification keeps clients and professionals safe. Your documents are never shown to clients.',
      valid: Object.values(docs).every(Boolean),
      body: (
        <>
          {docList.map((d) => {
            const done = docs[d.key];
            return (
              <Pressable key={d.key} onPress={() => upload(d.key)}>
                <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14, borderColor: done ? p.success : p.border }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: done ? 'rgba(52,211,153,0.15)' : p.surfaceAlt,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Ionicons name={d.icon} size={22} color={done ? p.success : p.text} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <T variant="label">{d.title}</T>
                    <T variant="caption" muted>
                      {done ? 'Uploaded' : d.body}
                    </T>
                  </View>
                  {uploading === d.key ? (
                    <ActivityIndicator color={p.accent} />
                  ) : (
                    <Ionicons name={done ? 'checkmark-circle' : 'cloud-upload-outline'} size={24} color={done ? p.success : p.accent} />
                  )}
                </Card>
              </Pressable>
            );
          })}
          <DemoNote>Demo: tapping an item simulates an upload. No files leave your device.</DemoNote>
        </>
      ),
    },
    {
      title: 'Review & submit',
      subtitle: 'Check your details. We’ll review your application before you can go online.',
      valid: agreed,
      body: (
        <>
          <Card style={{ gap: 12 }}>
            <Summary label="Name" value={state.profile?.name ?? ''} />
            <Summary label="Services" value={picked.map((id) => getService(id).short).join(', ')} />
            <Summary label="Areas" value={areas.join(', ')} />
            <Summary label="Rate" value={`${formatNaira(hourly)}/hr`} />
            <Summary label="Availability" value={availability.join(', ')} />
            <Summary label="Documents" value="4 of 4 uploaded" />
          </Card>
          <Pressable onPress={() => setAgreed(!agreed)}>
            <Row gap={12} style={{ alignItems: 'flex-start' }}>
              <Ionicons name={agreed ? 'checkbox' : 'square-outline'} size={24} color={agreed ? p.accent : p.textMuted} />
              <T style={{ flex: 1 }}>
                I agree to the StaffConnect professional code of conduct: arrive on time, respect clients’ homes, and
                report any safety concern.
              </T>
            </Row>
          </Pressable>
        </>
      ),
    },
  ];

  const current = steps[step];

  return (
    <FormScreen
      title={current.title}
      subtitle={current.subtitle}
      step={step}
      total={TOTAL}
      onBack={back}
      footer={
        <Button
          label={step === TOTAL - 1 ? 'Submit application' : 'Continue'}
          disabled={!current.valid}
          onPress={() => (step === TOTAL - 1 ? submit() : setStep(step + 1))}
        />
      }>
      <T variant="overline" color={p.accent}>
        Step {step + 1} of {TOTAL}
      </T>
      {current.body}
    </FormScreen>
  );
}

function RoundBtn({ icon, onPress }: { icon: 'add' | 'remove'; onPress: () => void }) {
  const p = usePalette();
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress();
      }}
      style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: p.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={icon} size={22} color={p.text} />
    </Pressable>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <T muted variant="caption">
        {label}
      </T>
      <T variant="label" style={{ flex: 1, textAlign: 'right' }}>
        {value}
      </T>
    </Row>
  );
}
