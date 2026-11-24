import { AccountView } from '@/components/account-view';
import { Card, Row, T } from '@/components/ui';
import { useStore } from '@/lib/store';
import { clientPalette as p, formatNaira } from '@/lib/theme';

export default function ClientAccount() {
  const { state } = useStore();
  const done = state.clientJobs.filter((j) => j.status === 'completed');
  const spent = done.reduce((sum, j) => sum + j.total + (j.tip ?? 0), 0);
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
    </AccountView>
  );
}
