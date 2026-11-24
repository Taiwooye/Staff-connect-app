import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, Button, Card, PaletteProvider, Row, shadow, T, tap } from '@/components/ui';
import { demoPros, getService, type IconName, sampleReviews, services } from '@/lib/catalog';
import { clientPalette as p, formatNaira, providerPalette as dark, radius } from '@/lib/theme';

const featured = ['p1', 'p8', 'p4', 'p5', 'p14', 'p7'].map((id) => demoPros.find((x) => x.id === id)!);

const steps: Record<'client' | 'provider', { icon: IconName; title: string; body: string }[]> = {
  client: [
    { icon: 'search', title: 'Tell us what you need', body: 'Pick a service, your area, when and for how long.' },
    { icon: 'people', title: 'Compare and choose', body: 'See matching pros with ratings, reviews and prices. You decide who to book.' },
    { icon: 'shield-checkmark', title: 'Track, pay, rate', body: 'Follow your pro live, start with a private code, pay by transfer and leave a review.' },
  ],
  provider: [
    { icon: 'person-add', title: 'Apply in 5 minutes', body: 'Add your services, areas, rate and ID. We review and approve you.' },
    { icon: 'flash', title: 'Get jobs near you', body: 'Go online for instant requests, or apply to ongoing jobs that match you.' },
    { icon: 'wallet', title: 'Get paid every Friday', body: 'Keep 90% of every payment. Automatic Friday payouts, or withdraw any time.' },
  ],
};

const trust: { icon: IconName; title: string; body: string }[] = [
  { icon: 'id-card', title: 'ID & reference checks', body: 'Every professional is reviewed before they can take jobs.' },
  { icon: 'key', title: 'Private start code', body: 'A job only starts when you share your 4-digit code.' },
  { icon: 'lock-closed', title: 'Secure transfers', body: 'Pay in the app. No cash needed, no surprises.' },
  { icon: 'star', title: 'Honest ratings', body: 'Only clients who completed a booking can leave a review.' },
];

export default function Landing() {
  const insets = useSafeAreaInsets();
  const [side, setSide] = useState<'client' | 'provider'>('client');
  const start = (role: 'client' | 'provider') => {
    tap('medium');
    router.push({ pathname: '/onboarding/role', params: { role } });
  };

  return (
    <PaletteProvider palette={p}>
      <View style={{ flex: 1, backgroundColor: p.bg }}>
        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }} showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <LinearGradient colors={['#0B7A53', '#0F9D6B', '#18B57E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.hero, { paddingTop: insets.top + 14 }]}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Row gap={8}>
                <View style={styles.logo}>
                  <Ionicons name="people" size={18} color={p.accent} />
                </View>
                <T variant="heading" color="#fff">
                  StaffConnect
                </T>
              </Row>
              <Pressable onPress={() => router.push('/onboarding/role')} hitSlop={8} accessibilityRole="button">
                <T variant="label" color="#fff">
                  Sign in
                </T>
              </Pressable>
            </Row>

            <View style={{ gap: 10, marginTop: 28 }}>
              <View style={styles.badge}>
                <Ionicons name="location" size={12} color="#fff" />
                <T variant="caption" color="#fff" style={{ fontWeight: '700' }}>
                  Now in Lagos & Oyo
                </T>
              </View>
              <T variant="display" color="#fff" style={{ fontSize: 36, lineHeight: 42 }}>
                Trusted help for your home, in minutes.
              </T>
              <T color="rgba(255,255,255,0.88)" style={{ fontSize: 16, lineHeight: 23 }}>
                Book vetted cleaners, nannies, cooks, drivers and more, or earn on your own schedule as a professional.
              </T>
            </View>

            <View style={{ gap: 10, marginTop: 24 }}>
              <Pressable onPress={() => start('client')} style={({ pressed }) => [styles.heroBtn, { backgroundColor: '#fff', opacity: pressed ? 0.9 : 1 }]} accessibilityRole="button">
                <Ionicons name="home" size={20} color={p.accent} />
                <View style={{ flex: 1 }}>
                  <T variant="label">I need help</T>
                  <T variant="caption" muted>
                    Find and book a professional
                  </T>
                </View>
                <Ionicons name="arrow-forward" size={20} color={p.text} />
              </Pressable>
              <Pressable onPress={() => start('provider')} style={({ pressed }) => [styles.heroBtn, { backgroundColor: dark.surface, opacity: pressed ? 0.9 : 1 }]} accessibilityRole="button">
                <Ionicons name="briefcase" size={20} color={dark.accent} />
                <View style={{ flex: 1 }}>
                  <T variant="label" color={dark.text}>
                    I want to work
                  </T>
                  <T variant="caption" color={dark.textMuted}>
                    Get jobs near you and get paid weekly
                  </T>
                </View>
                <Ionicons name="arrow-forward" size={20} color={dark.text} />
              </Pressable>
            </View>

            <Row style={{ justifyContent: 'space-between', marginTop: 24 }}>
              <Stat value="8" label="services" />
              <Stat value="10" label="areas covered" />
              <Stat value="90%" label="goes to pros" />
            </Row>
          </LinearGradient>

          <View style={{ padding: 20, gap: 32 }}>
            {/* Services */}
            <Section title="What we offer" subtitle="Everyday help, by people who do it well.">
              <View style={styles.grid}>
                {services.map((s) => (
                  <Pressable key={s.id} onPress={() => start('client')} style={styles.tile} accessibilityRole="button" accessibilityLabel={s.label}>
                    <View style={[styles.tileIcon, { backgroundColor: s.tint }]}>
                      <Ionicons name={s.icon} size={24} color={p.text} />
                    </View>
                    <T variant="caption" style={{ textAlign: 'center', fontWeight: '600' }}>
                      {s.short}
                    </T>
                    <T variant="caption" muted style={{ textAlign: 'center', fontSize: 11 }}>
                      from {formatNaira(s.hourlyRate)}/hr
                    </T>
                  </Pressable>
                ))}
              </View>
            </Section>

            {/* Featured pros */}
            <Section
              title="Meet some of our pros"
              subtitle="Tap a profile to see experience, rates and reviews."
              action={{ label: 'See all', onPress: () => router.push('/pros') }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 20 }} style={{ marginRight: -20 }}>
                {featured.map((pro) => (
                  <Pressable key={pro.id} onPress={() => router.push(`/pro/${pro.id}`)} accessibilityRole="button" accessibilityLabel={`View ${pro.name}`}>
                    <Card style={{ width: 200, gap: 10 }}>
                      <Row style={{ justifyContent: 'space-between' }}>
                        <Avatar initials={pro.initials} color={pro.color} size={52} />
                        <Row gap={3}>
                          <Ionicons name="star" size={13} color="#C98A0B" />
                          <T variant="label">{pro.rating.toFixed(1)}</T>
                        </Row>
                      </Row>
                      <View>
                        <T variant="label" numberOfLines={1}>
                          {pro.name}
                        </T>
                        <T variant="caption" muted numberOfLines={1}>
                          {pro.services.map((s) => getService(s).short).join(' · ')}
                        </T>
                      </View>
                      <T variant="caption" muted numberOfLines={2} style={{ minHeight: 36 }}>
                        “{pro.about}”
                      </T>
                      <Row style={{ justifyContent: 'space-between' }}>
                        <Row gap={4}>
                          <Ionicons name="location-outline" size={13} color={p.textMuted} />
                          <T variant="caption" muted>
                            {pro.area}
                          </T>
                        </Row>
                        <T variant="caption" style={{ fontWeight: '700' }}>
                          {formatNaira(pro.hourlyRate)}/hr
                        </T>
                      </Row>
                      <Row gap={4}>
                        <Ionicons name="shield-checkmark" size={13} color={p.accent} />
                        <T variant="caption" color={p.accent}>
                          {pro.jobs} jobs · {pro.years} yrs
                        </T>
                      </Row>
                    </Card>
                  </Pressable>
                ))}
              </ScrollView>
              <Button label="Browse all professionals" variant="secondary" icon="people" onPress={() => router.push('/pros')} />
            </Section>

            {/* How it works */}
            <Section title="How it works">
              <Row gap={0} style={styles.toggle}>
                {(['client', 'provider'] as const).map((k) => (
                  <Pressable
                    key={k}
                    onPress={() => setSide(k)}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: side === k }}
                    style={[styles.toggleBtn, side === k && { backgroundColor: p.surface, ...shadow(1) }]}>
                    <T variant="label" color={side === k ? p.text : p.textMuted}>
                      {k === 'client' ? 'For clients' : 'For professionals'}
                    </T>
                  </Pressable>
                ))}
              </Row>
              {steps[side].map((s, i) => (
                <Row key={s.title} style={{ alignItems: 'flex-start' }}>
                  <View style={styles.stepNum}>
                    <T variant="label" color="#fff">
                      {i + 1}
                    </T>
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Row gap={6}>
                      <Ionicons name={s.icon} size={16} color={p.accent} />
                      <T variant="label">{s.title}</T>
                    </Row>
                    <T muted variant="caption">
                      {s.body}
                    </T>
                  </View>
                </Row>
              ))}
              <Button label={side === 'client' ? 'Find help now' : 'Start earning'} onPress={() => start(side)} />
            </Section>

            {/* Trust */}
            <Section title="Safe by design">
              <View style={styles.grid2}>
                {trust.map((t) => (
                  <Card key={t.title} style={styles.trustCard}>
                    <Ionicons name={t.icon} size={22} color={p.accent} />
                    <T variant="label">{t.title}</T>
                    <T variant="caption" muted>
                      {t.body}
                    </T>
                  </Card>
                ))}
              </View>
            </Section>

            {/* Pricing */}
            <Section title="Simple, honest pricing">
              <Card style={{ gap: 12 }}>
                <Row style={{ alignItems: 'flex-start' }}>
                  <Ionicons name="home-outline" size={22} color={p.accent} />
                  <View style={{ flex: 1 }}>
                    <T variant="label">Clients pay the price you see</T>
                    <T variant="caption" muted>
                      No booking fees added on top. Pay by bank transfer after the job.
                    </T>
                  </View>
                </Row>
                <Row style={{ alignItems: 'flex-start' }}>
                  <Ionicons name="briefcase-outline" size={22} color={p.accent} />
                  <View style={{ flex: 1 }}>
                    <T variant="label">Professionals keep 90%</T>
                    <T variant="caption" muted>
                      A flat 10% service fee per payment, with no sign-up or monthly fees. Paid out every Friday.
                    </T>
                  </View>
                </Row>
              </Card>
            </Section>

            {/* Reviews */}
            <Section title="What clients say" subtitle="Sample reviews">
              {[featured[0], featured[1]].map((pro) => {
                const r = sampleReviews(pro)[0];
                return (
                  <Card key={pro.id} style={{ gap: 8 }}>
                    <Row gap={2}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Ionicons key={n} name={n <= r.rating ? 'star' : 'star-outline'} size={14} color="#F5B32F" />
                      ))}
                    </Row>
                    <T>“{r.text}”</T>
                    <T variant="caption" muted>
                      {r.author} · booked {pro.name.split(' ')[0]} for {getService(pro.services[0]).short.toLowerCase()}
                    </T>
                  </Card>
                );
              })}
            </Section>

            {/* Final CTA */}
            <View style={styles.cta}>
              <T variant="title" color="#fff">
                Ready to get started?
              </T>
              <T color="rgba(255,255,255,0.75)">It takes about a minute to sign up.</T>
              <Button label="I need help" icon="home" onPress={() => start('client')} />
              <Pressable onPress={() => start('provider')} style={styles.ctaGhost} accessibilityRole="button">
                <Ionicons name="briefcase" size={18} color={dark.accent} />
                <T variant="label" color="#fff">
                  I want to work
                </T>
              </Pressable>
            </View>

            <T variant="caption" muted style={{ textAlign: 'center' }}>
              StaffConnect prototype · Profiles and reviews shown are fictional examples.
            </T>
          </View>
        </ScrollView>
      </View>
    </PaletteProvider>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <T variant="title" color="#fff">
        {value}
      </T>
      <T variant="caption" color="rgba(255,255,255,0.8)">
        {label}
      </T>
    </View>
  );
}

function Section({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: { label: string; onPress: () => void };
  children: ReactNode;
}) {
  return (
    <View style={{ gap: 14 }}>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <View style={{ flex: 1, gap: 2 }}>
          <T variant="title" style={{ fontSize: 22, lineHeight: 28 }}>
            {title}
          </T>
          {subtitle && <T muted>{subtitle}</T>}
        </View>
        {action && (
          <Pressable onPress={action.onPress} hitSlop={8}>
            <T variant="label" color={p.accent}>
              {action.label}
            </T>
          </Pressable>
        )}
      </Row>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: 20, paddingBottom: 28, borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl },
  logo: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  heroBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: radius.md, padding: 16, ...shadow(2) },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 18 },
  tile: { width: '25%', alignItems: 'center', gap: 6 },
  tileIcon: { width: 60, height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  toggle: { backgroundColor: p.surfaceAlt, borderRadius: radius.md, padding: 4 },
  toggleBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12 },
  stepNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: p.accent, alignItems: 'center', justifyContent: 'center' },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  trustCard: { width: '47.5%', gap: 6, flexGrow: 1 },
  cta: { backgroundColor: dark.bg, borderRadius: radius.lg, padding: 22, gap: 12 },
  ctaGhost: {
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
