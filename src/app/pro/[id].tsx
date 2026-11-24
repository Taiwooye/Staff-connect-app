import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MatchBadge, ReasonList } from '@/components/match-badge';
import { Avatar, Button, Card, Chip, IconButton, PaletteProvider, Row, Stars, T } from '@/components/ui';
import { getPro, getService, type IconName } from '@/lib/catalog';
import { matchPros } from '@/lib/matching';
import { useStore } from '@/lib/store';
import { clientPalette as p, formatNaira } from '@/lib/theme';

export default function ProProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { state } = useStore();
  const pro = getPro(id);
  const match =
    pro && state.clientPrefs && state.profile ? matchPros(state.clientPrefs, state.profile).find((m) => m.item.id === pro.id) : undefined;
  const preferred = pro?.services.find((s) => state.clientPrefs?.services.includes(s)) ?? pro?.services[0];
  const [service, setService] = useState(preferred);

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
  const facts: { icon: IconName; label: string }[] = [
    { icon: 'location-outline', label: `${pro.area}, ${pro.state}` },
    { icon: 'calendar-outline', label: pro.arrangement === 'Flexible' ? 'Flexible schedule' : `Works ${pro.arrangement.toLowerCase()}` },
    { icon: 'briefcase-outline', label: `${pro.years} years’ experience · ${pro.jobs} jobs` },
    { icon: 'chatbubbles-outline', label: pro.languages.join(', ') },
  ];

  return (
    <PaletteProvider palette={p}>
      <View style={{ flex: 1, backgroundColor: p.bg }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, gap: 18, paddingBottom: 140 }}>
          <IconButton icon="arrow-back" label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/client'))} />
          <View style={{ alignItems: 'center', gap: 8 }}>
            <Avatar initials={pro.initials} color={pro.color} size={88} />
            <T variant="title">{pro.name}</T>
            <Row gap={10}>
              <Stars value={pro.rating} color="#C98A0B" />
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

          {match && (
            <Card style={{ gap: 10, backgroundColor: p.accentSoft, borderColor: p.accentSoft }}>
              <T variant="heading">Why {first} is a good fit</T>
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
            <T variant="heading">Book {first} for</T>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {pro.services.map((s) => (
                <Chip key={s} label={getService(s).label} icon={getService(s).icon} selected={service === s} onPress={() => setService(s)} />
              ))}
            </View>
          </View>
        </ScrollView>
        <View style={{ position: 'absolute', left: 20, right: 20, bottom: insets.bottom + 16 }}>
          <Button
            label={`Book ${first}`}
            icon="calendar"
            onPress={() => router.push({ pathname: '/book/[service]', params: { service, pro: pro.id } })}
          />
        </View>
      </View>
    </PaletteProvider>
  );
}
