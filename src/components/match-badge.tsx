import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { radius } from '@/lib/theme';

import { T, usePalette } from './ui';

/** "92% match" pill; strong matches use the accent, weaker ones stay neutral. */
export function MatchBadge({ score }: { score: number }) {
  const p = usePalette();
  const strong = score >= 75;
  return (
    <View
      accessibilityLabel={`${score} percent match`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: radius.pill,
        backgroundColor: strong ? p.accentSoft : p.surfaceAlt,
      }}>
      <Ionicons name="sparkles" size={12} color={strong ? p.accent : p.textMuted} />
      <T variant="caption" color={strong ? p.accent : p.text} style={{ fontWeight: '700' }}>
        {score}% match
      </T>
    </View>
  );
}

export function ReasonList({ reasons, max = 3 }: { reasons: string[]; max?: number }) {
  const p = usePalette();
  return (
    <View style={{ gap: 4 }}>
      {reasons.slice(0, max).map((r) => (
        <View key={r} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="checkmark" size={14} color={p.accent} />
          <T variant="caption" muted>
            {r}
          </T>
        </View>
      ))}
    </View>
  );
}
