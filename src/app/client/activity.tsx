import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, Button, Card, Row, T } from '@/components/ui';
import { getService } from '@/lib/catalog';
import { clientJobHref, type ClientJobStatus, useStore } from '@/lib/store';
import { clientPalette as p, formatNaira } from '@/lib/theme';

const label: Record<ClientJobStatus, string> = {
  choosing: 'Choose a pro',
  searching: 'Waiting for reply',
  accepted: 'On the way',
  arrived: 'Arrived',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function Activity() {
  const insets = useSafeAreaInsets();
  const { state, activeClientJob } = useStore();
  const jobs = state.clientJobs;
  const toRate = jobs.filter((j) => j.status === 'completed' && j.pro && j.rating === undefined);

  return (
    <ScrollView style={{ backgroundColor: p.bg }} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16, gap: 14, paddingBottom: 40 }}>
      <T variant="title">Bookings</T>

      {toRate.length > 0 && (
        <Card style={{ backgroundColor: p.accentSoft, borderColor: p.accentSoft, gap: 4 }}>
          <Row gap={8}>
            <Ionicons name="star" size={18} color="#C98A0B" />
            <T variant="label">
              {toRate.length === 1 ? '1 booking is waiting for your rating' : `${toRate.length} bookings are waiting for your rating`}
            </T>
          </Row>
          <T variant="caption" muted>
            Your rating helps other households choose, and helps good pros get more work.
          </T>
        </Card>
      )}

      {jobs.length === 0 && (
        <Card style={{ alignItems: 'center', gap: 12, paddingVertical: 32 }}>
          <Ionicons name="calendar-outline" size={40} color={p.textMuted} />
          <T variant="heading">No bookings yet</T>
          <T muted style={{ textAlign: 'center' }}>
            When you book help, you’ll find live status, receipts and ratings here.
          </T>
          <Button label="Book help" size="md" onPress={() => router.navigate('/client')} />
        </Card>
      )}

      {jobs.map((j) => {
        const s = getService(j.serviceId);
        const live = activeClientJob?.id === j.id && j.status !== 'completed';
        const needsRating = j.status === 'completed' && j.pro && j.rating === undefined;
        return (
          <Pressable key={j.id} disabled={!live} onPress={() => router.push(clientJobHref(j))}>
            <Card style={{ gap: 12, borderColor: live || needsRating ? p.accent : p.border }}>
              <Row>
                <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: s.tint, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name={s.icon} size={22} color={p.text} />
                </View>
                <View style={{ flex: 1 }}>
                  <T variant="label">{s.label}</T>
                  <T variant="caption" muted>
                    {new Date(j.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })} · {j.area} · {j.hours} hrs
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
                <Row gap={10}>
                  <Avatar initials={j.pro.initials} color={j.pro.color} size={32} />
                  <T variant="label" style={{ flex: 1 }}>
                    {j.pro.name}
                  </T>
                  {j.rating !== undefined ? (
                    <Row gap={2} accessibilityLabel={`You rated ${j.rating} out of 5`}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Ionicons key={n} name={n <= j.rating! ? 'star' : 'star-outline'} size={16} color="#F5B32F" />
                      ))}
                    </Row>
                  ) : live ? (
                    <Ionicons name="chevron-forward" size={18} color={p.accent} />
                  ) : null}
                </Row>
              )}

              {needsRating && (
                <Button label={`Rate ${j.pro!.name.split(' ')[0]}`} icon="star" size="md" onPress={() => router.push(`/rate/${j.id}`)} />
              )}
              {live && !j.pro && (
                <Button label={j.status === 'choosing' ? 'Choose your pro' : 'View request'} size="md" onPress={() => router.push(clientJobHref(j))} />
              )}
            </Card>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
