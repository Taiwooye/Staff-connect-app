import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Field, FormScreen } from '@/components/form-screen';
import { Button, Card, Chip, DemoNote, PaletteProvider, Row, T, tap, usePalette } from '@/components/ui';
import { useStore } from '@/lib/store';
import { clientPalette, providerPalette } from '@/lib/theme';

const BANKS = ['Access Bank', 'GTBank', 'First Bank', 'UBA', 'Zenith Bank', 'Fidelity Bank', 'Opay', 'Moniepoint', 'Kuda', 'PalmPay'];

export default function BankScreen() {
  const { state } = useStore();
  return (
    <PaletteProvider palette={state.role === 'provider' ? providerPalette : clientPalette}>
      <Bank />
    </PaletteProvider>
  );
}

function Bank() {
  const p = usePalette();
  const { state, dispatch } = useStore();
  const existing = state.bankAccount;
  const isProvider = state.role === 'provider';

  const [bank, setBank] = useState(existing?.bank ?? '');
  const [number, setNumber] = useState(existing?.accountNumber ?? '');
  const [verifiedFor, setVerifiedFor] = useState(existing ? `${existing.bank}:${existing.accountNumber}` : '');
  const key = `${bank}:${number}`;
  const ready = !!bank && number.length === 10;
  const verified = ready && verifiedFor === key;
  const accountName = (state.profile?.name ?? '').toUpperCase();

  // Demo "name enquiry": after a short pause, the account resolves to the profile's name.
  useEffect(() => {
    if (!ready || verifiedFor === key) return;
    const t = setTimeout(() => setVerifiedFor(key), 900);
    return () => clearTimeout(t);
  }, [ready, key, verifiedFor]);

  return (
    <FormScreen
      title={existing ? 'Bank account' : 'Add a bank account'}
      subtitle={
        isProvider
          ? 'Where your earnings are paid. Use an account in your own name.'
          : 'Used for refunds and quick transfers to your pro. Use an account in your own name.'
      }
      footer={
        <>
          <Button
            label={existing ? 'Save account' : 'Add account'}
            disabled={!verified}
            onPress={() => {
              tap('success');
              dispatch({ type: 'setBank', bank: { bank, accountNumber: number, accountName } });
              router.back();
            }}
          />
          {existing && (
            <Button
              label="Remove account"
              variant="ghost"
              size="md"
              onPress={() => {
                dispatch({ type: 'setBank', bank: undefined });
                router.back();
              }}
            />
          )}
        </>
      }>
      <View style={{ gap: 10 }}>
        <T variant="caption" muted>
          Bank
        </T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {BANKS.map((b) => (
            <Chip key={b} label={b} selected={bank === b} onPress={() => setBank(b)} />
          ))}
        </View>
      </View>

      <Field
        label="Account number (10 digits)"
        value={number}
        onChangeText={(v) => setNumber(v.replace(/\D/g, '').slice(0, 10))}
        keyboardType="number-pad"
        maxLength={10}
        placeholder="0123456789"
      />

      {ready && (
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: verified ? p.success : p.border }}>
          {verified ? <Ionicons name="checkmark-circle" size={24} color={p.success} /> : <ActivityIndicator color={p.accent} />}
          <View style={{ flex: 1 }}>
            <T variant="caption" muted>
              {verified ? 'Account name' : 'Checking account…'}
            </T>
            {verified && <T variant="label">{accountName}</T>}
          </View>
        </Card>
      )}
      {!ready && (
        <Row gap={8}>
          <Ionicons name="lock-closed-outline" size={16} color={p.textMuted} />
          <T variant="caption" muted style={{ flex: 1 }}>
            We only show the last 4 digits after saving.
          </T>
        </Row>
      )}
      <DemoNote>Demo: no real bank check happens, and details stay on this device. Don’t enter a real account number.</DemoNote>
    </FormScreen>
  );
}
