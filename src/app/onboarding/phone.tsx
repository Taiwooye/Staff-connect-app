import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, TextInput, type TextInputInstance, View } from 'react-native';

import { FormScreen } from '@/components/form-screen';
import { Button, DemoNote, PaletteProvider, Row, T, tap, usePalette } from '@/components/ui';
import { clientPalette, providerPalette, radius } from '@/lib/theme';

const DEMO_CODE = '1234';

export default function PhoneScreen() {
  const { role } = useLocalSearchParams<{ role: string }>();
  return (
    <PaletteProvider palette={role === 'provider' ? providerPalette : clientPalette}>
      <PhoneFlow role={role === 'provider' ? 'provider' : 'client'} />
    </PaletteProvider>
  );
}

function PhoneFlow({ role }: { role: 'client' | 'provider' }) {
  const p = usePalette();
  const [stage, setStage] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [resendIn, setResendIn] = useState(30);
  const codeInput = useRef<TextInputInstance>(null);

  const digits = phone.replace(/\D/g, '').replace(/^0/, '');
  const phoneValid = digits.length === 10;

  useEffect(() => {
    if (stage !== 'code') return;
    const t = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [stage]);

  const verify = (value: string) => {
    if (value.length < 4) return;
    if (value === DEMO_CODE) {
      tap('success');
      router.push({ pathname: '/onboarding/details', params: { role, phone: `+234${digits}` } });
    } else {
      tap('heavy');
      setError('That code is not right. Try 1234 in the demo.');
      setCode('');
    }
  };

  if (stage === 'phone') {
    return (
      <FormScreen
        title="What's your phone number?"
        subtitle="We'll text a code to confirm it's you. Your number is only shared with someone once a job is confirmed."
        step={1}
        total={4}
        footer={
          <Button
            label="Send code"
            disabled={!phoneValid}
            onPress={() => {
              setStage('code');
              setResendIn(30);
              setTimeout(() => codeInput.current?.focus(), 300);
            }}
          />
        }>
        <Row
          gap={0}
          style={{
            borderWidth: 1,
            borderColor: p.border,
            backgroundColor: p.surface,
            borderRadius: radius.md,
            height: 60,
            overflow: 'hidden',
          }}>
          <View style={{ paddingHorizontal: 16, height: '100%', justifyContent: 'center', backgroundColor: p.surfaceAlt }}>
            <T variant="label">🇳🇬 +234</T>
          </View>
          <TextInput
            autoFocus
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="801 234 5678"
            placeholderTextColor={p.textMuted}
            maxLength={13}
            style={{ flex: 1, height: '100%', paddingHorizontal: 16, fontSize: 20, fontWeight: '600', color: p.text, letterSpacing: 1 }}
          />
        </Row>
        <DemoNote>Demo app: no SMS is sent. Any 10-digit number works.</DemoNote>
      </FormScreen>
    );
  }

  return (
    <FormScreen
      title="Enter the 4-digit code"
      subtitle={`Sent to +234 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`}
      step={2}
      total={4}
      onBack={() => {
        setStage('phone');
        setCode('');
        setError('');
      }}
      footer={<Button label="Verify" disabled={code.length < 4} onPress={() => verify(code)} />}>
      <Pressable onPress={() => codeInput.current?.focus()}>
        <Row gap={12}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: 68,
                borderRadius: radius.md,
                borderWidth: 2,
                borderColor: error ? p.danger : code.length === i ? p.accent : p.border,
                backgroundColor: p.surface,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <T variant="title">{code[i] ?? ''}</T>
            </View>
          ))}
        </Row>
      </Pressable>
      <TextInput
        ref={codeInput}
        value={code}
        onChangeText={(v) => {
          const clean = v.replace(/\D/g, '').slice(0, 4);
          setError('');
          setCode(clean);
          if (clean.length === 4) verify(clean);
        }}
        keyboardType="number-pad"
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        maxLength={4}
        style={{ position: 'absolute', opacity: 0, height: 1, width: 1 }}
      />
      {error ? <T color={p.danger}>{error}</T> : null}
      <Pressable disabled={resendIn > 0} onPress={() => setResendIn(30)}>
        <T variant="caption" color={resendIn > 0 ? p.textMuted : p.accent}>
          {resendIn > 0 ? `Resend code in 0:${String(resendIn).padStart(2, '0')}` : 'Didn’t get it? Resend code'}
        </T>
      </Pressable>
      <DemoNote>Demo code: {DEMO_CODE}</DemoNote>
    </FormScreen>
  );
}
