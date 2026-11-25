import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CityMap } from '@/components/city-map';
import { MatchBadge } from '@/components/match-badge';
import { Avatar, Card, Row, shadow, Stars, T, tap } from '@/components/ui';
import { demoPros, getService, services } from '@/lib/catalog';
import { matchPros } from '@/lib/matching';
import { clientJobHref, useStore } from '@/lib/store';
import { clientPalette as p, formatNaira, radius } from '@/lib/theme';

const statusCopy = {
  choosing: 'Choose your pro',
  searching: 'Waiting for your pro to accept',
  accepted: 'Your pro is on the way',
  arrived: 'Your pro has arrived',
  in_progress: 'Job in progress',
  completed: 'Job done — rate your pro',
  cancelled: 'Cancelled',
} as const;

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export default function ClientHome() {
  const insets = useSafeAreaInsets();
  const { state, activeClientJob } = useStore();
  const first = state.profile?.name.split(' ')[0] ?? 'there';
  const lastCompleted = state.clientJobs.find((j) => j.status === 'completed');
  const matches = state.clientPrefs && state.profile ? matchPros(state.clientPrefs, state.profile) : null;
  const mapPros = (matches?.length ? matches.map((m) => m.item) : demoPros).slice(0, 3);
  const spots = [
    { x: 0.18, y: 0.35 },
    { x: 0.82, y: 0.3 },
    { x: 0.72, y: 0.82 },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      <View style={{ height: 260 }}>
        <CityMap
          palette={p}
          seed={11}
          markers={[
            { kind: 'home', at: { x: 0.5, y: 0.62 }, label: state.profile?.area },
            ...mapPros.map((pro, i) => ({ kind: 'pro' as const, at: spots[i], initials: pro.initials, color: pro.color })),
          ]}
        />
        <Row style={[styles.topBar, { top: insets.top + 10 }]}>
          <View style={styles.pill}>
            <Ionicons name="location" size={16} color={p.accent} />
            <T variant="label">
              {state.profile?.area}, {state.profile?.state}
            </T>
          </View>
          <View style={[styles.pill, { paddingHorizontal: 10 }]}>
            <View style={styles.liveDot} />
            <T variant="caption">12 pros nearby</T>
          </View>
        </Row>
      </View>

      <ScrollView
        style={styles.sheet}
        contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 22 }}
        showsVerticalScrollIndicator={false}>
        <View style={{ gap: 4 }}>
          <T muted>
            {greeting()}, {first}
          </T>
          <T variant="title">What do you need help with?</T>
        </View>

        {activeClientJob && (
          <Pressable onPress={() => router.push(clientJobHref(activeClientJob))}>
            <Row style={styles.activeBanner}>
              <View style={styles.activeIcon}>
                <Ionicons name={getService(activeClientJob.serviceId).icon} size={22} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <T variant="label" color="#fff">
                  {statusCopy[activeClientJob.status]}
                </T>
                <T variant="caption" color="rgba(255,255,255,0.8)">
                  {getService(activeClientJob.serviceId).label} · {activeClientJob.area}
                </T>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#fff" />
            </Row>
          </Pressable>
        )}

        <View style={styles.grid}>
          {services.map((s) => (
            <Pressable
              key={s.id}
              accessibilityRole="button"
              accessibilityLabel={`Book ${s.label}`}
              onPress={() => {
                tap();
                router.push(`/book/${s.id}`);
              }}
              style={({ pressed }) => [styles.tile, { opacity: pressed ? 0.7 : 1 }]}>
              <View style={[styles.tileIcon, { backgroundColor: s.tint }]}>
                <Ionicons name={s.icon} size={26} color={p.text} />
              </View>
              <T variant="caption" style={{ textAlign: 'center' }}>
                {s.short}
              </T>
            </Pressable>
          ))}
        </View>

        {lastCompleted && (
          <Pressable onPress={() => router.push(`/book/${lastCompleted.serviceId}`)}>
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Ionicons name="refresh-circle" size={36} color={p.accent} />
              <View style={{ flex: 1 }}>
                <T variant="label">Book {getService(lastCompleted.serviceId).short.toLowerCase()} again</T>
                <T variant="caption" muted>
                  {lastCompleted.hours} hrs · {formatNaira(lastCompleted.total)} last time
                </T>
              </View>
              <Ionicons name="chevron-forward" size={20} color={p.textMuted} />
            </Card>
          </Pressable>
        )}

        {matches ? (
          <View style={{ gap: 12 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <View>
                <T variant="heading">Matched for you</T>
                <T variant="caption" muted>
                  {state.clientPrefs!.services.map((id) => getService(id).short).join(', ')} · {state.clientPrefs!.frequency}
                </T>
              </View>
              <Pressable onPress={() => router.push('/matches')} hitSlop={8}>
                <T variant="label" color={p.accent}>
                  See all {matches.length}
                </T>
              </Pressable>
            </Row>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {matches.slice(0, 6).map(({ item: pro, score, reasons }) => (
                <Pressable key={pro.id} onPress={() => router.push(`/pro/${pro.id}`)}>
                  <Card style={{ width: 176, gap: 10 }}>
                    <Row style={{ justifyContent: 'space-between' }}>
                      <Avatar initials={pro.initials} color={pro.color} size={44} />
                      <MatchBadge score={score} />
                    </Row>
                    <View>
                      <T variant="label" numberOfLines={1}>
                        {pro.name}
                      </T>
                      <T variant="caption" muted numberOfLines={1}>
                        {reasons[1] ?? reasons[0]}
                      </T>
                    </View>
                    <Row style={{ justifyContent: 'space-between' }}>
                      <Stars value={pro.rating} size={13} color="#D97706" />
                      <T variant="caption" muted>
                        {formatNaira(pro.hourlyRate)}/hr
                      </T>
                    </Row>
                  </Card>
                </Pressable>
              ))}
              {matches.length === 0 && (
                <Card style={{ width: 260 }}>
                  <T muted>No matches in {state.profile?.state} yet for these services. Try booking — nearby pros are notified.</T>
                </Card>
              )}
            </ScrollView>
          </View>
        ) : (
          <Pressable onPress={() => router.push('/onboarding/needs')}>
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: p.accent }}>
              <Ionicons name="sparkles" size={28} color={p.accent} />
              <View style={{ flex: 1 }}>
                <T variant="label">Get matched with the right pro</T>
                <T variant="caption" muted>
                  Tell us what you need and we’ll suggest people near you.
                </T>
              </View>
              <Ionicons name="chevron-forward" size={20} color={p.textMuted} />
            </Card>
          </Pressable>
        )}

        <Card style={{ backgroundColor: p.accentSoft, borderColor: p.accentSoft, gap: 10 }}>
          <Row gap={10}>
            <Ionicons name="shield-checkmark" size={22} color={p.accent} />
            <T variant="heading">Safety on every booking</T>
          </Row>
          <T muted>
            Pros complete ID and reference checks, jobs start only with your private code, and you can share your
            booking status with family.
          </T>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { position: 'absolute', left: 16, right: 16, justifyContent: 'space-between' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: p.surface,
    paddingHorizontal: 14,
    height: 40,
    borderRadius: radius.pill,
    ...shadow(2),
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: p.accent },
  sheet: {
    flex: 1,
    marginTop: -28,
    backgroundColor: p.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  activeBanner: { backgroundColor: p.accent, borderRadius: radius.lg, padding: 14, ...shadow(2) },
  activeIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 16 },
  tile: { width: '25%', alignItems: 'center', gap: 8 },
  tileIcon: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
