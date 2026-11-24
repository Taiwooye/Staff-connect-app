import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card, DemoNote, IconButton, PaletteProvider, Row, T } from '@/components/ui';
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
        <DemoNote>Demo ledger stored on this device. In production this would be StaffConnect’s settlement account.</DemoNote>
      </ScrollView>
    </PaletteProvider>
  );
}
