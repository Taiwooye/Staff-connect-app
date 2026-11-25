import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProCard } from '@/components/pro-card';
import { Button, PaletteProvider, Row, T, tap } from '@/components/ui';
import { demoPros, type IconName, services } from '@/lib/catalog';
import { brand, clientPalette as p, providerPalette as dark, radius } from '@/lib/theme';

const featured = ['p1', 'p8', 'p4', 'p5'].map((id) => demoPros.find((x) => x.id === id)!);

const steps = [
  { n: '01', title: 'Choose', body: 'Compare trusted pros by rating, price and reviews.' },
  { n: '02', title: 'Book', body: 'Pick a time. Your pro accepts and is on the way.' },
  { n: '03', title: 'Relax', body: 'Pay by transfer when the job is done, then rate.' },
];

const introPoints = [
  'Tell us the help you need, where, and when.',
  'Compare ID-checked pros by rating, price and reviews.',
  'Agree on the job up front, then pay once it is done.',
];

const faqs = [
  {
    q: 'What is StaffConnect?',
    a: 'An app that connects homes with trusted cleaners, nannies, cooks, drivers and more, so you can book help near you in a few taps.',
  },
  {
    q: 'How are pros checked?',
    a: 'Every pro is ID-checked before they can take jobs, and each visit starts with a private code that only you have.',
  },
  {
    q: 'How do I pay?',
    a: 'Pay by bank transfer when the job is done, then rate your pro. You see the price before you book.',
  },
  {
    q: 'I want to work. How do I join?',
    a: 'Tap Join as a pro, set up your services and rate. You keep 90% of every job and get paid every Friday.',
  },
];

const trust: { icon: IconName; text: string }[] = [
  { icon: 'shield-checkmark', text: 'ID-checked pros' },
  { icon: 'key', text: 'Private start code' },
  { icon: 'lock-closed', text: 'Secure payments' },
];

export default function Landing() {
  const insets = useSafeAreaInsets();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const go = (role: 'client' | 'provider') => {
    tap('medium');
    router.push({ pathname: '/onboarding/role', params: { role } });
  };

  return (
    <PaletteProvider palette={p}>
      <ScrollView style={{ backgroundColor: p.bg }} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }} showsVerticalScrollIndicator={false}>
        <View style={styles.heroWrap}>
          {/* Background photo, washed out so the text stays easy to read */}
          <Image
            source={require('../../assets/images/home-hero.jpg')}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            contentPosition="center"
            transition={300}
            accessible={false}
          />
          <LinearGradient
            colors={['rgba(251,248,242,0.95)', 'rgba(251,248,242,0.88)', p.bg]}
            locations={[0, 0.6, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          {/* Warm amber and orange glows, as on the web hero */}
          <View pointerEvents="none" style={[styles.glow, { top: -120, right: -140, backgroundColor: 'rgba(253,230,138,0.35)' }]} />
          <View pointerEvents="none" style={[styles.glow, { bottom: -180, left: -160, backgroundColor: 'rgba(255,237,213,0.8)' }]} />

          {/* Header */}
          <Row style={[styles.pad, { paddingTop: insets.top + 14, justifyContent: 'space-between' }]}>
            <Row gap={8}>
              <View style={styles.logo}>
                <Ionicons name="home" size={15} color={brand.amber300} />
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
            <Row gap={8} style={styles.eyebrow}>
              <View style={styles.eyebrowDot} />
              <T variant="overline" color={brand.amber800}>
                Lagos · Oyo
              </T>
            </Row>
            <T style={styles.headline}>
              Trusted help at home, <T style={[styles.headline, { color: brand.amber600 }]}>when you need it.</T>
            </T>
            <T muted style={{ fontSize: 17, lineHeight: 25 }}>
              Book vetted cleaners, nannies, cooks and drivers near you.
            </T>
            <Button label="Find help" icon="search" onPress={() => go('client')} style={{ marginTop: 12 }} />
            <Pressable onPress={() => go('provider')} style={({ pressed }) => [styles.workBtn, { opacity: pressed ? 0.8 : 1 }]} accessibilityRole="button">
              <T variant="label" color={brand.amber950}>
                Looking for work? Join as a pro
              </T>
            </Pressable>
          </View>
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

        {/* Introduction */}
        <View style={[styles.pad, styles.section]}>
          <View>
            <Image
              source={require('../../assets/images/home-intro.jpg')}
              style={styles.introImage}
              contentFit="cover"
              transition={300}
              accessibilityLabel="Two people cooking together in a bright home kitchen"
            />
            <Row gap={8} style={styles.introBadge}>
              <Ionicons name="location" size={16} color={brand.amber600} />
              <T variant="caption" style={{ fontWeight: '700' }}>
                Launching in Lagos & Oyo
              </T>
            </Row>
          </View>
          <View style={{ gap: 10, marginTop: 8 }}>
            <T variant="overline" color={brand.amber700}>
              Welcome to StaffConnect
            </T>
            <T style={styles.h2}>Good help at home shouldn’t depend on who you know.</T>
            <T muted style={{ lineHeight: 23 }}>
              Most families find a nanny, cleaner or cook by word of mouth, and most pros find work the same way.
              StaffConnect brings both sides together, so you can see who’s available, what they do best and what it
              costs.
            </T>
          </View>
          <View style={{ gap: 12 }}>
            {introPoints.map((point) => (
              <Row key={point} gap={10} style={{ alignItems: 'flex-start' }}>
                <View style={styles.check}>
                  <Ionicons name="checkmark" size={13} color={brand.emerald700} />
                </View>
                <T style={{ flex: 1 }}>{point}</T>
              </Row>
            ))}
          </View>
        </View>

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
                <Ionicons name={t.icon} size={20} color={brand.amber600} />
                <T variant="caption" style={{ textAlign: 'center' }}>
                  {t.text}
                </T>
              </View>
            ))}
          </Row>
        </View>

        {/* FAQ */}
        <View style={[styles.pad, styles.section]}>
          <T style={styles.h2}>Good to know</T>
          <View style={styles.faq}>
            {faqs.map((item, i) => {
              const open = openFaq === i;
              return (
                <View key={item.q} style={i > 0 && styles.faqDivider}>
                  <Pressable
                    onPress={() => {
                      tap();
                      setOpenFaq(open ? null : i);
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: open }}
                    style={styles.faqQuestion}>
                    <T variant="label" style={{ flex: 1 }}>
                      {item.q}
                    </T>
                    <Ionicons name={open ? 'remove' : 'add'} size={20} color={p.accent} />
                  </Pressable>
                  {open && (
                    <T muted style={styles.faqAnswer}>
                      {item.a}
                    </T>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* For pros */}
        <View style={[styles.pad, styles.section]}>
          <View style={styles.proCta}>
            <T variant="overline" color={brand.amber300}>
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
  glow: { position: 'absolute', width: 380, height: 380, borderRadius: 190 },
  eyebrow: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderWidth: 1,
    borderColor: brand.amber200,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  eyebrowDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: brand.emerald500 },
  workBtn: {
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: brand.amber300,
    backgroundColor: brand.amber50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroWrap: { paddingBottom: 8, overflow: 'hidden' },
  introImage: { width: '100%', aspectRatio: 4 / 3, borderRadius: radius.lg, backgroundColor: p.surfaceAlt },
  introBadge: {
    position: 'absolute',
    left: 14,
    bottom: -14,
    backgroundColor: p.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: p.border,
  },
  check: { width: 22, height: 22, borderRadius: 11, backgroundColor: brand.emerald100, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  faq: { backgroundColor: p.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: p.border, paddingHorizontal: 18 },
  faqDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderColor: p.border },
  faqQuestion: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16 },
  faqAnswer: { paddingBottom: 16, lineHeight: 22 },
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
  stepNum: { fontSize: 15, fontWeight: '800', color: brand.amber600, width: 28, marginTop: 2 },
  trust: { marginTop: 8, paddingVertical: 16, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: p.border },
  proCta: { backgroundColor: brand.navy, borderRadius: radius.lg, padding: 24, gap: 8 },
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
