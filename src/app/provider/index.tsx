import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { CityMap } from '@/components/city-map';
import { InboxBell } from '@/components/notifications';
import { Button, Card, Row, shadow, Stars, T, tap } from '@/components/ui';
import { getService } from '@/lib/catalog';
import { matchJobs, RECOMMENDED_THRESHOLD } from '@/lib/matching';
import { acceptanceRate, type Offer, useNow, useStore } from '@/lib/store';
import { formatNaira, providerPalette as p, radius } from '@/lib/theme';

const ME = { x: 0.5, y: 0.48 };

function startOfDay() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export default function ProviderHome() {
  const insets = useSafeAreaInsets();
  const { state, dispatch, activeProviderJob } = useStore();
  const online = state.online;
  const pp = state.providerProfile!;

  const today = state.providerJobs
    .filter((j) => j.status === 'completed' && (j.completedAt ?? 0) >= startOfDay())
    .reduce((s, j) => s + j.pay, 0);
  const acceptance = acceptanceRate(state);
  const jobMatches = matchJobs(pp, state.profile?.state ?? 'Lagos').filter((m) => m.score >= RECOMMENDED_THRESHOLD).length;
  const hired = state.applications.filter((a) => a.status === 'hired').length;
  const pending = state.applications.find((a) => a.status === 'offered') ?? state.applications.find((a) => a.status === 'hired');

  const toggle = () => {
    tap('heavy');
    dispatch({ type: 'setOnline', online: !online });
  };

  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      <CityMap
        palette={p}
        seed={21}
        pulseAt={online && !state.incoming ? ME : undefined}
        markers={[
          { kind: 'me', at: ME },
          ...(online
            ? [
                { kind: 'job' as const, at: { x: 0.22, y: 0.3 }, icon: 'sparkles-outline' as const },
                { kind: 'job' as const, at: { x: 0.8, y: 0.24 }, icon: 'restaurant-outline' as const },
                { kind: 'job' as const, at: { x: 0.74, y: 0.66 }, icon: 'happy-outline' as const },
              ]
            : []),
        ]}
      />

      <Row style={[styles.top, { top: insets.top + 10 }]}>
        <View style={{ width: 44 }} />
        <Pressable onPress={() => router.navigate('/provider/earnings')} style={styles.earnPill}>
          <T variant="overline" muted>
            Today
          </T>
          <T variant="heading">{formatNaira(today)}</T>
        </Pressable>
        <InboxBell />
      </Row>
      <Pressable
        onPress={() => (pending ? router.push(`/job/${pending.jobId}`) : router.navigate('/provider/jobs'))}
        style={[styles.jobsPill, { top: insets.top + 74 }]}
        accessibilityRole="button">
        <Ionicons
          name={pending?.status === 'offered' ? 'gift' : hired ? 'checkmark-circle' : 'sparkles'}
          size={16}
          color={pending?.status === 'offered' ? p.accent : hired ? p.success : p.accent}
        />
        <View>
          <T variant="label">
            {pending?.status === 'offered' ? 'You have a job offer!' : hired ? `Hired for ${hired} job${hired > 1 ? 's' : ''}` : `${jobMatches} jobs match you`}
          </T>
          <T variant="caption" muted>
            {pending?.status === 'offered' ? 'Tap to accept' : hired ? 'See start date' : 'Ongoing work · apply now'}
          </T>
        </View>
        <Ionicons name="chevron-forward" size={16} color={p.textMuted} />
      </Pressable>
      <View style={[styles.stats, { top: insets.top + 74 }]}>
        <Stat icon="checkmark-done" value={`${acceptance}%`} label="Acceptance" />
        <Stat icon="star" value="4.9" label="Rating" />
      </View>

      <View style={styles.bottom}>
        {activeProviderJob ? (
          <Pressable onPress={() => router.push(`/work/${activeProviderJob.id}`)} style={[styles.sheet, { flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
            <Ionicons name={getService(activeProviderJob.serviceId).icon} size={28} color={p.accent} />
            <View style={{ flex: 1 }}>
              <T variant="heading">Continue current job</T>
              <T muted variant="caption">
                {activeProviderJob.clientName} · {activeProviderJob.area}
              </T>
            </View>
            <Ionicons name="chevron-forward" size={22} color={p.text} />
          </Pressable>
        ) : (
          <>
            {!online && (
              <Pressable accessibilityRole="button" accessibilityLabel="Go online" onPress={toggle} style={styles.goWrap}>
                <GoButton />
              </Pressable>
            )}
            <View style={styles.sheet}>
              <Row style={{ justifyContent: 'space-between' }}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Row gap={8}>
                    <View style={[styles.dot, { backgroundColor: online ? p.success : p.textMuted }]} />
                    <T variant="heading">{online ? 'You’re online' : 'You’re offline'}</T>
                  </Row>
                  <T muted variant="caption">
                    {online
                      ? `Finding ${pp.services.map((s) => getService(s).short.toLowerCase()).join(', ')} jobs in ${pp.areas.join(', ')}`
                      : 'Go online to start receiving job requests.'}
                  </T>
                </View>
                {online && (
                  <Pressable onPress={toggle} style={styles.offBtn} accessibilityRole="button">
                    <Ionicons name="power" size={22} color={p.danger} />
                  </Pressable>
                )}
              </Row>
              {online && <ScanBar />}
            </View>
          </>
        )}
      </View>

      {state.incoming && !activeProviderJob && <IncomingOffer offer={state.incoming} />}
    </View>
  );
}

function Stat({ icon, value, label }: { icon: 'checkmark-done' | 'star'; value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={14} color={p.accent} />
      <T variant="label">{value}</T>
      <T variant="caption" muted>
        {label}
      </T>
    </View>
  );
}

const useNative = Platform.OS !== 'web';

function GoButton() {
  const v = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: useNative }),
        Animated.timing(v, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: useNative }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v]);
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={[
          styles.goHalo,
          { transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] }) }], opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.1] }) },
        ]}
      />
      <View style={styles.go}>
        <T variant="title" color={p.accentText}>
          GO
        </T>
      </View>
    </View>
  );
}

function ScanBar() {
  const v = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(v, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: useNative }));
    loop.start();
    return () => loop.stop();
  }, [v]);
  return (
    <View style={{ height: 4, borderRadius: 2, backgroundColor: p.surfaceAlt, overflow: 'hidden', marginTop: 14 }}>
      <Animated.View
        style={{
          width: '35%',
          height: 4,
          borderRadius: 2,
          backgroundColor: p.accent,
          transform: [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [-140, 400] }) }],
        }}
      />
    </View>
  );
}

function IncomingOffer({ offer }: { offer: Offer }) {
  const insets = useSafeAreaInsets();
  const { dispatch } = useStore();
  const now = useNow(200);
  const service = getService(offer.serviceId);
  const total = offer.expiresAt - offer.createdAt;
  const left = Math.max(0, offer.expiresAt - now);
  const frac = left / total;
  const R = 26;
  const C = 2 * Math.PI * R;

  useEffect(() => {
    tap('heavy');
  }, [offer.id]);

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }]}>
      <View style={[styles.offer, { paddingBottom: insets.bottom + 20 }]}>
        <Row style={{ justifyContent: 'space-between' }}>
          <View style={{ gap: 4, flex: 1 }}>
            <T variant="overline" color={p.accent}>
              New job request
            </T>
            <T variant="display">{formatNaira(offer.pay)}</T>
            <T muted variant="caption">
              You receive · client pays {formatNaira(offer.gross)} · 10% service fee −{formatNaira(offer.gross - offer.pay)}
            </T>
            <Row gap={6} style={{ marginTop: 4 }}>
              <Ionicons
                name={offer.payment === 'cash' ? 'cash-outline' : 'swap-horizontal-outline'}
                size={14}
                color={offer.payment === 'cash' ? p.warning : p.success}
              />
              <T variant="caption" color={offer.payment === 'cash' ? p.warning : p.success}>
                {offer.payment === 'cash'
                  ? `Cash job · ${formatNaira(offer.gross - offer.pay)} fee taken from your balance`
                  : 'Paid by transfer straight to your balance'}
              </T>
            </Row>
          </View>
          <View style={{ width: 64, height: 64, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={64} height={64} style={StyleSheet.absoluteFill}>
              <Circle cx={32} cy={32} r={R} stroke={p.surfaceAlt} strokeWidth={5} fill="none" />
              <Circle
                cx={32}
                cy={32}
                r={R}
                stroke={frac < 0.3 ? p.danger : p.accent}
                strokeWidth={5}
                fill="none"
                strokeDasharray={`${C} ${C}`}
                strokeDashoffset={C * (1 - frac)}
                strokeLinecap="round"
                transform="rotate(-90 32 32)"
              />
            </Svg>
            <T variant="heading">{Math.ceil(left / 1000)}</T>
          </View>
        </Row>

        <Card style={{ gap: 14, backgroundColor: p.surfaceAlt }}>
          <Row>
            <View style={styles.svcIcon}>
              <Ionicons name={service.icon} size={24} color={p.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <T variant="heading">{service.label}</T>
              <T muted variant="caption">
                {offer.hours} hrs · Starts now
              </T>
            </View>
          </Row>
          <Row gap={18}>
            <Meta icon="navigate-outline" text={`${offer.distanceKm} km away`} />
            <Meta icon="location-outline" text={offer.area} />
          </Row>
          <Row style={{ justifyContent: 'space-between' }}>
            <Meta icon="person-outline" text={offer.clientName} />
            <Stars value={offer.clientRating} />
          </Row>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {offer.tasks.map((t) => (
              <View key={t} style={styles.task}>
                <T variant="caption">{t}</T>
              </View>
            ))}
          </View>
        </Card>

        <Row gap={12}>
          <Pressable
            accessibilityLabel="Decline"
            onPress={() => {
              tap();
              dispatch({ type: 'dismissOffer' });
            }}
            style={styles.decline}>
            <Ionicons name="close" size={28} color={p.text} />
          </Pressable>
          <Button
            label="Accept job"
            icon="checkmark"
            style={{ flex: 1, height: 64 }}
            onPress={() => {
              tap('success');
              dispatch({ type: 'acceptOffer', now: Date.now() });
              router.push(`/work/${offer.id}`);
            }}
          />
        </Row>
      </View>
    </View>
  );
}

function Meta({ icon, text }: { icon: 'navigate-outline' | 'location-outline' | 'person-outline'; text: string }) {
  return (
    <Row gap={6}>
      <Ionicons name={icon} size={16} color={p.textMuted} />
      <T variant="label">{text}</T>
    </Row>
  );
}

const styles = StyleSheet.create({
  top: { position: 'absolute', left: 16, right: 16, justifyContent: 'space-between' },
  earnPill: { backgroundColor: p.surface, borderRadius: radius.pill, paddingHorizontal: 22, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: p.border, ...shadow(3) },
  jobsPill: {
    position: 'absolute',
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: p.surface,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: p.border,
    ...shadow(3),
  },
  stats: { position: 'absolute', right: 16, gap: 8 },
  stat: { backgroundColor: p.surface, borderRadius: radius.md, padding: 10, alignItems: 'center', minWidth: 84, borderWidth: 1, borderColor: p.border },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, gap: 20 },
  sheet: { backgroundColor: p.surface, borderRadius: radius.lg, padding: 18, borderWidth: 1, borderColor: p.border, ...shadow(3) },
  dot: { width: 10, height: 10, borderRadius: 5 },
  offBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: p.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  goWrap: { alignSelf: 'center' },
  go: { width: 96, height: 96, borderRadius: 48, backgroundColor: p.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: p.bg, ...shadow(3) },
  goHalo: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: p.accent },
  offer: { backgroundColor: p.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: 20, gap: 16 },
  svcIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: p.accentSoft, alignItems: 'center', justifyContent: 'center' },
  task: { backgroundColor: p.surface, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5 },
  decline: { width: 64, height: 64, borderRadius: 18, backgroundColor: p.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
});
