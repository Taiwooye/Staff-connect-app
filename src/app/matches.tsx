import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MatchBadge, ReasonList } from '@/components/match-badge';
import { Avatar, Button, Card, IconButton, PaletteProvider, Row, Stars, T, tap } from '@/components/ui';
import { getService } from '@/lib/catalog';
import { matchPros } from '@/lib/matching';
import { useStore } from '@/lib/store';
import { clientPalette as p, formatNaira } from '@/lib/theme';

export default function MatchesScreen() {
  const insets = useSafeAreaInsets();
  const { state } = useStore();
  if (!state.profile) return <Redirect href="/welcome" />;
  if (!state.clientPrefs) return <Redirect href="/onboarding/needs" />;

  const matches = matchPros(state.clientPrefs, state.profile);
  const needs = state.clientPrefs.services.map((s) => getService(s).short.toLowerCase()).join(', ');

  return (
    <PaletteProvider palette={p}>
      <View style={{ flex: 1, backgroundColor: p.bg }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, gap: 16, paddingBottom: 120 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <IconButton icon="close" label="Close" onPress={() => router.replace('/client')} />
            <Pressable onPress={() => router.push({ pathname: '/onboarding/needs', params: { edit: '1' } })}>
              <Row gap={6}>
                <Ionicons name="options-outline" size={18} color={p.accent} />
                <T variant="label" color={p.accent}>
                  Edit needs
                </T>
              </Row>
            </Pressable>
          </Row>
          <View style={{ gap: 6 }}>
            <T variant="overline" color={p.accent}>
              {matches.length} matches near {state.profile.area}
            </T>
            <T variant="title">Professionals who fit what you need</T>
            <T muted>
              Based on {needs}, {state.clientPrefs.frequency.toLowerCase()}, in {state.profile.state}. Best matches first.
            </T>
          </View>

          {matches.length === 0 && (
            <Card style={{ alignItems: 'center', gap: 10, paddingVertical: 28 }}>
              <Ionicons name="search-outline" size={36} color={p.textMuted} />
              <T variant="heading">No matches yet</T>
              <T muted style={{ textAlign: 'center' }}>
                We don’t have professionals for these services in {state.profile.state} yet. Try another service, or post
                a request and nearby pros will be notified.
              </T>
            </Card>
          )}

          {matches.map(({ item: pro, score, reasons }, i) => (
            <Pressable
              key={pro.id}
              onPress={() => {
                tap();
                router.push(`/pro/${pro.id}`);
              }}>
              <Card style={{ gap: 12, borderColor: i === 0 ? p.accent : p.border, borderWidth: i === 0 ? 2 : 1 }}>
                {i === 0 && (
                  <T variant="overline" color={p.accent}>
                    Best match
                  </T>
                )}
                <Row style={{ alignItems: 'flex-start' }}>
                  <Avatar initials={pro.initials} color={pro.color} size={52} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <T variant="heading">{pro.name}</T>
                    <Row gap={8}>
                      <Stars value={pro.rating} size={13} color="#D97706" />
                      <T variant="caption" muted>
                        {pro.years} yrs · {formatNaira(pro.hourlyRate)}/hr
                      </T>
                    </Row>
                  </View>
                  <MatchBadge score={score} />
                </Row>
                <ReasonList reasons={reasons} />
              </Card>
            </Pressable>
          ))}
          <T variant="caption" muted style={{ textAlign: 'center' }}>
            Demo profiles are fictional; ratings are illustrative.
          </T>
        </ScrollView>
        <View style={{ position: 'absolute', left: 20, right: 20, bottom: insets.bottom + 16 }}>
          <Button label="Go to home" variant="secondary" onPress={() => router.replace('/client')} />
        </View>
      </View>
    </PaletteProvider>
  );
}
