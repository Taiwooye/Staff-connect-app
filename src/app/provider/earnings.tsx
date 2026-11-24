import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card, Row, T, tap } from '@/components/ui';
import { WalletSummary } from '@/components/wallet-summary';
import { getService } from '@/lib/catalog';
import { acceptanceRate, useStore } from '@/lib/store';
import { formatNaira, providerPalette as p } from '@/lib/theme';

const DAY = 86400000;

export default function Earnings() {
  const insets = useSafeAreaInsets();
  const { state } = useStore();
  const done = state.providerJobs.filter((j) => j.status === 'completed');

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const days = Array.from({ length: 7 }).map((_, i) => {
    const from = start.getTime() - (6 - i) * DAY;
    const total = done.filter((j) => (j.completedAt ?? 0) >= from && (j.completedAt ?? 0) < from + DAY).reduce((s, j) => s + j.pay, 0);
    return { label: new Date(from).toLocaleDateString('en-NG', { weekday: 'short' }), total, isToday: i === 6 };
  });
  const [picked, setPicked] = useState(6);
  const week = days.reduce((s, d) => s + d.total, 0);
  const max = Math.max(...days.map((d) => d.total), 1);
  const hours = done.reduce((s, j) => s + j.hours, 0);
  const acceptance = acceptanceRate(state);
  const CHART_H = 140;

  return (
    <ScrollView style={{ backgroundColor: p.bg }} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16, gap: 16, paddingBottom: 40 }}>
      <T variant="title">Wallet & earnings</T>

      <WalletSummary />

      <T variant="heading">Earnings</T>

      <Card style={{ gap: 16 }}>
        <View>
          <T variant="overline" muted>
            This week
          </T>
          <T variant="display">{formatNaira(week)}</T>
          <T variant="caption" muted>
            {days[picked].isToday ? 'Today' : days[picked].label}: {formatNaira(days[picked].total)} · tap a bar for details
          </T>
        </View>
        <View accessibilityLabel={`Earnings per day for the last 7 days. ${days.map((d) => `${d.label} ${formatNaira(d.total)}`).join(', ')}`}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: CHART_H, gap: 2, borderBottomWidth: 1, borderBottomColor: p.border }}>
            {days.map((d, i) => (
              <Pressable
                key={i}
                onPress={() => {
                  tap();
                  setPicked(i);
                }}
                style={{ flex: 1, height: '100%', justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 5 }}>
                <View
                  style={{
                    width: '100%',
                    height: Math.max(3, (d.total / max) * (CHART_H - 8)),
                    backgroundColor: p.accent,
                    opacity: i === picked ? 1 : 0.45,
                    borderTopLeftRadius: 4,
                    borderTopRightRadius: 4,
                  }}
                />
              </Pressable>
            ))}
          </View>
          <View style={{ flexDirection: 'row', marginTop: 6 }}>
            {days.map((d, i) => (
              <T key={i} variant="caption" muted={i !== picked} style={{ flex: 1, textAlign: 'center' }}>
                {d.label}
              </T>
            ))}
          </View>
        </View>
      </Card>

      <Row gap={10}>
        <Tile value={String(done.length)} label="Jobs" />
        <Tile value={`${hours}`} label="Hours" />
        <Tile value={`${acceptance}%`} label="Acceptance" />
      </Row>

      <T variant="heading">Recent jobs</T>
      {done.length === 0 && (
        <Card style={{ alignItems: 'center', gap: 10, paddingVertical: 28 }}>
          <Ionicons name="flash-outline" size={36} color={p.textMuted} />
          <T muted style={{ textAlign: 'center' }}>
            Go online and accept a job — your earnings will show up here.
          </T>
        </Card>
      )}
      {done.map((j) => {
        const s = getService(j.serviceId);
        return (
          <Card key={j.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: p.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={s.icon} size={22} color={p.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <T variant="label">{s.label}</T>
              <T variant="caption" muted>
                {j.clientName} · {j.area} · {j.hours} hrs
              </T>
            </View>
            <T variant="label">+{formatNaira(j.pay)}</T>
          </Card>
        );
      })}
    </ScrollView>
  );
}

function Tile({ value, label }: { value: string; label: string }) {
  return (
    <Card style={{ flex: 1, gap: 2 }}>
      <T variant="heading">{value}</T>
      <T variant="caption" muted>
        {label}
      </T>
    </Card>
  );
}
