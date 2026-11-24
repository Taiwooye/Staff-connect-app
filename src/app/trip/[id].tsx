import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CityMap } from '@/components/city-map';
import { useToast } from '@/components/toast';
import { Avatar, Button, Card, Chip, DemoNote, Divider, IconButton, PaletteProvider, Row, shadow, Stars, T, tap } from '@/components/ui';
import type { IconName } from '@/lib/catalog';
import { getPro, getService } from '@/lib/catalog';
import { type ClientJob, DEMO_MS_PER_HOUR, useNow, useStore } from '@/lib/store';
import { clientPalette as p, formatNaira, radius } from '@/lib/theme';

const HOME = { x: 0.6, y: 0.5 };
const PRO_START = { x: 0.15, y: 0.18 };

export default function TripScreen() {
  return (
    <PaletteProvider palette={p}>
      <Trip />
    </PaletteProvider>
  );
}

function Trip() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { state } = useStore();
  const now = useNow(250);
  const toast = useToast();
  const job = state.clientJobs.find((j) => j.id === id);

  if (!job) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, backgroundColor: p.bg }}>
        <T variant="heading">Booking not found</T>
        <Button label="Back home" onPress={() => router.replace('/client')} />
      </View>
    );
  }

  const travel = job.acceptedAt ? Math.min(1, (now - job.acceptedAt) / job.travelMs) : 0;
  const showRoute = job.status === 'accepted';
  const proAt = job.status === 'searching' ? null : job.status === 'accepted' ? PRO_START : { x: HOME.x + 0.1, y: HOME.y - 0.02 };

  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      <View style={{ flex: 1 }}>
        <CityMap
          palette={p}
          seed={5}
          pulseAt={job.status === 'searching' ? HOME : undefined}
          route={showRoute ? { from: PRO_START, to: HOME } : undefined}
          progress={travel}
          markers={[
            { kind: 'home', at: HOME, label: job.area },
            ...(job.pro && proAt && job.status !== 'completed'
              ? [{ kind: 'pro' as const, at: proAt, initials: job.pro.initials, color: job.pro.color }]
              : []),
          ]}
        />
        <Row style={{ position: 'absolute', top: insets.top + 10, left: 16, right: 16, justifyContent: 'space-between' }}>
          <IconButton icon="chevron-down" label="Minimise" onPress={() => router.replace('/client')} />
          <Pressable onPress={() => toast.show('Trip status link copied — share it with family (demo).')} style={styles.safety}>
            <Ionicons name="shield-checkmark" size={18} color={p.accent} />
            <T variant="label">Safety</T>
          </Pressable>
        </Row>
      </View>

      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.grabber} />
        <ScrollView contentContainerStyle={{ gap: 16, padding: 20, paddingTop: 8 }} showsVerticalScrollIndicator={false}>
          <SheetContent job={job} now={now} travel={travel} toast={toast.show} />
        </ScrollView>
      </View>
      {toast.node}
    </View>
  );
}

function SheetContent({ job, now, travel, toast }: { job: ClientJob; now: number; travel: number; toast: (m: string) => void }) {
  const { dispatch } = useStore();
  const service = getService(job.serviceId);
  const cancel = () => {
    dispatch({ type: 'updateClientJob', id: job.id, patch: { status: 'cancelled' } });
    router.replace('/client');
  };

  if (job.status === 'searching') {
    const preferred = getPro(job.preferredProId);
    const pct = Math.min(1, (now - job.createdAt) / 5000);
    return (
      <>
        <T variant="title">{preferred ? `Asking ${preferred.name.split(' ')[0]}…` : 'Finding your pro…'}</T>
        <T muted>
          {preferred
            ? `We’ve sent your request to ${preferred.name}. They usually reply within a few minutes.`
            : `We’re asking the best-rated ${service.short.toLowerCase()} professionals near ${job.area}.`}
        </T>
        <View style={styles.track}>
          <View style={[styles.trackFill, { width: `${Math.max(8, pct * 100)}%` }]} />
        </View>
        <Summary job={job} />
        <Button label="Cancel request" variant="secondary" onPress={cancel} />
      </>
    );
  }

  const pro = job.pro!;

  if (job.status === 'accepted') {
    const remainingMs = job.travelMs * (1 - travel);
    const mins = Math.max(1, Math.ceil(remainingMs / 1000 / 2));
    return (
      <>
        <Row style={{ justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <T variant="title">Arriving in {mins} min</T>
            <T muted>{pro.name.split(' ')[0]} is on the way to {job.area}</T>
          </View>
          <View style={styles.etaBadge}>
            <T variant="heading" color={p.accentText}>
              {mins}
            </T>
            <T variant="overline" color={p.accentText}>
              min
            </T>
          </View>
        </Row>
        <View style={styles.track}>
          <View style={[styles.trackFill, { width: `${Math.max(4, travel * 100)}%` }]} />
        </View>
        <ProCard job={job} toast={toast} />
        <PinCard pin={job.pin} hint="Share this code when your pro arrives. The job can’t start without it." />
        <Button label="Cancel booking" variant="ghost" size="md" onPress={cancel} />
      </>
    );
  }

  if (job.status === 'arrived') {
    return (
      <>
        <T variant="title">{pro.name.split(' ')[0]} has arrived</T>
        <T muted>Check their face matches the photo, then share your start code.</T>
        <PinCard pin={job.pin} big hint="Read this code to your pro to start the job." />
        <ProCard job={job} toast={toast} />
        <Button
          label="I’ve shared the code"
          icon="play"
          onPress={() => {
            tap('success');
            dispatch({ type: 'updateClientJob', id: job.id, patch: { status: 'in_progress', startedAt: Date.now() } });
          }}
        />
      </>
    );
  }

  if (job.status === 'in_progress') {
    const total = job.hours * DEMO_MS_PER_HOUR;
    const pct = Math.min(1, (now - (job.startedAt ?? now)) / total);
    const hoursDone = Math.min(job.hours, pct * job.hours);
    return (
      <>
        <Row style={{ justifyContent: 'space-between' }}>
          <View>
            <T variant="overline" color={p.accent}>
              In progress
            </T>
            <T variant="title">{service.label}</T>
          </View>
          <T variant="heading">
            {hoursDone.toFixed(1)} / {job.hours} hrs
          </T>
        </Row>
        <View style={styles.track}>
          <View style={[styles.trackFill, { width: `${Math.max(3, pct * 100)}%` }]} />
        </View>
        <Card style={{ gap: 10 }}>
          {job.tasks.map((t, i) => {
            const done = pct > (i + 1) / (job.tasks.length + 1);
            return (
              <Row key={t} gap={10}>
                <Ionicons name={done ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={done ? p.accent : p.border} />
                <T style={{ textDecorationLine: done ? 'line-through' : 'none' }} muted={done}>
                  {t}
                </T>
              </Row>
            );
          })}
        </Card>
        <ProCard job={job} toast={toast} />
        <DemoNote>Demo time is sped up: each booked hour takes a few seconds.</DemoNote>
      </>
    );
  }

  return <Completed job={job} />;
}

function Completed({ job }: { job: ClientJob }) {
  const { dispatch } = useStore();
  const pro = job.pro!;
  const [rating, setRating] = useState(5);
  const [tip, setTip] = useState(0);
  const [praise, setPraise] = useState<string[]>([]);
  const compliments = ['On time', 'Very thorough', 'Friendly', 'Great communication'];

  return (
    <>
      <View style={{ alignItems: 'center', gap: 10 }}>
        <Avatar initials={pro.initials} color={pro.color} size={72} />
        <T variant="title" style={{ textAlign: 'center' }}>
          How was {pro.name.split(' ')[0]}?
        </T>
        <Row gap={6}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable
              key={n}
              accessibilityLabel={`${n} star${n > 1 ? 's' : ''}`}
              onPress={() => {
                tap();
                setRating(n);
              }}>
              <Ionicons name={n <= rating ? 'star' : 'star-outline'} size={38} color="#F5B32F" />
            </Pressable>
          ))}
        </Row>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        {compliments.map((c) => (
          <Chip key={c} label={c} selected={praise.includes(c)} onPress={() => setPraise(praise.includes(c) ? praise.filter((x) => x !== c) : [...praise, c])} />
        ))}
      </View>
      <View style={{ gap: 10 }}>
        <T variant="label">Add a tip? 100% goes to {pro.name.split(' ')[0]}</T>
        <Row gap={8}>
          {[0, 500, 1000, 2000].map((t) => (
            <Chip key={t} label={t ? formatNaira(t) : 'No tip'} selected={tip === t} onPress={() => setTip(t)} />
          ))}
        </Row>
      </View>
      <Card style={{ gap: 8 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <T muted>{getService(job.serviceId).label} · {job.hours} hrs</T>
          <T variant="label">{formatNaira(job.subtotal)}</T>
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          <T muted>Service fee</T>
          <T variant="label">{formatNaira(job.fee)}</T>
        </Row>
        {tip > 0 && (
          <Row style={{ justifyContent: 'space-between' }}>
            <T muted>Tip</T>
            <T variant="label">{formatNaira(tip)}</T>
          </Row>
        )}
        <Divider />
        <Row style={{ justifyContent: 'space-between' }}>
          <T variant="label">Pay {job.payment === 'cash' ? 'in cash' : 'by transfer'}</T>
          <T variant="heading">{formatNaira(job.total + tip)}</T>
        </Row>
      </Card>
      <Button
        label="Done"
        onPress={() => {
          tap('success');
          dispatch({ type: 'updateClientJob', id: job.id, patch: { rating, tip } });
          router.replace('/client');
        }}
      />
    </>
  );
}

function ProCard({ job, toast }: { job: ClientJob; toast: (m: string) => void }) {
  const pro = job.pro!;
  const actions: { icon: IconName; label: string; msg: string }[] = [
    { icon: 'call', label: 'Call', msg: 'Calls go through a private number to protect you both (demo).' },
    { icon: 'chatbubble-ellipses', label: 'Message', msg: `Message sent to ${pro.name.split(' ')[0]} (demo).` },
    { icon: 'share-social', label: 'Share', msg: 'Live status link copied (demo).' },
  ];
  return (
    <Card style={{ gap: 14 }}>
      <Row>
        <Avatar initials={pro.initials} color={pro.color} size={56} />
        <View style={{ flex: 1, gap: 2 }}>
          <T variant="heading">{pro.name}</T>
          <Row gap={10}>
            <Stars value={pro.rating} color="#C98A0B" />
            <T variant="caption" muted>
              {pro.jobs} jobs · {pro.years} yrs
            </T>
          </Row>
          <Row gap={4}>
            <Ionicons name="shield-checkmark" size={14} color={p.accent} />
            <T variant="caption" color={p.accent}>
              ID & references checked (demo profile)
            </T>
          </Row>
        </View>
      </Row>
      <Row gap={10}>
        {actions.map((a) => (
          <Pressable
            key={a.label}
            onPress={() => {
              tap();
              toast(a.msg);
            }}
            style={({ pressed }) => [styles.action, { opacity: pressed ? 0.7 : 1 }]}>
            <Ionicons name={a.icon} size={20} color={p.text} />
            <T variant="caption">{a.label}</T>
          </Pressable>
        ))}
      </Row>
    </Card>
  );
}

function PinCard({ pin, hint, big }: { pin: string; hint: string; big?: boolean }) {
  return (
    <Row style={{ backgroundColor: p.text, borderRadius: radius.lg, padding: 16 }} gap={16}>
      <View style={{ flex: 1, gap: 4 }}>
        <T variant="overline" color="rgba(255,255,255,0.6)">
          Start code
        </T>
        <T variant="caption" color="rgba(255,255,255,0.85)">
          {hint}
        </T>
      </View>
      <Row gap={6}>
        {pin.split('').map((d, i) => (
          <View key={i} style={[styles.pinDigit, big && { width: 44, height: 54 }]}>
            <T variant={big ? 'title' : 'heading'}>{d}</T>
          </View>
        ))}
      </Row>
    </Row>
  );
}

function Summary({ job }: { job: ClientJob }) {
  const service = getService(job.serviceId);
  return (
    <Card style={{ gap: 10 }}>
      <Row>
        <View style={[styles.svcIcon, { backgroundColor: service.tint }]}>
          <Ionicons name={service.icon} size={22} color={p.text} />
        </View>
        <View style={{ flex: 1 }}>
          <T variant="label">{service.label}</T>
          <T variant="caption" muted>
            {job.when} · {job.hours} hrs · {job.address}, {job.area}
          </T>
        </View>
        <T variant="label">{formatNaira(job.total)}</T>
      </Row>
    </Card>
  );
}

const styles = StyleSheet.create({
  sheet: {
    maxHeight: '62%',
    backgroundColor: p.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    marginTop: -24,
    ...shadow(3),
  },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: p.border, marginTop: 10, marginBottom: 6 },
  safety: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: p.surface, paddingHorizontal: 14, height: 44, borderRadius: radius.pill, ...shadow(2) },
  track: { height: 6, borderRadius: 3, backgroundColor: p.surfaceAlt, overflow: 'hidden' },
  trackFill: { height: 6, borderRadius: 3, backgroundColor: p.accent },
  etaBadge: { width: 60, height: 60, borderRadius: 18, backgroundColor: p.accent, alignItems: 'center', justifyContent: 'center' },
  action: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 10, borderRadius: radius.md, backgroundColor: p.surfaceAlt },
  pinDigit: { width: 34, height: 42, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  svcIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
