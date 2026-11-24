import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ApplicationPill } from '@/components/application-status';
import { MatchBadge } from '@/components/match-badge';
import { Card, Chip, Row, T, tap } from '@/components/ui';
import { getService, type JobOpening } from '@/lib/catalog';
import { formatPay, type Match, matchJobs, RECOMMENDED_THRESHOLD } from '@/lib/matching';
import { useStore } from '@/lib/store';
import { providerPalette as p } from '@/lib/theme';

type Tab = 'recommended' | 'all' | 'applied';

export default function JobsTab() {
  const insets = useSafeAreaInsets();
  const { state } = useStore();
  const pp = state.providerProfile!;
  const [tab, setTab] = useState<Tab>('recommended');

  const all = matchJobs(pp, state.profile?.state ?? 'Lagos');
  const recommended = all.filter((m) => m.score >= RECOMMENDED_THRESHOLD);
  const appliedIds = new Set(state.applications.map((a) => a.jobId));
  const applied = all.filter((m) => appliedIds.has(m.item.id));
  const list = tab === 'recommended' ? recommended : tab === 'applied' ? applied : all;

  return (
    <ScrollView style={{ backgroundColor: p.bg }} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16, gap: 14, paddingBottom: 40 }}>
      <View style={{ gap: 4 }}>
        <T variant="title">Jobs for you</T>
        <T muted>
          Ongoing work from households, schools and businesses. Ranked by your services, areas, hours and rate.
        </T>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        <Chip label={`Recommended · ${recommended.length}`} selected={tab === 'recommended'} onPress={() => setTab('recommended')} />
        <Chip label={`All jobs · ${all.length}`} selected={tab === 'all'} onPress={() => setTab('all')} />
        <Chip label={`My applications · ${applied.length}`} selected={tab === 'applied'} onPress={() => setTab('applied')} />
      </ScrollView>

      {list.length === 0 && (
        <Card style={{ alignItems: 'center', gap: 10, paddingVertical: 28 }}>
          <Ionicons name={tab === 'applied' ? 'paper-plane-outline' : 'search-outline'} size={36} color={p.textMuted} />
          <T muted style={{ textAlign: 'center' }}>
            {tab === 'applied'
              ? 'You haven’t applied to any jobs yet. Recommended jobs are a great place to start.'
              : 'No strong matches right now. Add more services or areas in your profile, or browse all jobs.'}
          </T>
        </Card>
      )}

      {list.map((m) => (
        <JobCard key={m.item.id} match={m} />
      ))}

      <T variant="caption" muted style={{ textAlign: 'center' }}>
        Demo job posts are fictional.
      </T>
    </ScrollView>
  );
}

function JobCard({ match }: { match: Match<JobOpening> }) {
  const { state } = useStore();
  const { item: job, score, reasons } = match;
  const service = getService(job.serviceId);
  const application = state.applications.find((a) => a.jobId === job.id);

  return (
    <Pressable
      onPress={() => {
        tap();
        router.push(`/job/${job.id}`);
      }}>
      <Card style={{ gap: 12 }}>
        <Row style={{ alignItems: 'flex-start' }}>
          <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: p.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name={service.icon} size={22} color={p.accent} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <T variant="label">{job.title}</T>
            <T variant="caption" muted>
              {job.hirer} · {job.hirerType}
            </T>
          </View>
          {application ? <ApplicationPill status={application.status} /> : score > 0 ? <MatchBadge score={score} /> : null}
        </Row>
        <Row gap={14} style={{ flexWrap: 'wrap' }}>
          <Meta icon="location-outline" text={`${job.area}, ${job.state}`} />
          <Meta icon="time-outline" text={job.schedule.join(', ')} />
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          <T variant="heading" color={p.accent}>
            {formatPay(job)}
          </T>
          <T variant="caption" muted>
            {job.postedDaysAgo === 1 ? 'Posted yesterday' : `Posted ${job.postedDaysAgo} days ago`}
          </T>
        </Row>
        {!application && reasons.length > 0 && (
          <T variant="caption" muted numberOfLines={1}>
            ✓ {reasons.slice(0, 3).join('  ✓ ')}
          </T>
        )}
      </Card>
    </Pressable>
  );
}

function Meta({ icon, text }: { icon: 'location-outline' | 'time-outline'; text: string }) {
  return (
    <Row gap={4}>
      <Ionicons name={icon} size={14} color={p.textMuted} />
      <T variant="caption">{text}</T>
    </Row>
  );
}
