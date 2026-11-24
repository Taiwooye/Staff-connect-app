import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AccountView } from '@/components/account-view';
import { Card, Row, T } from '@/components/ui';
import { getService } from '@/lib/catalog';
import { useStore } from '@/lib/store';
import { clientPalette as p, formatNaira } from '@/lib/theme';

export default function ClientAccount() {
  const { state } = useStore();
  const done = state.clientJobs.filter((j) => j.status === 'completed');
  const spent = done.reduce((sum, j) => sum + (j.paid?.amount ?? 0), 0);
  return (
    <AccountView mode="client">
      <Row gap={12}>
        <Card style={{ flex: 1, gap: 4 }}>
          <T variant="title">{done.length}</T>
          <T variant="caption" muted>
            Jobs completed
          </T>
        </Card>
        <Card style={{ flex: 1, gap: 4 }}>
          <T variant="title" color={p.accent}>
            {formatNaira(spent)}
          </T>
          <T variant="caption" muted>
            Total spent
          </T>
        </Card>
      </Row>
      <Pressable onPress={() => router.push({ pathname: '/onboarding/needs', params: state.clientPrefs ? { edit: '1' } : {} })}>
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Ionicons name="sparkles-outline" size={22} color={p.accent} />
          <View style={{ flex: 1 }}>
            <T variant="label">What I need</T>
            <T variant="caption" muted>
              {state.clientPrefs
                ? `${state.clientPrefs.services.map((s) => getService(s).short).join(', ')} · ${state.clientPrefs.frequency}`
                : 'Set your needs to get matched'}
            </T>
          </View>
          <T variant="label" color={p.accent}>
            Edit
          </T>
        </Card>
      </Pressable>
    </AccountView>
  );
}
