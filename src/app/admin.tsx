import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card, DemoNote, IconButton, PaletteProvider, Row, T } from '@/components/ui';
import { getService } from '@/lib/catalog';
import { FEE_RATE } from '@/lib/money';
import { useStore } from '@/lib/store';
import { clientPalette as p, formatNaira } from '@/lib/theme';

/** StaffConnect's own account: the 10% fee collected from every payment. */
export default function AdminRevenue() {
  const insets = useSafeAreaInsets();
  const { state } = useStore();
  const fees = state.platformFees;
  const total = fees.reduce((s, f) => s + f.amount, 0);
  const volume = fees.reduce((s, f) => s + f.paymentAmount, 0);
  const viaTransfer = fees.filter((f) => f.method === 'transfer').reduce((s, f) => s + f.amount, 0);
  const viaCash = total - viaTransfer;

  return (
    <PaletteProvider palette={p}>
      <ScrollView style={{ backgroundColor: p.bg }} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, gap: 16, paddingBottom: 40 }}>
        <IconButton icon="arrow-back" label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
        <View style={{ gap: 4 }}>
          <T variant="overline" color={p.accent}>
            StaffConnect account
          </T>
          <T variant="title">Platform revenue</T>
          <T muted>StaffConnect keeps {FEE_RATE * 100}% of every payment. This is what has come in from this device’s demo jobs.</T>
        </View>

        <Card style={{ gap: 6, backgroundColor: p.accentSoft, borderColor: p.accentSoft }}>
          <T variant="overline" muted>
            Total fees collected
          </T>
          <T variant="display" color={p.accent}>
            {formatNaira(total)}
          </T>
          <T variant="caption" muted>
            From {fees.length} payment{fees.length === 1 ? '' : 's'} worth {formatNaira(volume)}
          </T>
        </Card>

        <Row gap={10}>
          <Card style={{ flex: 1, gap: 2 }}>
            <T variant="heading">{formatNaira(viaTransfer)}</T>
            <T variant="caption" muted>
              Kept from transfers
            </T>
          </Card>
          <Card style={{ flex: 1, gap: 2 }}>
            <T variant="heading">{formatNaira(viaCash)}</T>
            <T variant="caption" muted>
              Taken from worker balances (cash jobs)
            </T>
          </Card>
        </Row>

        <T variant="heading">Fee history</T>
        {fees.length === 0 && <T muted>No payments yet. Complete and pay for a job to see the 10% arrive here.</T>}
        {fees.length > 0 && (
          <Card style={{ padding: 0 }}>
            {fees.map((f, i) => (
              <Row key={f.id} style={{ padding: 14, borderTopWidth: i ? 1 : 0, borderTopColor: p.border }}>
                <Ionicons name={f.method === 'cash' ? 'cash-outline' : 'swap-horizontal-outline'} size={22} color={p.textMuted} />
                <View style={{ flex: 1 }}>
                  <T variant="label">{f.description}</T>
                  <T variant="caption" muted>
                    10% of {formatNaira(f.paymentAmount)} ·{' '}
                    {new Date(f.at).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
                  </T>
                </View>
                <T variant="label" color={p.accent}>
                  +{formatNaira(f.amount)}
                </T>
              </Row>
            ))}
          </Card>
        )}
        <View style={{ gap: 4 }}>
          <T variant="heading">Job records</T>
          <T muted>Who booked, where, and who went. Kept so StaffConnect can step in if anything goes wrong.</T>
        </View>
        {state.clientJobs.length + state.providerJobs.length === 0 && <T muted>No jobs yet.</T>}
        {state.clientJobs.map((j) => (
          <JobRecord
            key={j.id}
            title={`${getService(j.serviceId).label} · ${j.status.replace('_', ' ')}`}
            at={j.createdAt}
            rows={[
              ['Client', [state.profile?.name, state.profile?.phone].filter(Boolean).join(' · ') || 'Unknown'],
              ['Address', `${j.address}, ${j.area}`],
              ['Landmark', j.landmark],
              ['Pro', j.pro?.name],
              ['Start code', j.pin],
            ]}
          />
        ))}
        {state.providerJobs.map((j) => (
          <JobRecord
            key={j.id}
            title={`${getService(j.serviceId).label} · ${j.status.replace('_', ' ')}`}
            at={j.acceptedAt}
            rows={[
              ['Client', j.clientName],
              ['Address', [j.address, j.area].filter(Boolean).join(', ')],
              ['Landmark', j.landmark],
              ['Pro', [state.profile?.name, state.profile?.phone].filter(Boolean).join(' · ')],
              ['Pro home', [state.profile?.address, state.profile?.area].filter(Boolean).join(', ')],
            ]}
          />
        ))}

        <DemoNote>Demo ledger stored on this device. In production this would be StaffConnect’s settlement account.</DemoNote>
      </ScrollView>
    </PaletteProvider>
  );
}

function JobRecord({ title, at, rows }: { title: string; at: number; rows: [string, string | undefined][] }) {
  return (
    <Card style={{ gap: 8 }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <T variant="label" style={{ flex: 1, textTransform: 'capitalize' }}>
          {title}
        </T>
        <T variant="caption" muted>
          {new Date(at).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
        </T>
      </Row>
      {rows
        .filter(([, v]) => !!v)
        .map(([k, v]) => (
          <Row key={k} gap={10} style={{ alignItems: 'flex-start' }}>
            <T variant="caption" muted style={{ width: 76 }}>
              {k}
            </T>
            <T variant="caption" style={{ flex: 1 }}>
              {v}
            </T>
          </Row>
        ))}
    </Card>
  );
}
