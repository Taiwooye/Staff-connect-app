import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChooseSheet } from '@/components/choose-sheet';
import { MatchBadge, ReasonList } from '@/components/match-badge';
import { Avatar, Button, Card, Chip, IconButton, PaletteProvider, Row, T, tap } from '@/components/ui';
import { type DemoPro, getPro, getService, type IconName, ratingWith, sampleReviews, type ShownReview } from '@/lib/catalog';
import { matchPros } from '@/lib/matching';
import { chooseProAction, useStore } from '@/lib/store';
import { clientPalette as p, formatNaira } from '@/lib/theme';

export default function ProProfile() {
  const { id, job: jobId } = useLocalSearchParams<{ id: string; job?: string }>();
  const insets = useSafeAreaInsets();
  const { state, dispatch } = useStore();
  const pro = getPro(id);
  const job = state.clientJobs.find((j) => j.id === jobId && j.status === 'choosing');
  const preferred = pro?.services.find((s) => state.clientPrefs?.services.includes(s)) ?? pro?.services[0];
  const [service, setService] = useState(preferred);
  const [confirming, setConfirming] = useState<DemoPro | null>(null);

  if (!pro || !service) {
    return (
      <PaletteProvider palette={p}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: p.bg }}>
          <T variant="heading">Profile not found</T>
          <Button label="Back" onPress={() => router.back()} />
        </View>
      </PaletteProvider>
    );
  }

  const first = pro.name.split(' ')[0];
  const home = state.profile ? { state: state.profile.state, area: job?.area ?? state.profile.area } : null;
  const prefs = job
    ? { services: [job.serviceId], frequency: state.clientPrefs?.frequency ?? ('One-off' as const) }
    : state.clientPrefs;
  const match = prefs && home ? matchPros(prefs, home).find((m) => m.item.id === pro.id) : undefined;

  const myReviews = state.reviews.filter((r) => r.proId === pro.id);
  const rating = ratingWith(pro, myReviews);
  const reviews: ShownReview[] = [
    ...myReviews.map((r) => ({ author: 'You', rating: r.rating, text: r.comment, tags: r.tags, mine: true })),
    ...sampleReviews(pro),
  ];
  const unrated = state.clientJobs.find((j) => j.pro?.id === pro.id && j.status === 'completed' && j.rating === undefined);

  const facts: { icon: IconName; label: string }[] = [
    { icon: 'location-outline', label: `${pro.area}, ${pro.state}` },
    { icon: 'calendar-outline', label: pro.arrangement === 'Flexible' ? 'Flexible schedule' : `Works ${pro.arrangement.toLowerCase()}` },
    { icon: 'briefcase-outline', label: `${pro.years} years’ experience · ${pro.jobs} jobs` },
    { icon: 'chatbubbles-outline', label: pro.languages.join(', ') },
  ];

  return (
    <PaletteProvider palette={p}>
      <View style={{ flex: 1, backgroundColor: p.bg }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, gap: 18, paddingBottom: 150 }}>
          <IconButton icon="arrow-back" label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace(state.profile ? '/client' : '/welcome'))} />
          <View style={{ alignItems: 'center', gap: 8 }}>
            <Avatar initials={pro.initials} color={pro.color} size={88} />
            <T variant="title">{pro.name}</T>
            <Row gap={10}>
              <Row gap={4}>
                <Ionicons name="star" size={16} color="#C98A0B" />
                <T variant="label">{rating.average.toFixed(1)}</T>
                <T variant="caption" muted>
                  ({rating.count})
                </T>
              </Row>
              <T muted variant="caption">
                {formatNaira(pro.hourlyRate)}/hr
              </T>
              {match && <MatchBadge score={match.score} />}
            </Row>
            <Row gap={4}>
              <Ionicons name="shield-checkmark" size={14} color={p.accent} />
              <T variant="caption" color={p.accent}>
                ID & references checked (demo profile)
              </T>
            </Row>
          </View>

          {unrated && (
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: '#F5B32F' }}>
              <Ionicons name="star" size={24} color="#F5B32F" />
              <T variant="label" style={{ flex: 1 }}>
                How was your last booking with {first}?
              </T>
              <Button label="Rate" size="md" onPress={() => router.push(`/rate/${unrated.id}`)} />
            </Card>
          )}

          {match && (
            <Card style={{ gap: 10, backgroundColor: p.accentSoft, borderColor: p.accentSoft }}>
              <T variant="heading">Why {first} fits your request</T>
              <ReasonList reasons={match.reasons} max={5} />
            </Card>
          )}

          <View style={{ gap: 8 }}>
            <T variant="heading">About</T>
            <T muted>{pro.about}</T>
          </View>

          <Card style={{ gap: 12 }}>
            {facts.map((f) => (
              <Row key={f.label} gap={10}>
                <Ionicons name={f.icon} size={18} color={p.textMuted} />
                <T>{f.label}</T>
              </Row>
            ))}
          </Card>

          <View style={{ gap: 10 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <T variant="heading">Reviews</T>
              <T variant="caption" muted>
                {rating.average.toFixed(1)} average · {rating.count} ratings
              </T>
            </Row>
            {reviews.map((r, i) => (
              <Card key={i} style={{ gap: 6, borderColor: r.mine ? p.accent : p.border }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <T variant="label">{r.author}</T>
                  <Row gap={2} accessibilityLabel={`${r.rating} out of 5 stars`}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Ionicons key={n} name={n <= r.rating ? 'star' : 'star-outline'} size={14} color="#F5B32F" />
                    ))}
                  </Row>
                </Row>
                {r.text ? <T muted>{r.text}</T> : null}
                {r.tags?.length ? (
                  <T variant="caption" color={p.accent}>
                    {r.tags.join(' · ')}
                  </T>
                ) : null}
              </Card>
            ))}
            <T variant="caption" muted>
              Sample reviews are fictional.
            </T>
          </View>

          {!job && (
            <View style={{ gap: 10 }}>
              <T variant="heading">Book {first} for</T>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {pro.services.map((s) => (
                  <Chip key={s} label={getService(s).label} icon={getService(s).icon} selected={service === s} onPress={() => setService(s)} />
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        <View style={{ position: 'absolute', left: 20, right: 20, bottom: insets.bottom + 16, gap: 8 }}>
          {job ? (
            <Button label={`Choose ${first} for this job`} icon="checkmark-circle" onPress={() => setConfirming(pro)} />
          ) : !state.profile ? (
            <Button
              label={`Sign up to book ${first}`}
              icon="person-add"
              onPress={() => router.push({ pathname: '/onboarding/role', params: { role: 'client' } })}
            />
          ) : (
            <Button
              label={`Book ${first}`}
              icon="calendar"
              onPress={() => router.push({ pathname: '/book/[service]', params: { service, pro: pro.id } })}
            />
          )}
        </View>

        {job && (
          <ChooseSheet
            job={job}
            pro={confirming}
            onClose={() => setConfirming(null)}
            onConfirm={(chosen) => {
              tap('success');
              dispatch(chooseProAction(job.id, chosen));
              setConfirming(null);
              if (router.canDismiss()) router.dismissAll();
              router.replace(`/trip/${job.id}`);
            }}
          />
        )}
      </View>
    </PaletteProvider>
  );
}
