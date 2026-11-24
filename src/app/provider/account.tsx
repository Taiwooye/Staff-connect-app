import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { AccountView } from '@/components/account-view';
import { Card, Row, T } from '@/components/ui';
import { getService } from '@/lib/catalog';
import { useStore } from '@/lib/store';
import { formatNaira, providerPalette as p } from '@/lib/theme';

export default function ProviderAccount() {
  const { state } = useStore();
  const pp = state.providerProfile!;
  return (
    <AccountView mode="provider">
      <Card style={{ gap: 12 }}>
        <Row gap={8}>
          <Ionicons name="shield-checkmark" size={20} color={p.success} />
          <T variant="label" color={p.success}>
            Approved professional (demo)
          </T>
        </Row>
        <T muted>{pp.bio}</T>
        <Line label="Services" value={pp.services.map((s) => getService(s).short).join(', ')} />
        <Line label="Areas" value={pp.areas.join(', ')} />
        <Line label="Rate" value={`${formatNaira(pp.hourlyRate)}/hr`} />
        <Line label="Availability" value={pp.availability.join(', ')} />
      </Card>
    </AccountView>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
      <T variant="caption" muted>
        {label}
      </T>
      <T variant="label" style={{ flex: 1, textAlign: 'right' }}>
        {value}
      </T>
    </View>
  );
}
