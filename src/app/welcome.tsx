import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, type ScrollViewInstance, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CityMap } from '@/components/city-map';
import { Button, Row, T } from '@/components/ui';
import type { IconName } from '@/lib/catalog';
import { clientPalette as p, radius } from '@/lib/theme';

const slides: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'flash-outline',
    title: 'Trusted help,\nin minutes.',
    body: 'Cleaners, nannies, cooks, drivers and more — matched to you in Lagos and Oyo.',
  },
  {
    icon: 'navigate-outline',
    title: 'Track every step\nlive.',
    body: 'See who is coming, when they arrive, and start the job with a private code.',
  },
  {
    icon: 'wallet-outline',
    title: 'Work on your\nown terms.',
    body: 'Professionals go online when they want, accept nearby jobs and watch earnings grow.',
  },
];

export default function Welcome() {
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const [width, setWidth] = useState(0);
  const scroller = useRef<ScrollViewInstance>(null);

  const next = () => {
    if (index < slides.length - 1) {
      scroller.current?.scrollTo({ x: (index + 1) * width, animated: true });
      setIndex(index + 1);
    } else {
      router.push('/onboarding/role');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      <View style={styles.mapArea}>
        <CityMap
          palette={p}
          seed={3}
          pulseAt={{ x: 0.5, y: 0.55 }}
          markers={[
            { kind: 'home', at: { x: 0.5, y: 0.55 } },
            { kind: 'pro', at: { x: 0.2, y: 0.3 }, initials: 'AO', color: '#0F9D6B' },
            { kind: 'pro', at: { x: 0.78, y: 0.38 }, initials: 'TA', color: '#2C7BE5' },
            { kind: 'pro', at: { x: 0.68, y: 0.75 }, initials: 'CE', color: '#E07A2E' },
          ]}
        />
        <Row style={[styles.brand, { top: insets.top + 12 }]} gap={8}>
          <View style={styles.logo}>
            <Ionicons name="people" size={18} color="#fff" />
          </View>
          <T variant="heading">StaffConnect</T>
        </Row>
      </View>

      <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
        <View style={{ flex: 1 }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
          <ScrollView
            ref={scroller}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => width && setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}>
            {slides.map((s) => (
              <View key={s.title} style={{ width, gap: 12, paddingTop: 4 }}>
                <View style={styles.slideIcon}>
                  <Ionicons name={s.icon} size={22} color={p.accent} />
                </View>
                <T variant="display">{s.title}</T>
                <T muted>{s.body}</T>
              </View>
            ))}
          </ScrollView>
        </View>

        <Row gap={6} style={{ marginVertical: 18 }}>
          {slides.map((s, i) => (
            <View
              key={s.title}
              style={{
                height: 6,
                width: i === index ? 22 : 6,
                borderRadius: 3,
                backgroundColor: i === index ? p.accent : p.border,
              }}
            />
          ))}
        </Row>

        <Button label={index === slides.length - 1 ? 'Get started' : 'Next'} onPress={next} />
        <Button
          label="Skip"
          variant="ghost"
          size="md"
          style={{ marginTop: 4 }}
          onPress={() => router.push('/onboarding/role')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapArea: { flex: 1, minHeight: 260 },
  brand: {
    position: 'absolute',
    left: 20,
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
  },
  logo: { width: 28, height: 28, borderRadius: 14, backgroundColor: p.accent, alignItems: 'center', justifyContent: 'center' },
  sheet: {
    backgroundColor: p.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: 24,
    paddingTop: 28,
    height: 400,
    marginTop: -24,
  },
  slideIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: p.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
