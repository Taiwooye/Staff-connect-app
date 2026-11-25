import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, TextInput, type TextInputInstance, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CityMap } from '@/components/city-map';
import { useToast } from '@/components/toast';
import { Avatar, Button, Card, DemoNote, Divider, IconButton, PaletteProvider, Row, shadow, Stars, StepBar, T, tap } from '@/components/ui';
import { getService } from '@/lib/catalog';
import { completeProviderJobAction, DEMO_MS_PER_HOUR, type ProviderJob, useNow, useStore } from '@/lib/store';
import { formatNaira, providerPalette as p, radius } from '@/lib/theme';

const ME = { x: 0.2, y: 0.22 };
const CLIENT = { x: 0.7, y: 0.55 };
const TRAVEL_MS = 20000;
const stepIndex = { to_client: 0, arrived: 1, in_progress: 2, completed: 3 } as const;

export default function WorkScreen() {
  return (
    <PaletteProvider palette={p}>
      <Work />
    </PaletteProvider>
  );
}

function Work() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { state } = useStore();
  const now = useNow(250);
  const toast = useToast();
  const job = state.providerJobs.find((j) => j.id === id);

  if (!job) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, backgroundColor: p.bg }}>
        <T variant="heading">Job not found</T>
        <Button label="Back to work" onPress={() => router.replace('/provider')} />
      </View>
    );
  }

  const travel = Math.min(1, (now - job.acceptedAt) / TRAVEL_MS);
  const mapVisible = job.status === 'to_client' || job.status === 'arrived';

  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      {mapVisible ? (
        <View style={{ flex: 1 }}>
          <CityMap
            palette={p}
            seed={21}
            route={job.status === 'to_client' ? { from: ME, to: CLIENT } : undefined}
            progress={travel}
            markers={[
              { kind: 'home', at: CLIENT, label: job.clientName },
              job.status === 'to_client'
                ? { kind: 'pro', at: ME, initials: 'You', color: p.accentSoft }
                : { kind: 'me', at: { x: CLIENT.x - 0.1, y: CLIENT.y } },
            ]}
          />
          <View style={[styles.navBanner, { top: insets.top + 10 }]}>
            <Ionicons name={job.status === 'to_client' ? 'arrow-up' : 'flag'} size={28} color={p.accentText} />
            <View style={{ flex: 1 }}>
              <T variant="heading" color={p.accentText}>
                {job.status === 'to_client' ? `Head to ${job.area}` : 'You’ve arrived'}
              </T>
              <T variant="caption" color={p.accentText}>
                {job.status === 'to_client'
                  ? `${(job.distanceKm * (1 - travel)).toFixed(1)} km · ${Math.max(1, Math.ceil(((1 - travel) * TRAVEL_MS) / 2000))} min`
                  : `Meet ${job.clientName.split(' ')[0]} at the door`}
              </T>
            </View>
          </View>
        </View>
      ) : (
        <View style={{ height: insets.top + 56, justifyContent: 'flex-end', paddingHorizontal: 16 }}>
          <IconButton icon="chevron-down" label="Back" onPress={() => router.replace('/provider')} />
        </View>
      )}

      <View style={[styles.sheet, mapVisible ? { maxHeight: '58%', marginTop: -24 } : { flex: 1 }, { paddingBottom: insets.bottom + 16 }]}>
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <StepBar step={stepIndex[job.status]} total={4} />
        </View>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }} keyboardShouldPersistTaps="handled">
          <Steps job={job} now={now} toast={toast.show} />
        </ScrollView>
      </View>
      {toast.node}
    </View>
  );
}

function Steps({ job, now, toast }: { job: ProviderJob; now: number; toast: (m: string) => void }) {
  const { dispatch } = useStore();
  const service = getService(job.serviceId);
  const update = (patch: Partial<ProviderJob>) => dispatch({ type: 'updateProviderJob', id: job.id, patch });

  if (job.status === 'to_client') {
    return (
      <>
        <ClientCard job={job} toast={toast} />
        <AddressCard job={job} />
        <Card style={{ gap: 8 }}>
          <Row gap={8}>
            <Ionicons name={service.icon} size={18} color={p.accent} />
            <T variant="label">
              {service.label} · {job.hours} hrs
            </T>
          </Row>
          <T muted variant="caption">
            {job.tasks.join(' · ')}
          </T>
        </Card>
        <Row gap={12}>
          <Button label="Navigate" icon="navigate" variant="secondary" style={{ flex: 1 }} onPress={() => toast('Opening turn-by-turn directions (demo).')} />
          <Button
            label="I’ve arrived"
            icon="flag"
            style={{ flex: 1 }}
            onPress={() => {
              tap('medium');
              update({ status: 'arrived' });
            }}
          />
        </Row>
      </>
    );
  }

  if (job.status === 'arrived') return <PinEntry job={job} onStart={() => update({ status: 'in_progress', startedAt: Date.now() })} />;

  if (job.status === 'in_progress') return <InProgress job={job} now={now} onComplete={() => dispatch(completeProviderJobAction(job.id))} />;

  return <Finished job={job} onDone={(r) => update({ clientRatingGiven: r })} />;
}

function PinEntry({ job, onStart }: { job: ProviderJob; onStart: () => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const input = useRef<TextInputInstance>(null);
  const check = (v: string) => {
    if (v.length < 4) return;
    if (v === job.pin) {
      tap('success');
      onStart();
    } else {
      tap('heavy');
      setError(true);
      setCode('');
    }
  };
  return (
    <>
      <T variant="title">Enter start code</T>
      <T muted>Ask {job.clientName.split(' ')[0]} for the 4-digit code shown in their app. This confirms you’re at the right home.</T>
      <Pressable onPress={() => input.current?.focus()}>
        <Row gap={10}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={[styles.pinBox, { borderColor: error ? p.danger : code.length === i ? p.accent : p.border }]}>
              <T variant="title">{code[i] ?? ''}</T>
            </View>
          ))}
        </Row>
      </Pressable>
      <TextInput
        ref={input}
        autoFocus
        value={code}
        keyboardType="number-pad"
        maxLength={4}
        onChangeText={(v) => {
          const c = v.replace(/\D/g, '').slice(0, 4);
          setError(false);
          setCode(c);
          check(c);
        }}
        style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }}
      />
      {error && <T color={p.danger}>That code doesn’t match. Check with the client.</T>}
      <DemoNote>Demo: the client’s code is {job.pin}</DemoNote>
      <Button label="Start job" icon="play" disabled={code.length < 4} onPress={() => check(code)} />
    </>
  );
}

function InProgress({ job, now, onComplete }: { job: ProviderJob; now: number; onComplete: () => void }) {
  const [done, setDone] = useState<string[]>([]);
  const elapsed = now - (job.startedAt ?? now);
  const pct = Math.min(1, elapsed / (job.hours * DEMO_MS_PER_HOUR));
  const allDone = done.length === job.tasks.length;
  const service = getService(job.serviceId);

  return (
    <>
      <View style={{ alignItems: 'center', gap: 6, paddingVertical: 8 }}>
        <T variant="overline" color={p.accent}>
          {service.label} · in progress
        </T>
        <T variant="display" style={{ fontSize: 48, lineHeight: 56 }}>
          {(pct * job.hours).toFixed(1)}
          <T variant="heading" muted>
            {' '}
            / {job.hours} hrs
          </T>
        </T>
        <View style={{ height: 6, alignSelf: 'stretch', borderRadius: 3, backgroundColor: p.surfaceAlt, overflow: 'hidden' }}>
          <View style={{ height: 6, width: `${Math.max(3, pct * 100)}%`, backgroundColor: p.accent }} />
        </View>
      </View>
      <T variant="heading">Checklist</T>
      <Card style={{ padding: 0 }}>
        {job.tasks.map((t, i) => {
          const on = done.includes(t);
          return (
            <Pressable
              key={t}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              onPress={() => {
                tap();
                setDone((d) => (d.includes(t) ? d.filter((x) => x !== t) : [...d, t]));
              }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderTopWidth: i ? 1 : 0, borderTopColor: p.border }}>
              <Ionicons name={on ? 'checkbox' : 'square-outline'} size={24} color={on ? p.success : p.textMuted} />
              <T variant="label" muted={on} style={{ textDecorationLine: on ? 'line-through' : 'none' }}>
                {t}
              </T>
            </Pressable>
          );
        })}
      </Card>
      <Button label={allDone ? 'Complete job' : `Tick off ${job.tasks.length - done.length} more task${job.tasks.length - done.length > 1 ? 's' : ''}`} icon="checkmark-done" disabled={!allDone} onPress={onComplete} />
    </>
  );
}

function Finished({ job, onDone }: { job: ProviderJob; onDone: (rating: number) => void }) {
  const [rating, setRating] = useState(5);
  const cash = job.payment === 'cash';
  return (
    <>
      <View style={{ alignItems: 'center', gap: 6 }}>
        <View style={styles.doneBadge}>
          <Ionicons name="checkmark" size={40} color={p.accentText} />
        </View>
        <T variant="overline" color={p.success}>
          Job complete
        </T>
        <T variant="display">{cash ? formatNaira(job.gross) : `+${formatNaira(job.pay)}`}</T>
        <T muted style={{ textAlign: 'center' }}>
          {cash ? `Collect ${formatNaira(job.gross)} in cash from ${job.clientName}` : 'Paid by transfer · added to your balance'}
        </T>
      </View>
      <Card style={{ gap: 8 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <T muted>Client paid{cash ? ' (cash)' : ' (transfer)'}</T>
          <T variant="label">{formatNaira(job.gross)}</T>
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          <T muted>StaffConnect fee (10%)</T>
          <T variant="label">−{formatNaira(job.gross - job.pay)}</T>
        </Row>
        <Divider />
        <Row style={{ justifyContent: 'space-between' }}>
          <T variant="label">You earned</T>
          <T variant="heading" color={p.accent}>
            {formatNaira(job.pay)}
          </T>
        </Row>
        <T variant="caption" muted>
          {cash
            ? `You keep the cash. The ${formatNaira(job.gross - job.pay)} fee was taken from your StaffConnect balance.`
            : `${formatNaira(job.pay)} is in your balance and will be paid out on Friday, or withdraw it now from Wallet.`}
        </T>
      </Card>
      <View style={{ alignItems: 'center', gap: 10 }}>
        <T variant="label">Rate {job.clientName}</T>
        <Row gap={6}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable key={n} onPress={() => setRating(n)} accessibilityLabel={`${n} stars`}>
              <Ionicons name={n <= rating ? 'star' : 'star-outline'} size={36} color={p.accent} />
            </Pressable>
          ))}
        </Row>
      </View>
      <Button
        label="Back to work"
        icon="flash"
        onPress={() => {
          tap('success');
          onDone(rating);
          router.replace('/provider');
        }}
      />
    </>
  );
}

/** Full address, shown to the pro only after they've accepted the job. */
function AddressCard({ job }: { job: ProviderJob }) {
  const full = [job.address, job.area].filter(Boolean).join(', ');
  const openMaps = () => {
    tap();
    const query = encodeURIComponent(`${full}, Nigeria`);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`).catch(() => {});
  };
  return (
    <Card style={{ gap: 10 }}>
      <Row gap={10} style={{ alignItems: 'flex-start' }}>
        <Ionicons name="location" size={20} color={p.accent} style={{ marginTop: 2 }} />
        <View style={{ flex: 1, gap: 2 }}>
          <T variant="label">{full}</T>
          {job.landmark && (
            <T variant="caption" muted>
              {job.landmark}
            </T>
          )}
        </View>
      </Row>
      <Button label="Open in Maps" icon="navigate" variant="secondary" size="md" onPress={openMaps} />
    </Card>
  );
}

function ClientCard({ job, toast }: { job: ProviderJob; toast: (m: string) => void }) {
  const initials = job.clientName
    .split(' ')
    .map((s) => s[0])
    .join('');
  return (
    <Row>
      <Avatar initials={initials} color="#2C4263" size={52} />
      <View style={{ flex: 1 }}>
        <T variant="heading">{job.clientName}</T>
        <Row gap={8}>
          <Stars value={job.clientRating} />
          <T variant="caption" muted>
            {job.area}
          </T>
        </Row>
      </View>
      <IconButton icon="chatbubble-ellipses" label="Message" onPress={() => toast(`Message sent to ${job.clientName} (demo).`)} />
      <IconButton icon="call" label="Call" onPress={() => toast('Calling through a private number (demo).')} />
    </Row>
  );
}

const styles = StyleSheet.create({
  sheet: { backgroundColor: p.bg, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, ...shadow(3) },
  navBanner: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: p.accent,
    borderRadius: radius.lg,
    padding: 16,
    ...shadow(3),
  },
  pinBox: { flex: 1, height: 68, borderRadius: radius.md, borderWidth: 2, backgroundColor: p.surface, alignItems: 'center', justifyContent: 'center' },
  doneBadge: { width: 72, height: 72, borderRadius: 36, backgroundColor: p.success, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
});
