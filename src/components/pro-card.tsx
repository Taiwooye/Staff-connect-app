import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { type DemoPro, getService } from '@/lib/catalog';
import { clientPalette as p, formatNaira, radius } from '@/lib/theme';

import { shadow, T } from './ui';

// A friendly job title per service, e.g. "Housekeeper & Cook".
const titles: Record<string, string> = {
  cleaning: 'Housekeeper',
  childcare: 'Nanny',
  cooking: 'Cook',
  drivers: 'Driver',
  gardeners: 'Gardener',
  'elderly-care': 'Caregiver',
  'pet-care': 'Pet sitter',
  'home-maintenance': 'Handyman',
};

export function proTitle(pro: DemoPro) {
  return pro.services
    .slice(0, 2)
    .map((s) => titles[s] ?? getService(s).short)
    .join(' & ');
}

/**
 * Image-first profile card: a large portrait area on top, then name, role, rating,
 * starting price and a couple of tags. The whole card opens the profile.
 */
export function ProCard({ pro, featured, width }: { pro: DemoPro; featured?: boolean; width?: number | `${number}%` }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${pro.name}, ${proTitle(pro)}, rated ${pro.rating}, from ${formatNaira(pro.hourlyRate)} per hour`}
      onPress={() => router.push(`/pro/${pro.id}`)}
      style={({ pressed }) => [
        {
          width,
          backgroundColor: p.surface,
          borderRadius: radius.lg,
          overflow: 'hidden',
          transform: [{ scale: pressed ? 0.98 : 1 }],
          ...shadow(1),
        },
      ]}>
      <View style={{ height: 132, backgroundColor: `${pro.color}1F`, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: pro.color, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#fff' }}>
          <Text style={{ color: '#fff', fontSize: 30, fontWeight: '800' }}>{pro.initials}</Text>
        </View>
        {featured && (
          <View style={{ position: 'absolute', top: 10, left: 10, backgroundColor: '#fff', borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3 }}>
            <T variant="caption" color={p.accent} style={{ fontWeight: '700', fontSize: 11 }}>
              Featured
            </T>
          </View>
        )}
        <View style={{ position: 'absolute', top: 10, right: 10, flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#fff', borderRadius: radius.pill, paddingHorizontal: 7, paddingVertical: 3 }}>
          <Ionicons name="star" size={11} color="#C98A0B" />
          <T variant="caption" style={{ fontWeight: '700', fontSize: 11 }}>
            {pro.rating.toFixed(1)}
          </T>
        </View>
      </View>
      <View style={{ padding: 12, gap: 6 }}>
        <View>
          <T variant="label" numberOfLines={1}>
            {pro.name}
          </T>
          <T variant="caption" muted numberOfLines={1}>
            {proTitle(pro)}
          </T>
        </View>
        <T variant="caption">
          From <T variant="caption" style={{ fontWeight: '800' }}>{formatNaira(pro.hourlyRate)}</T>/hr
        </T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
          <Tag text={pro.area} />
          <Tag text={pro.arrangement === 'Flexible' ? 'Flexible' : pro.arrangement} />
        </View>
      </View>
    </Pressable>
  );
}

function Tag({ text }: { text: string }) {
  return (
    <View style={{ backgroundColor: p.surfaceAlt, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3 }}>
      <T variant="caption" muted style={{ fontSize: 11 }}>
        {text}
      </T>
    </View>
  );
}
