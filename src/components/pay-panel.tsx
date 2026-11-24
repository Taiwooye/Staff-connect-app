import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { splitPayment, virtualAccountFor } from '@/lib/money';
import { type ClientJob, payClientJobAction, useStore } from '@/lib/store';
import { clientPalette as p, formatNaira, radius } from '@/lib/theme';

import { Button, Card, Chip, DemoNote, Divider, Row, T, tap } from './ui';

const TIPS = [0, 500, 1000, 2000];

/**
 * End-of-job payment. The client pays the job price (plus any tip); StaffConnect keeps
 * 10% and the pro receives the rest straight away. Cash is allowed, but then the pro's
 * 10% fee is taken from their StaffConnect balance.
 */
export function PayPanel({ job, toast }: { job: ClientJob; toast: (m: string) => void }) {
  const { dispatch } = useStore();
  const pro = job.pro!;
  const first = pro.name.split(' ')[0];
  const [method, setMethod] = useState<'transfer' | 'cash'>(job.payment);
  const [tip, setTip] = useState(0);
  const [stage, setStage] = useState<'review' | 'transfer' | 'confirming'>('review');

  const amount = job.total + tip;
  const { fee, toWorker } = splitPayment(amount);
  const account = virtualAccountFor(job.id);

  const pay = () => {
    tap('success');
    dispatch(payClientJobAction(job.id, method, tip));
  };

  if (job.paid) {
    const cash = job.paid.method === 'cash';
    return (
      <>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: p.accent, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="checkmark" size={36} color="#fff" />
          </View>
          <T variant="title" style={{ textAlign: 'center' }}>
            {cash ? 'Cash payment recorded' : 'Payment complete'}
          </T>
          <T muted style={{ textAlign: 'center' }}>
            {cash
              ? `You paid ${first} ${formatNaira(job.paid.amount)} in cash. StaffConnect’s 10% (${formatNaira(job.paid.fee)}) is taken from ${first}’s balance.`
              : `${first} has received ${formatNaira(job.paid.toPro)}. StaffConnect kept its 10% fee (${formatNaira(job.paid.fee)}).`}
          </T>
        </View>
        <Button label={`Rate ${first}`} icon="star" onPress={() => router.push(`/rate/${job.id}`)} />
        <Button
          label="Rate later"
          variant="ghost"
          size="md"
          onPress={() => {
            dispatch({ type: 'updateClientJob', id: job.id, patch: { reviewSkipped: true } });
            router.replace('/client');
          }}
        />
      </>
    );
  }

  if (stage === 'transfer' || stage === 'confirming') {
    return (
      <>
        <T variant="title">Transfer {formatNaira(amount)}</T>
        <T muted>Send exactly this amount from your banking app. This account is unique to this payment.</T>
        <Card style={{ gap: 12 }}>
          <Detail label="Bank" value={account.bank} />
          <Detail label="Account name" value={account.name} />
          <Detail label="Account number" value={account.number} onCopy={() => toast('Account number copied')} />
          <Detail label="Amount" value={formatNaira(amount)} onCopy={() => toast('Amount copied')} />
        </Card>
        <T variant="caption" muted>
          As soon as it arrives, {first} gets {formatNaira(toWorker)} and StaffConnect keeps {formatNaira(fee)} (10%).
        </T>
        <DemoNote>Demo: no real transfer is needed. Tap the button to simulate it arriving.</DemoNote>
        {stage === 'confirming' ? (
          <Row gap={10} style={{ justifyContent: 'center', padding: 16 }}>
            <ActivityIndicator color={p.accent} />
            <T variant="label">Confirming your transfer…</T>
          </Row>
        ) : (
          <>
            <Button
              label="I’ve sent the transfer"
              icon="checkmark-done"
              onPress={() => {
                setStage('confirming');
                setTimeout(pay, 1500);
              }}
            />
            <Button label="Back" variant="ghost" size="md" onPress={() => setStage('review')} />
          </>
        )}
      </>
    );
  }

  return (
    <>
      <View style={{ gap: 4 }}>
        <T variant="overline" color={p.accent}>
          Job complete
        </T>
        <T variant="title">Pay {first}</T>
      </View>

      <Card style={{ gap: 8 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <T muted>
            {getHours(job)} · {formatNaira(job.subtotal / job.hours)}/hr
          </T>
          <T variant="label">{formatNaira(job.total)}</T>
        </Row>
        {tip > 0 && (
          <Row style={{ justifyContent: 'space-between' }}>
            <T muted>Tip</T>
            <T variant="label">{formatNaira(tip)}</T>
          </Row>
        )}
        <Divider />
        <Row style={{ justifyContent: 'space-between' }}>
          <T variant="label">You pay</T>
          <T variant="title">{formatNaira(amount)}</T>
        </Row>
        <View style={{ gap: 4, backgroundColor: p.surfaceAlt, borderRadius: radius.sm, padding: 10 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <T variant="caption">{first} receives</T>
            <T variant="caption" style={{ fontWeight: '700' }}>
              {formatNaira(toWorker)}
            </T>
          </Row>
          <Row style={{ justifyContent: 'space-between' }}>
            <T variant="caption">StaffConnect fee (10%)</T>
            <T variant="caption" style={{ fontWeight: '700' }}>
              {formatNaira(fee)}
            </T>
          </Row>
        </View>
      </Card>

      <View style={{ gap: 8 }}>
        <T variant="label">Add a tip?</T>
        <Row gap={8} style={{ flexWrap: 'wrap' }}>
          {TIPS.map((t) => (
            <Chip key={t} label={t ? formatNaira(t) : 'No tip'} selected={tip === t} onPress={() => setTip(t)} />
          ))}
        </Row>
      </View>

      <View style={{ gap: 8 }}>
        <T variant="label">How are you paying?</T>
        {(['transfer', 'cash'] as const).map((m) => (
          <Pressable
            key={m}
            accessibilityRole="radio"
            accessibilityState={{ selected: method === m }}
            onPress={() => setMethod(m)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              padding: 14,
              borderRadius: radius.md,
              borderWidth: 2,
              borderColor: method === m ? p.accent : p.border,
              backgroundColor: p.surface,
            }}>
            <Ionicons name={m === 'cash' ? 'cash-outline' : 'swap-horizontal-outline'} size={22} color={p.text} />
            <View style={{ flex: 1 }}>
              <T variant="label">{m === 'transfer' ? 'Bank transfer (recommended)' : 'I paid cash'}</T>
              <T variant="caption" muted>
                {m === 'transfer' ? `${first} is paid instantly.` : `${first}’s 10% fee comes out of their StaffConnect balance.`}
              </T>
            </View>
            <Ionicons name={method === m ? 'radio-button-on' : 'radio-button-off'} size={22} color={method === m ? p.accent : p.textMuted} />
          </Pressable>
        ))}
      </View>

      {method === 'transfer' ? (
        <Button label={`Pay ${formatNaira(amount)}`} icon="lock-closed" onPress={() => setStage('transfer')} />
      ) : (
        <Button label={`I paid ${formatNaira(amount)} in cash`} icon="cash" onPress={pay} />
      )}
    </>
  );
}

function getHours(job: ClientJob) {
  return `${job.hours} hr${job.hours > 1 ? 's' : ''}`;
}

function Detail({ label, value, onCopy }: { label: string; value: string; onCopy?: () => void }) {
  return (
    <Row style={{ justifyContent: 'space-between' }}>
      <T muted variant="caption">
        {label}
      </T>
      <Row gap={8}>
        <T variant="label">{value}</T>
        {onCopy && (
          <Pressable accessibilityLabel={`Copy ${label.toLowerCase()}`} onPress={onCopy} hitSlop={8}>
            <Ionicons name="copy-outline" size={18} color={p.accent} />
          </Pressable>
        )}
      </Row>
    </Row>
  );
}
