import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { DemoPro } from '@/lib/catalog';
import { getService } from '@/lib/catalog';
import { type ClientJob, priceFor } from '@/lib/store';
import { formatNaira, radius } from '@/lib/theme';

import { Avatar, Button, Divider, Row, T, usePalette } from './ui';

/** Final confirmation before a request is sent to the pro the client picked. */
export function ChooseSheet({
  job,
  pro,
  onConfirm,
  onClose,
}: {
  job: ClientJob;
  pro: DemoPro | null;
  onConfirm: (pro: DemoPro) => void;
  onClose: () => void;
}) {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  if (!pro) return null;
  const price = priceFor(job.serviceId, job.hours, pro.hourlyRate);
  const first = pro.name.split(' ')[0];

  return (
    <Modal transparent animationType="slide" visible onRequestClose={onClose}>
      <Pressable accessibilityLabel="Close" onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' }} />
      <View
        style={{
          backgroundColor: p.surface,
          borderTopLeftRadius: radius.xl,
          borderTopRightRadius: radius.xl,
          padding: 20,
          paddingBottom: insets.bottom + 20,
          gap: 16,
          width: '100%',
          maxWidth: 440,
          alignSelf: 'center',
        }}>
        <Row>
          <Avatar initials={pro.initials} color={pro.color} size={56} />
          <View style={{ flex: 1 }}>
            <T variant="heading">Send your request to {first}?</T>
            <T variant="caption" muted>
              {getService(job.serviceId).label} · {job.hours} hrs · {job.when} · {job.area}
            </T>
          </View>
        </Row>
        <View style={{ gap: 6 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <T muted>
              {formatNaira(pro.hourlyRate)} × {job.hours} hrs
            </T>
            <T variant="label">{formatNaira(price.subtotal)}</T>
          </Row>
          <Divider />
          <Row style={{ justifyContent: 'space-between' }}>
            <T variant="label">You pay after the job</T>
            <T variant="heading">{formatNaira(price.total)}</T>
          </Row>
          <T variant="caption" muted>
            {first} receives {formatNaira(price.toPro)} · StaffConnect 10% {formatNaira(price.fee)}
          </T>
        </View>
        <T variant="caption" muted>
          {first} will be asked to accept. If they decline, you can choose someone else. Nothing is charged until the job is done.
        </T>
        <Button label={`Yes, send to ${first}`} icon="paper-plane" onPress={() => onConfirm(pro)} />
        <Button label="Keep looking" variant="ghost" size="md" onPress={onClose} />
      </View>
    </Modal>
  );
}
