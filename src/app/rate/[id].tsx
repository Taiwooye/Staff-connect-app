import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Field, FormScreen } from '@/components/form-screen';
import { Avatar, Button, Chip, PaletteProvider, Row, T, tap } from '@/components/ui';
import { getService } from '@/lib/catalog';
import { rateJobAction, useStore } from '@/lib/store';
import { clientPalette as p } from '@/lib/theme';

const STAR_LABELS = ['', 'Poor', 'Fair', 'Okay', 'Good', 'Excellent'];
const PRAISE = ['On time', 'Very thorough', 'Friendly', 'Great communication', 'Respectful', 'Good value'];
const ISSUES = ['Arrived late', 'Missed tasks', 'Poor communication', 'Not as described', 'Unprofessional'];

export default function RateScreen() {
  return (
    <PaletteProvider palette={p}>
      <Rate />
    </PaletteProvider>
  );
}

function Rate() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, dispatch } = useStore();
  const job = state.clientJobs.find((j) => j.id === id);
  const [stars, setStars] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [done, setDone] = useState(false);

  if (!job?.pro) {
    return (
      <FormScreen title="Nothing to rate">
        <Button label="Back home" onPress={() => router.replace('/client')} />
      </FormScreen>
    );
  }

  const pro = job.pro;
  const first = pro.name.split(' ')[0];
  const options = stars >= 4 ? PRAISE : ISSUES;

  if (done) {
    return (
      <FormScreen title="Thanks for your rating!" subtitle={`Your review helps ${first} and other households.`} onBack={() => router.replace('/client')}>
        <View style={{ alignItems: 'center', gap: 12, paddingVertical: 12 }}>
          <Avatar initials={pro.initials} color={pro.color} size={72} />
          <Row gap={4} accessibilityLabel={`You rated ${stars} out of 5`}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Ionicons key={n} name={n <= stars ? 'star' : 'star-outline'} size={28} color="#FBBF24" />
            ))}
          </Row>
        </View>
        <Button label="Done" onPress={() => router.replace('/client')} />
        <Button label={`Book ${first} again`} variant="secondary" onPress={() => router.replace({ pathname: '/book/[service]', params: { service: job.serviceId, pro: pro.id } })} />
      </FormScreen>
    );
  }

  return (
    <FormScreen
      title={`Rate ${first}`}
      subtitle={`${getService(job.serviceId).label} · ${new Date(job.completedAt ?? job.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}`}
      footer={
        <Button
          label={stars ? `Submit ${stars}-star rating` : 'Tap a star to rate'}
          disabled={!stars}
          onPress={() => {
            tap('success');
            dispatch(rateJobAction(job, { rating: stars, tags, comment: comment.trim() }));
            setDone(true);
          }}
        />
      }>
      <View style={{ alignItems: 'center', gap: 14 }}>
        <Avatar initials={pro.initials} color={pro.color} size={80} />
        <T variant="heading">How was {first}?</T>
        <Row gap={6}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable
              key={n}
              accessibilityRole="button"
              accessibilityLabel={`${n} star${n > 1 ? 's' : ''}, ${STAR_LABELS[n]}`}
              hitSlop={4}
              onPress={() => {
                tap('medium');
                if ((n >= 4) !== (stars >= 4)) setTags([]);
                setStars(n);
              }}>
              <Ionicons name={n <= stars ? 'star' : 'star-outline'} size={48} color="#FBBF24" />
            </Pressable>
          ))}
        </Row>
        <T variant="title" color={stars ? p.text : p.textMuted}>
          {stars ? STAR_LABELS[stars] : 'Tap to rate'}
        </T>
      </View>

      {stars > 0 && (
        <>
          <View style={{ gap: 10 }}>
            <T variant="heading">{stars >= 4 ? 'What went well?' : 'What could be better?'}</T>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {options.map((t) => (
                <Chip key={t} label={t} selected={tags.includes(t)} onPress={() => setTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t])} />
              ))}
            </View>
          </View>
          <Field
            label="Add a comment (optional)"
            value={comment}
            onChangeText={setComment}
            multiline
            maxLength={300}
            placeholder={stars >= 4 ? `What did ${first} do well?` : 'Tell us what happened. We’ll follow up.'}
          />
        </>
      )}
    </FormScreen>
  );
}
