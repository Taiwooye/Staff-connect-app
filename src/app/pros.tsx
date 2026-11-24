import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, Button, Card, Chip, IconButton, PaletteProvider, Row, T } from '@/components/ui';
import { demoPros, getService, launchStates, ratingWith, services } from '@/lib/catalog';
import { useStore } from '@/lib/store';
import { clientPalette as p, formatNaira, radius } from '@/lib/theme';

/** Public directory of professionals. Anyone can browse before signing up. */
export default function ProsDirectory() {
  const insets = useSafeAreaInsets();
  const { state } = useStore();
  const [query, setQuery] = useState('');
  const [svc, setSvc] = useState<string | null>(null);
  const [st, setSt] = useState<string | null>(state.profile?.state ?? null);

  const q = query.trim().toLowerCase();
  const list = demoPros
    .filter((pro) => (!svc || pro.services.includes(svc)) && (!st || pro.state === st))
    .filter((pro) => !q || [pro.name, pro.area, pro.about, ...pro.services.map((s) => getService(s).label)].some((x) => x.toLowerCase().includes(q)))
    .map((pro) => ({ pro, rating: ratingWith(pro, state.reviews.filter((r) => r.proId === pro.id)) }))
    .sort((a, b) => b.rating.average - a.rating.average || b.pro.jobs - a.pro.jobs);

  return (
    <PaletteProvider palette={p}>
      <View style={{ flex: 1, backgroundColor: p.bg }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, gap: 14, paddingBottom: state.profile ? 40 : 120 }} keyboardShouldPersistTaps="handled">
          <IconButton icon="arrow-back" label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
          <View style={{ gap: 4 }}>
            <T variant="title">Our professionals</T>
            <T muted>Every profile shows experience, rates and reviews. Tap one to learn more.</T>
          </View>

          <Row gap={8} style={{ height: 48, borderRadius: radius.pill, backgroundColor: p.surface, borderWidth: 1, borderColor: p.border, paddingHorizontal: 14 }}>
            <Ionicons name="search" size={18} color={p.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search by name, area or service"
              placeholderTextColor={p.textMuted}
              style={{ flex: 1, color: p.text, fontSize: 15, height: '100%' }}
            />
            {query ? (
              <Pressable accessibilityLabel="Clear search" onPress={() => setQuery('')} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={p.textMuted} />
              </Pressable>
            ) : null}
          </Row>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            <Chip label="All states" selected={!st} onPress={() => setSt(null)} />
            {launchStates.map((s) => (
              <Chip key={s} label={s} selected={st === s} onPress={() => setSt(s)} icon="location-outline" />
            ))}
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            <Chip label="All services" selected={!svc} onPress={() => setSvc(null)} />
            {services.map((s) => (
              <Chip key={s.id} label={s.short} icon={s.icon} selected={svc === s.id} onPress={() => setSvc(s.id)} />
            ))}
          </ScrollView>

          <T variant="caption" muted>
            {list.length} professional{list.length === 1 ? '' : 's'}
          </T>

          {list.length === 0 && (
            <Card style={{ alignItems: 'center', gap: 8, paddingVertical: 24 }}>
              <Ionicons name="search-outline" size={32} color={p.textMuted} />
              <T muted style={{ textAlign: 'center' }}>
                No professionals match yet. Try another service or state.
              </T>
            </Card>
          )}

          {list.map(({ pro, rating }) => (
            <Pressable key={pro.id} onPress={() => router.push(`/pro/${pro.id}`)} accessibilityRole="button" accessibilityLabel={`View ${pro.name}`}>
              <Card style={{ gap: 10 }}>
                <Row style={{ alignItems: 'flex-start' }}>
                  <Avatar initials={pro.initials} color={pro.color} size={56} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <T variant="heading">{pro.name}</T>
                    <Row gap={6}>
                      <Ionicons name="star" size={13} color="#C98A0B" />
                      <T variant="label">{rating.average.toFixed(1)}</T>
                      <T variant="caption" muted>
                        ({rating.count}) · {pro.years} yrs
                      </T>
                    </Row>
                    <T variant="caption" muted>
                      {pro.area}, {pro.state} · {pro.arrangement === 'Flexible' ? 'Flexible' : pro.arrangement}
                    </T>
                  </View>
                  <T variant="label">{formatNaira(pro.hourlyRate)}/hr</T>
                </Row>
                <T muted numberOfLines={2}>
                  {pro.about}
                </T>
                <Row gap={6} style={{ flexWrap: 'wrap' }}>
                  {pro.services.map((s) => (
                    <View key={s} style={{ backgroundColor: getService(s).tint, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 }}>
                      <T variant="caption" style={{ fontWeight: '600' }}>
                        {getService(s).label}
                      </T>
                    </View>
                  ))}
                </Row>
              </Card>
            </Pressable>
          ))}
          <T variant="caption" muted style={{ textAlign: 'center' }}>
            Profiles are fictional examples.
          </T>
        </ScrollView>

        {!state.profile && (
          <View style={{ position: 'absolute', left: 20, right: 20, bottom: insets.bottom + 16 }}>
            <Button label="Sign up to book" icon="person-add" onPress={() => router.push({ pathname: '/onboarding/role', params: { role: 'client' } })} />
          </View>
        )}
      </View>
    </PaletteProvider>
  );
}
