import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Field, FormScreen } from '@/components/form-screen';
import { Button, Card, Chip, PaletteProvider, Row, T, tap } from '@/components/ui';
import { moveToWalletAction, useStore, withdrawAction } from '@/lib/store';
import { formatNaira, providerPalette as p } from '@/lib/theme';

export default function WalletTransfer() {
  return (
    <PaletteProvider palette={p}>
      <Transfer />
    </PaletteProvider>
  );
}

function Transfer() {
  const params = useLocalSearchParams<{ mode?: string; from?: string }>();
  const mode = params.mode === 'move' ? 'move' : 'withdraw';
  const from = params.from === 'wallet' ? 'wallet' : 'balance';
  const { state, dispatch } = useStore();
  const available = Math.max(0, from === 'wallet' ? state.wallet : state.balance);
  const [text, setText] = useState(String(available));
  const [stage, setStage] = useState<'form' | 'sending' | 'done'>('form');
  const [sent, setSent] = useState(0);
  const bank = state.bankAccount;

  const amount = Number(text.replace(/\D/g, '')) || 0;
  const error =
    amount <= 0 ? 'Enter an amount.' : amount > available ? `You only have ${formatNaira(available)} available.` : mode === 'withdraw' && !bank ? 'Add a bank account first.' : '';

  const submit = () => {
    if (mode === 'move') {
      tap('success');
      dispatch(moveToWalletAction(amount));
      setSent(amount);
      setStage('done');
      return;
    }
    setStage('sending');
    setTimeout(() => {
      tap('success');
      dispatch(withdrawAction(from, amount));
      setSent(amount);
      setStage('done');
    }, 1400);
  };

  if (stage === 'done') {
    return (
      <FormScreen title={mode === 'move' ? 'Moved to wallet' : 'Withdrawal sent'} onBack={() => router.back()}>
        <View style={{ alignItems: 'center', gap: 12, paddingVertical: 16 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: p.success, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="checkmark" size={40} color={p.accentText} />
          </View>
          <T variant="display">{formatNaira(sent)}</T>
          <T muted style={{ textAlign: 'center' }}>
            {mode === 'move'
              ? 'This money is now in your wallet and won’t be paid out on Friday. Withdraw it whenever you like.'
              : `On its way to ${bank?.bank} ····${bank?.accountNumber.slice(-4)}. Transfers usually arrive within minutes.`}
          </T>
        </View>
        <Button label="Done" onPress={() => router.back()} />
      </FormScreen>
    );
  }

  return (
    <FormScreen
      title={mode === 'move' ? 'Move to wallet' : 'Withdraw to bank'}
      subtitle={
        mode === 'move'
          ? 'Keep money in StaffConnect instead of receiving it in Friday’s automatic payout.'
          : `From your ${from === 'wallet' ? 'wallet' : 'payout balance'}. No StaffConnect fee on withdrawals.`
      }
      footer={
        <>
          <Button
            label={mode === 'move' ? `Move ${formatNaira(amount)}` : `Withdraw ${formatNaira(amount)}`}
            icon={mode === 'move' ? 'wallet' : 'arrow-up'}
            disabled={!!error || stage === 'sending'}
            onPress={submit}
          />
          {error ? (
            <T variant="caption" color={p.danger}>
              {error}
            </T>
          ) : null}
        </>
      }>
      <Card style={{ gap: 4 }}>
        <T variant="caption" muted>
          Available in {from === 'wallet' ? 'wallet' : 'payout balance'}
        </T>
        <T variant="title">{formatNaira(available)}</T>
      </Card>

      <Field label="Amount (₦)" value={text} onChangeText={(v) => setText(v.replace(/\D/g, ''))} keyboardType="number-pad" />
      <Row gap={8} style={{ flexWrap: 'wrap' }}>
        {[0.25, 0.5, 1].map((f) => (
          <Chip key={f} label={f === 1 ? 'All' : `${f * 100}%`} selected={amount === Math.floor(available * f)} onPress={() => setText(String(Math.floor(available * f)))} />
        ))}
      </Row>

      {mode === 'withdraw' && bank && (
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Ionicons name="business-outline" size={22} color={p.text} />
          <View style={{ flex: 1 }}>
            <T variant="label">{bank.bank}</T>
            <T variant="caption" muted>
              {bank.accountName} · ····{bank.accountNumber.slice(-4)}
            </T>
          </View>
        </Card>
      )}

      {stage === 'sending' && (
        <Row gap={10} style={{ justifyContent: 'center' }}>
          <ActivityIndicator color={p.accent} />
          <T variant="label">Sending to your bank…</T>
        </Row>
      )}
    </FormScreen>
  );
}
