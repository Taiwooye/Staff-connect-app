import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import type { IconName } from '@/lib/catalog';
import type { ApplicationStatus } from '@/lib/store';
import { radius } from '@/lib/theme';

import { T, usePalette } from './ui';

export const applicationCopy: Record<ApplicationStatus, { label: string; icon: IconName }> = {
  applied: { label: 'Applied', icon: 'paper-plane-outline' },
  shortlisted: { label: 'Shortlisted', icon: 'star-outline' },
  hired: { label: 'Hired', icon: 'checkmark-circle' },
  not_selected: { label: 'Not selected', icon: 'close-circle-outline' },
};

export function ApplicationPill({ status }: { status: ApplicationStatus }) {
  const p = usePalette();
  const color = status === 'hired' ? p.success : status === 'not_selected' ? p.textMuted : p.accent;
  const { label, icon } = applicationCopy[status];
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: color,
      }}>
      <Ionicons name={icon} size={12} color={color} />
      <T variant="caption" color={color} style={{ fontWeight: '700' }}>
        {label}
      </T>
    </View>
  );
}
