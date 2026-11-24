import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Field, FormScreen } from '@/components/form-screen';
import { Avatar, Button, Card, Chip, Divider, PaletteProvider, Row, Stars, T, tap } from '@/components/ui';
import { getPro, getService, launchLocations, type LaunchState } from '@/lib/catalog';
import { clientJobHref, createClientJob, priceFor, useStore } from '@/lib/store';
import { clientPalette as p, formatNaira, radius } from '@/lib/theme';

const whenOptions = ['Now', 'Later today', 'Tomorrow'];
const timeSlots = ['8:00 AM', '10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM'];

export default function BookService() {
  return (
    <PaletteProvider palette={p}>
      <Booking />
    </PaletteProvider>
  );
}

function Booking() {
  const { service: serviceId, pro: proId } = useLocalSearchParams<{ service: string; pro?: string }>();
  const service = getService(serviceId);
  const pro = getPro(proId);
  const rate = pro?.hourlyRate ?? service.hourlyRate;
  const { state, dispatch, activeClientJob } = useStore();
  const homeState = (state.profile?.state as LaunchState) ?? 'Lagos';

  const [area, setArea] = useState(state.profile?.area ?? launchLocations[homeState][0]);
  const [address, setAddress] = useState('');
  const [when, setWhen] = useState('Now');
  const [slot, setSlot] = useState(timeSlots[1]);
  const [hours, setHours] = useState(service.minHours);
  const [tasks, setTasks] = useState<string[]>([service.tasks[0]]);
  const [notes, setNotes] = useState('');
  const [payment, setPayment] = useState<'cash' | 'transfer'>('transfer');

  const price = priceFor(service.id, hours, rate);
  const valid = address.trim().length >= 4 && tasks.length > 0;

  const request = () => {
    const job = createClientJob({
      serviceId: service.id,
      area,
      address: address.trim(),
      when: when === 'Now' ? 'Now' : `${when}, ${slot}`,
      hours,
      tasks,
      notes: notes.trim(),
      ...price,
      payment,
      preferredProId: pro?.id,
    });
    tap('success');
    dispatch({ type: 'requestJob', job });
    router.replace(clientJobHref(job));
  };

  if (activeClientJob) {
    return (
      <FormScreen title="You already have a booking" subtitle="Finish or cancel it before requesting new help.">
        <Button label="View current booking" onPress={() => router.replace(clientJobHref(activeClientJob))} />
      </FormScreen>
    );
  }

  return (
    <FormScreen
      title={service.label}
      subtitle={pro ? `With ${pro.name} · ${formatNaira(rate)}/hr` : `${service.description} · from ${formatNaira(rate)}/hr`}
      footer={
        <>
          <Row style={{ justifyContent: 'space-between' }}>
            <View>
              <T variant="caption" muted>
                {hours} hrs · {pro ? 'total' : 'estimate'}
              </T>
              <T variant="title">{pro ? '' : '~'}{formatNaira(price.total)}</T>
            </View>
            <Button
              label={pro ? `Send to ${pro.name.split(' ')[0]}` : 'See available pros'}
              icon={pro ? 'paper-plane' : 'people'}
              disabled={!valid}
              onPress={request}
              style={{ paddingHorizontal: 28 }}
            />
          </Row>
          <T variant="caption" muted>
            {!valid
              ? 'Add your street address to continue.'
              : pro
                ? `Nothing is booked until ${pro.name.split(' ')[0]} accepts.`
                : 'Next you’ll compare matching pros and choose one yourself. Nothing is sent yet.'}
          </T>
        </>
      }>
      {pro && (
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: p.accent }}>
          <Avatar initials={pro.initials} color={pro.color} size={44} />
          <View style={{ flex: 1 }}>
            <T variant="label">Requesting {pro.name.split(' ')[0]} directly</T>
            <Row gap={8}>
              <Stars value={pro.rating} size={12} color="#C98A0B" />
              <T variant="caption" muted>
                {pro.area} · {pro.jobs} jobs
              </T>
            </Row>
          </View>
        </Card>
      )}
      <Section icon="location-outline" title="Where">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {launchLocations[homeState].map((a) => (
            <Chip key={a} label={a} selected={area === a} onPress={() => setArea(a)} />
          ))}
        </View>
        <Field label="Street address" value={address} onChangeText={setAddress} placeholder="e.g. 12 Admiralty Way" />
      </Section>

      <Section icon="time-outline" title="When">
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {whenOptions.map((w) => (
            <Chip key={w} label={w} selected={when === w} onPress={() => setWhen(w)} icon={w === 'Now' ? 'flash' : undefined} />
          ))}
        </View>
        {when !== 'Now' && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {timeSlots.map((t) => (
              <Chip key={t} label={t} selected={slot === t} onPress={() => setSlot(t)} />
            ))}
          </View>
        )}
      </Section>

      <Section icon="hourglass-outline" title="How long">
        <Row style={{ justifyContent: 'space-between' }}>
          <Stepper value={hours} min={service.minHours} max={10} onChange={setHours} />
          <T muted variant="caption">
            Minimum {service.minHours} hrs
          </T>
        </Row>
      </Section>

      <Section icon="list-outline" title="What needs doing">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {service.tasks.map((t) => (
            <Chip
              key={t}
              label={t}
              selected={tasks.includes(t)}
              onPress={() => setTasks(tasks.includes(t) ? tasks.filter((x) => x !== t) : [...tasks, t])}
            />
          ))}
        </View>
        <Field label="Notes for your pro (optional)" value={notes} onChangeText={setNotes} multiline placeholder="Gate code, pets at home, supplies provided…" />
      </Section>

      <Section icon="wallet-outline" title="Payment">
        {(['transfer', 'cash'] as const).map((m) => (
          <Pressable
            key={m}
            accessibilityRole="radio"
            accessibilityState={{ selected: payment === m }}
            onPress={() => setPayment(m)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              padding: 14,
              borderRadius: radius.md,
              borderWidth: 2,
              borderColor: payment === m ? p.accent : p.border,
              backgroundColor: p.surface,
            }}>
            <Ionicons name={m === 'cash' ? 'cash-outline' : 'swap-horizontal-outline'} size={22} color={p.text} />
            <View style={{ flex: 1 }}>
              <Row gap={8}>
                <T variant="label">{m === 'cash' ? 'Cash' : 'Bank transfer'}</T>
                {m === 'transfer' && (
                  <View style={{ backgroundColor: p.accentSoft, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                    <T variant="caption" color={p.accent} style={{ fontWeight: '700' }}>
                      Recommended
                    </T>
                  </View>
                )}
              </Row>
              <T variant="caption" muted>
                {m === 'transfer'
                  ? 'Pay in the app after the job. Your pro is paid instantly.'
                  : 'Hand cash to your pro. Their 10% fee is taken from their StaffConnect balance.'}
              </T>
            </View>
            <Ionicons name={payment === m ? 'radio-button-on' : 'radio-button-off'} size={22} color={payment === m ? p.accent : p.textMuted} />
          </Pressable>
        ))}
        <Card style={{ gap: 8 }}>
          <Line label={`${formatNaira(rate)} × ${hours} hrs`} value={formatNaira(price.subtotal)} />
          <Divider />
          <Line label="You pay" value={formatNaira(price.total)} bold />
          <T variant="caption" muted>
            No extra fees. StaffConnect keeps 10% ({formatNaira(price.fee)}) and {pro ? pro.name.split(' ')[0] : 'your pro'} receives{' '}
            {formatNaira(price.toPro)}.
          </T>
        </Card>
      </Section>
    </FormScreen>
  );
}

function Section({ icon, title, children }: { icon: 'location-outline' | 'time-outline' | 'hourglass-outline' | 'list-outline' | 'wallet-outline'; title: string; children: ReactNode }) {
  return (
    <View style={{ gap: 12 }}>
      <Row gap={8}>
        <Ionicons name={icon} size={18} color={p.accent} />
        <T variant="heading">{title}</T>
      </Row>
      {children}
    </View>
  );
}

function Stepper({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  const btn = (icon: 'add' | 'remove', next: number, disabled: boolean) => (
    <Pressable
      disabled={disabled}
      onPress={() => {
        tap();
        onChange(next);
      }}
      style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: p.surfaceAlt, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.4 : 1 }}>
      <Ionicons name={icon} size={20} color={p.text} />
    </Pressable>
  );
  return (
    <Row gap={16}>
      {btn('remove', value - 1, value <= min)}
      <T variant="title" style={{ minWidth: 70, textAlign: 'center' }}>
        {value} hrs
      </T>
      {btn('add', value + 1, value >= max)}
    </Row>
  );
}

function Line({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <Row style={{ justifyContent: 'space-between' }}>
      <T variant={bold ? 'label' : 'body'} muted={!bold}>
        {label}
      </T>
      <T variant={bold ? 'heading' : 'label'}>{value}</T>
    </Row>
  );
}
