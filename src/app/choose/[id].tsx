import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChooseSheet } from '@/components/choose-sheet';
import { MatchBadge, ReasonList } from '@/components/match-badge';
import { Avatar, Button, Card, Chip, IconButton, PaletteProvider, Row, T, tap } from '@/components/ui';
import { type DemoPro, getService, ratingWith } from '@/lib/catalog';
import { matchPros } from '@/lib/matching';
import { chooseProAction, priceFor, useStore } from '@/lib/store';
import { clientPalette as p, formatNaira } from '@/lib/theme';

type Sort = 'match' | 'rating' | 'price' | 'nearest';
const sorts: { id: Sort; label: string }[] = [
  { id: 'match', label: 'Best match' },
  { id: 'rating', label: 'Top rated' },
  { id: 'price', label: 'Lowest price' },
  { id: 'nearest', label: 'Nearest' },
];

export default function ChoosePro() {
  return (
    <PaletteProvider palette={p}>
      <Choose />
    </PaletteProvider>
  );
}

function Choose() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { state, dispatch } = useStore();
  const [sort, setSort] = useState<Sort>('match');
  const [picked, setPicked] = useState<DemoPro | null>(null);
  const job = state.clientJobs.find((j) => j.id === id);

  if (!job || job.status !== 'choosing') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, backgroundColor: p.bg }}>
        <T variant="heading">{job ? 'You’ve already chosen a pro' : 'Request not found'}</T>
        <Button label={job ? 'View booking' : 'Back home'} onPress={() => router.replace(job ? `/trip/${job.id}` : '/client')} />
      </View>
    );
  }

  const service = getService(job.serviceId);
  const home = { state: state.profile?.state ?? 'Lagos', area: job.area };
  const candidates = matchPros({ services: [job.serviceId], frequency: state.clientPrefs?.frequency ?? 'One-off' }, home).map((m) => ({
    ...m,
    rating: ratingWith(m.item, state.reviews.filter((r) => r.proId === m.item.id)),
    price: priceFor(job.serviceId, job.hours, m.item.hourlyRate).total,
  }));
  const sorted = [...candidates].sort((a, b) =>
    sort === 'rating'
      ? b.rating.average - a.rating.average
      : sort === 'price'
        ? a.price - b.price
        : sort === 'nearest'
          ? Number(b.item.area === job.area) - Number(a.item.area === job.area) || b.score - a.score
          : b.score - a.score,
  );

  const confirm = (pro: DemoPro) => {
    tap('success');
    dispatch(chooseProAction(job.id, pro));
    setPicked(null);
    router.replace(`/trip/${job.id}`);
  };

  const cancel = () => {
    dispatch({ type: 'updateClientJob', id: job.id, patch: { status: 'cancelled' } });
    router.replace('/client');
  };

  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, gap: 16, paddingBottom: 40 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <IconButton icon="close" label="Close" onPress={() => router.replace('/client')} />
          <Pressable onPress={cancel} hitSlop={8}>
            <T variant="label" color={p.danger}>
              Cancel request
            </T>
          </Pressable>
        </Row>

        <View style={{ gap: 6 }}>
          <T variant="title">Choose your pro</T>
          <T muted>
            {candidates.length} {service.short.toLowerCase()} pros available near {job.area}. Open a profile to read reviews, then pick the
            person you want. Nothing is sent until you choose.
          </T>
        </View>

        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 }}>
          <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: service.tint, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name={service.icon} size={20} color={p.text} />
          </View>
          <View style={{ flex: 1 }}>
            <T variant="label">{service.label}</T>
            <T variant="caption" muted>
              {job.when} · {job.hours} hrs · {job.address}, {job.area}
            </T>
          </View>
        </Card>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {sorts.map((s) => (
            <Chip key={s.id} label={s.label} selected={sort === s.id} onPress={() => setSort(s.id)} />
          ))}
        </ScrollView>

        {sorted.length === 0 && (
          <Card style={{ alignItems: 'center', gap: 10, paddingVertical: 28 }}>
            <Ionicons name="search-outline" size={36} color={p.textMuted} />
            <T variant="heading">No pros available yet</T>
            <T muted style={{ textAlign: 'center' }}>
              No {service.short.toLowerCase()} professionals in {home.state} right now. Try another service or check back soon.
            </T>
          </Card>
        )}

        {sorted.map(({ item: pro, score, reasons, rating, price }) => (
          <Card key={pro.id} style={{ gap: 12 }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`View ${pro.name}'s profile`}
              onPress={() => router.push({ pathname: '/pro/[id]', params: { id: pro.id, job: job.id } })}>
              <Row style={{ alignItems: 'flex-start' }}>
                <Avatar initials={pro.initials} color={pro.color} size={56} />
                <View style={{ flex: 1, gap: 2 }}>
                  <T variant="heading">{pro.name}</T>
                  <Row gap={6}>
                    <Ionicons name="star" size={14} color="#D97706" />
                    <T variant="label">{rating.average.toFixed(1)}</T>
                    <T variant="caption" muted>
                      ({rating.count} reviews) · {pro.years} yrs
                    </T>
                  </Row>
                  <T variant="caption" muted>
                    {pro.area} · {formatNaira(pro.hourlyRate)}/hr
                  </T>
                </View>
                <MatchBadge score={score} />
              </Row>
            </Pressable>
            <ReasonList reasons={reasons} />
            <Row style={{ justifyContent: 'space-between' }}>
              <View>
                <T variant="caption" muted>
                  Total for {job.hours} hrs
                </T>
                <T variant="heading">{formatNaira(price)}</T>
              </View>
              <Row gap={8}>
                <Button
                  label="View profile"
                  variant="secondary"
                  size="md"
                  onPress={() => router.push({ pathname: '/pro/[id]', params: { id: pro.id, job: job.id } })}
                />
                <Button label="Choose" size="md" onPress={() => setPicked(pro)} />
              </Row>
            </Row>
          </Card>
        ))}
        <T variant="caption" muted style={{ textAlign: 'center' }}>
          Demo profiles are fictional; ratings are illustrative.
        </T>
      </ScrollView>
      <ChooseSheet job={job} pro={picked} onConfirm={confirm} onClose={() => setPicked(null)} />
    </View>
  );
}
