import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import type { IconName } from '@/lib/catalog';
import { formatDay, nextPayoutRun } from '@/lib/money';
import { fridayPayoutAction, type LedgerKind, useNow, useStore } from '@/lib/store';
import { formatNaira, providerPalette as p, radius } from '@/lib/theme';

import { Button, Card, Row, T, tap } from './ui';

const kindIcon: Record<LedgerKind, IconName> = {
  earning: 'arrow-down-circle',
  cash_fee: 'remove-circle',
  friday_payout: 'calendar',
  withdrawal: 'arrow-up-circle',
  to_wallet: 'wallet',
};

/** Worker money overview: Friday-payout balance, wallet, actions and history. */
export function WalletSummary() {
  const { state, dispatch } = useStore();
  const now = useNow(60000);
  const [showAll, setShowAll] = useState(false);
  const bank = state.bankAccount;
  const owes = state.balance < 0;
  const next = formatDay(nextPayoutRun(now));
  const entries = showAll ? state.ledger : state.ledger.slice(0, 5);

  return (
    <>
      <Card style={{ gap: 14, borderColor: owes ? p.danger : p.border }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ gap: 2 }}>
            <T variant="overline" muted>
              Payout balance
            </T>
            <T variant="display" color={owes ? p.danger : p.text}>
              {owes ? `−${formatNaira(-state.balance)}` : formatNaira(state.balance)}
            </T>
          </View>
          <View style={{ backgroundColor: p.accentSoft, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 }}>
            <T variant="caption" color={p.accent} style={{ fontWeight: '700' }}>
              Auto-pay Fridays
            </T>
          </View>
        </Row>
        <Row gap={8} style={{ alignItems: 'flex-start' }}>
          <Ionicons name={owes ? 'alert-circle' : 'calendar-outline'} size={16} color={owes ? p.danger : p.textMuted} />
          <T variant="caption" color={owes ? p.danger : p.textMuted} style={{ flex: 1 }}>
            {owes
              ? 'You owe StaffConnect fees from cash jobs. This is taken from your next transfer earnings.'
              : bank
                ? `Paid automatically to ${bank.bank} ····${bank.accountNumber.slice(-4)} on ${next}, 9:00 AM.`
                : 'Add a bank account to receive Friday payouts.'}
          </T>
        </Row>
        {!bank ? (
          <Button label="Add bank account" icon="card" onPress={() => router.push('/account/bank')} />
        ) : (
          <Row gap={10}>
            <Button
              label="Withdraw now"
              icon="arrow-up"
              size="md"
              style={{ flex: 1 }}
              disabled={state.balance <= 0}
              onPress={() => router.push({ pathname: '/wallet/transfer', params: { mode: 'withdraw', from: 'balance' } })}
            />
            <Button
              label="Move to wallet"
              icon="wallet"
              size="md"
              variant="secondary"
              style={{ flex: 1 }}
              disabled={state.balance <= 0}
              onPress={() => router.push({ pathname: '/wallet/transfer', params: { mode: 'move', from: 'balance' } })}
            />
          </Row>
        )}
      </Card>

      <Card style={{ gap: 12 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <View style={{ gap: 2 }}>
            <T variant="overline" muted>
              Wallet
            </T>
            <T variant="title">{formatNaira(state.wallet)}</T>
          </View>
          <Button
            label="Withdraw"
            size="md"
            variant="secondary"
            disabled={state.wallet <= 0 || !bank}
            onPress={() => router.push({ pathname: '/wallet/transfer', params: { mode: 'withdraw', from: 'wallet' } })}
          />
        </Row>
        <T variant="caption" muted>
          Money in your wallet is not paid out on Fridays. It stays here until you withdraw it.
        </T>
      </Card>

      <View style={{ gap: 6, backgroundColor: p.surfaceAlt, borderRadius: radius.md, padding: 14 }}>
        <T variant="label">How you get paid</T>
        <Bullet text="Transfer jobs: the client pays in the app, StaffConnect keeps 10%, the rest lands in your balance instantly." />
        <Bullet text="Cash jobs: you keep the cash, and the 10% fee is taken from your balance." />
        <Bullet text="Every Friday at 9:00 AM your balance is paid to your bank. Withdraw any time, or move money to your wallet to keep it." />
      </View>

      {bank && state.balance > 0 && (
        <Pressable
          onPress={() => {
            tap('success');
            dispatch(fridayPayoutAction());
          }}
          style={{ alignItems: 'center', padding: 6 }}>
          <T variant="caption" color={p.accent}>
            Demo: run Friday payout now
          </T>
        </Pressable>
      )}

      <Row style={{ justifyContent: 'space-between' }}>
        <T variant="heading">Transactions</T>
        {state.ledger.length > 5 && (
          <Pressable onPress={() => setShowAll(!showAll)} hitSlop={8}>
            <T variant="label" color={p.accent}>
              {showAll ? 'Show less' : `See all ${state.ledger.length}`}
            </T>
          </Pressable>
        )}
      </Row>
      {state.ledger.length === 0 ? (
        <T muted>No transactions yet. Complete a job to get paid.</T>
      ) : (
        <Card style={{ padding: 0 }}>
          {entries.map((e, i) => (
            <Row key={e.id} style={{ padding: 14, borderTopWidth: i ? 1 : 0, borderTopColor: p.border }}>
              <Ionicons name={kindIcon[e.kind]} size={22} color={e.amount >= 0 ? p.success : e.kind === 'cash_fee' ? p.danger : p.textMuted} />
              <View style={{ flex: 1 }}>
                <T variant="label">{e.label}</T>
                <T variant="caption" muted>
                  {new Date(e.at).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })} ·{' '}
                  {e.bucket === 'wallet' ? 'Wallet' : 'Balance'}
                </T>
              </View>
              <T variant="label" color={e.amount >= 0 ? p.success : p.text}>
                {e.amount >= 0 ? '+' : '−'}
                {formatNaira(Math.abs(e.amount))}
              </T>
            </Row>
          ))}
        </Card>
      )}
    </>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <Row gap={8} style={{ alignItems: 'flex-start' }}>
      <Ionicons name="checkmark" size={14} color={p.accent} style={{ marginTop: 3 }} />
      <T variant="caption" muted style={{ flex: 1 }}>
        {text}
      </T>
    </Row>
  );
}
