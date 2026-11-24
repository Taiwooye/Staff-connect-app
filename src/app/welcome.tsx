import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProCard } from '@/components/pro-card';
import { Button, PaletteProvider, Row, T, tap } from '@/components/ui';
import { demoPros, type IconName, services } from '@/lib/catalog';
import { clientPalette as p, providerPalette as dark, radius } from '@/lib/theme';

const featured = ['p1', 'p8', 'p4', 'p5'].map((id) => demoPros.find((x) => x.id === id)!);

const steps = [
  { n: '01', title: 'Choose', body: 'Compare trusted pros by rating, price and reviews.' },
  { n: '02', title: 'Book', body: 'Pick a time. Your pro accepts and is on the way.' },
  { n: '03', title: 'Relax', body: 'Pay by transfer when the job is done, then rate.' },
];

const trust: { icon: IconName; text: string }[] = [
  { icon: 'shield-checkmark', text: 'ID-checked pros' },
  { icon: 'key', text: 'Private start code' },
  { icon: 'lock-closed', text: 'Secure payments' },
];

export default function Landing() {
  const insets = useSafeAreaInsets();
  const go = (role: 'client' | 'provider') => {
    tap('medium');
    router.push({ pathname: '/onboarding/role', params: { role } });
  };

  return (
    <PaletteProvider palette={p}>
      <ScrollView style={{ backgroundColor: p.bg }} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Row style={[styles.pad, { paddingTop: insets.top + 14, justifyContent: 'space-between' }]}>
          <Row gap={8}>
            <View style={styles.logo}>
              <Ionicons name="people" size={16} color="#fff" />
            </View>
            <T variant="heading">StaffConnect</T>
          </Row>
          <Pressable onPress={() => router.push('/onboarding/role')} hitSlop={10} accessibilityRole="button">
            <T variant="label" color={p.accent}>
              Sign in
            </T>
          </Pressable>
        </Row>

        {/* Hero */}
        <View style={[styles.pad, { paddingTop: 40, gap: 14 }]}>
          <T variant="overline" color={p.accent}>
            Lagos · Oyo
          </T>
          <T style={styles.headline}>Trusted help at home, when you need it.</T>
          <T muted style={{ fontSize: 17, lineHeight: 25 }}>
            Book vetted cleaners, nannies, cooks and drivers near you.
          </T>
          <Button label="Find help" icon="search" onPress={() => go('client')} style={{ marginTop: 12 }} />
          <Pressable onPress={() => go('provider')} hitSlop={8} style={{ alignSelf: 'center', paddingVertical: 6 }} accessibilityRole="button">
            <T muted>
              Looking for work?{' '}
              <T variant="label" color={p.accent}>
                Join as a pro
              </T>
            </T>
          </Pressable>
        </View>

        {/* Quick picks */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.pad, { gap: 8, paddingTop: 24 }]}>
          {services.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => router.push({ pathname: '/pros', params: { service: s.id } })}
              accessibilityRole="button"
              style={({ pressed }) => [styles.chip, { opacity: pressed ? 0.7 : 1 }]}>
              <Ionicons name={s.icon} size={16} color={p.text} />
              <T variant="label" style={{ fontSize: 14 }}>
                {s.short}
              </T>
            </Pressable>
          ))}
        </ScrollView>

        {/* Profiles */}
        <View style={[styles.pad, styles.section]}>
          <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <View style={{ gap: 4, flex: 1 }}>
              <T style={styles.h2}>Meet our pros</T>
              <T muted>Real ratings. Clear prices. You choose.</T>
            </View>
            <Pressable onPress={() => router.push('/pros')} hitSlop={8}>
              <T variant="label" color={p.accent}>
                View all
              </T>
            </Pressable>
          </Row>
          <View style={styles.grid}>
            {featured.map((pro, i) => (
              <ProCard key={pro.id} pro={pro} featured={i === 0} width="48%" />
            ))}
          </View>
        </View>

        {/* How it works */}
        <View style={[styles.pad, styles.section]}>
          <T style={styles.h2}>How it works</T>
          <View style={{ gap: 18 }}>
            {steps.map((s) => (
              <Row key={s.n} gap={16} style={{ alignItems: 'flex-start' }}>
                <T style={styles.stepNum}>{s.n}</T>
                <View style={{ flex: 1, gap: 2 }}>
                  <T variant="heading">{s.title}</T>
                  <T muted>{s.body}</T>
                </View>
              </Row>
            ))}
          </View>
          <Row gap={0} style={styles.trust}>
            {trust.map((t) => (
              <View key={t.text} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
                <Ionicons name={t.icon} size={20} color={p.accent} />
                <T variant="caption" style={{ textAlign: 'center' }}>
                  {t.text}
                </T>
              </View>
            ))}
          </Row>
        </View>

        {/* For pros */}
        <View style={[styles.pad, styles.section]}>
          <View style={styles.proCta}>
            <T variant="overline" color={dark.accent}>
              For professionals
            </T>
            <T variant="title" color={dark.text}>
              Earn on your own schedule.
            </T>
            <T color={dark.textMuted}>Keep 90% of every job. Get paid every Friday.</T>
            <Pressable onPress={() => go('provider')} style={styles.proBtn} accessibilityRole="button">
              <T variant="label" color={dark.accentText}>
                Join as a pro
              </T>
              <Ionicons name="arrow-forward" size={18} color={dark.accentText} />
            </Pressable>
          </View>
          <T variant="caption" muted style={{ textAlign: 'center' }}>
            Prototype · profiles shown are fictional examples.
          </T>
        </View>
      </ScrollView>
    </PaletteProvider>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 24 },
  section: { paddingTop: 48, gap: 20 },
  logo: { width: 30, height: 30, borderRadius: 9, backgroundColor: p.accent, alignItems: 'center', justifyContent: 'center' },
  headline: { fontSize: 40, lineHeight: 46, fontWeight: '800', letterSpacing: -1.2, color: p.text },
  h2: { fontSize: 24, lineHeight: 30, fontWeight: '800', letterSpacing: -0.5, color: p.text },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: p.surface,
    borderWidth: 1,
    borderColor: p.border,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 14 },
  stepNum: { fontSize: 15, fontWeight: '800', color: p.accent, width: 28, marginTop: 2 },
  trust: { marginTop: 8, paddingVertical: 16, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: p.border },
  proCta: { backgroundColor: dark.bg, borderRadius: radius.lg, padding: 24, gap: 8 },
  proBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: dark.accent,
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    height: 44,
  },
});
