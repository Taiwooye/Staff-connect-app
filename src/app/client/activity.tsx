import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, Row, T } from '@/components/ui';
import { getService } from '@/lib/catalog';
import { useStore } from '@/lib/store';
import { clientPalette as p, formatNaira } from '@/lib/theme';

const label = {
  searching: 'Matching',
  accepted: 'On the way',
  arrived: 'Arrived',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
} as const;

export default function Activity() {
  const insets = useSafeAreaInsets();
  const { state, activeClientJob } = useStore();
  const jobs = state.clientJobs;

  return (
    <ScrollView style={{ backgroundColor: p.bg }} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16, gap: 14 }}>
      <T variant="title">Bookings</T>
      {jobs.length === 0 && (
        <Card style={{ alignItems: 'center', gap: 12, paddingVertical: 32 }}>
          <Ionicons name="calendar-outline" size={40} color={p.textMuted} />
          <T variant="heading">No bookings yet</T>
          <T muted style={{ textAlign: 'center' }}>
            When you book help, you’ll find live status and receipts here.
          </T>
          <Button label="Book help" size="md" onPress={() => router.navigate('/client')} />
        </Card>
      )}
      {jobs.map((j) => {
        const s = getService(j.serviceId);
        const live = activeClientJob?.id === j.id;
        return (
          <Pressable key={j.id} disabled={!live} onPress={() => router.push(`/trip/${j.id}`)}>
            <Card style={{ gap: 10, borderColor: live ? p.accent : p.border }}>
              <Row>
                <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: s.tint, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name={s.icon} size={22} color={p.text} />
                </View>
                <View style={{ flex: 1 }}>
                  <T variant="label">{s.label}</T>
                  <T variant="caption" muted>
                    {new Date(j.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })} · {j.area} ·{' '}
                    {j.hours} hrs
                  </T>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <T variant="label">{formatNaira(j.total + (j.tip ?? 0))}</T>
                  <T variant="caption" color={j.status === 'cancelled' ? p.danger : live ? p.accent : p.textMuted}>
                    {label[j.status]}
                  </T>
                </View>
              </Row>
              {j.pro && (
                <Row gap={8}>
                  <Ionicons name="person-circle-outline" size={18} color={p.textMuted} />
                  <T variant="caption" muted style={{ flex: 1 }}>
                    {j.pro.name}
                    {j.rating ? ` · you rated ${j.rating}★` : ''}
                  </T>
                  {live && <Ionicons name="chevron-forward" size={18} color={p.accent} />}
                </Row>
              )}
            </Card>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
