import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ApplicationPill } from '@/components/application-status';
import { MatchBadge } from '@/components/match-badge';
import { InboxBell } from '@/components/notifications';
import { Card, Chip, Row, T, tap } from '@/components/ui';
import { getJob, getService, HOURS_PER_UNIT, type JobOpening, launchLocations, type LaunchState, scheduleOptions, services } from '@/lib/catalog';
import { daysUntil, formatStart } from '@/lib/hiring';
import { formatPay, type Match, matchJobs, RECOMMENDED_THRESHOLD } from '@/lib/matching';
import { type Application, useNow, useStore } from '@/lib/store';
import { providerPalette as p, radius } from '@/lib/theme';

type Tab = 'recommended' | 'all' | 'applied';
type Sort = 'match' | 'newest' | 'pay';

export default function JobsTab() {
  const insets = useSafeAreaInsets();
  const { state } = useStore();
  const pp = state.providerProfile!;
  const homeState = (state.profile?.state as LaunchState) ?? 'Lagos';

  const [tab, setTab] = useState<Tab>('recommended');
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [svc, setSvc] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [schedule, setSchedule] = useState<string[]>([]);
  const [sort, setSort] = useState<Sort>('match');

  const all = matchJobs(pp, homeState);
  const appliedIds = new Set(state.applications.map((a) => a.jobId));
  const base = tab === 'recommended' ? all.filter((m) => m.score >= RECOMMENDED_THRESHOLD) : tab === 'applied' ? all.filter((m) => appliedIds.has(m.item.id)) : all;

  const q = query.trim().toLowerCase();
  const filtered = base
    .filter(({ item: j }) => {
      if (q && ![j.title, j.hirer, j.area, j.state, getService(j.serviceId).label, j.hirerType].some((s) => s.toLowerCase().includes(q))) return false;
      if (svc.length && !svc.includes(j.serviceId)) return false;
      if (areas.length && !areas.includes(j.area)) return false;
      if (schedule.length && !j.schedule.some((s) => schedule.includes(s))) return false;
      return true;
    })
    .sort((a, b) =>
      sort === 'newest'
        ? a.item.postedDaysAgo - b.item.postedDaysAgo
        : sort === 'pay'
          ? b.item.payMax / HOURS_PER_UNIT[b.item.payUnit] - a.item.payMax / HOURS_PER_UNIT[a.item.payUnit]
          : b.score - a.score,
    );

  const filterCount = svc.length + areas.length + schedule.length + (sort !== 'match' ? 1 : 0);
  const clear = () => {
    setSvc([]);
    setAreas([]);
    setSchedule([]);
    setSort('match');
    setQuery('');
  };
  const toggle = (list: string[], set: (v: string[]) => void, v: string) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  // Applications that need the worker's attention, most urgent first.
  const urgency: Record<string, number> = { offered: 0, hired: 1, shortlisted: 2, applied: 3 };
  const active = state.applications.filter((a) => a.status in urgency).sort((a, b) => urgency[a.status] - urgency[b.status] || b.unread - a.unread);

  return (
    <ScrollView style={{ backgroundColor: p.bg }} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16, gap: 14, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <Row style={{ justifyContent: 'space-between' }}>
        <T variant="title">Jobs for you</T>
        <InboxBell />
      </Row>

      {active.length > 0 && (
        <View style={{ gap: 8 }}>
          <T variant="overline" muted>
            Your work
          </T>
          {active.slice(0, 3).map((a) => (
            <ActiveCard key={a.jobId} application={a} />
          ))}
        </View>
      )}

      <Row gap={8}>
        <Row
          gap={8}
          style={{ flex: 1, height: 48, borderRadius: radius.pill, backgroundColor: p.surface, borderWidth: 1, borderColor: p.border, paddingHorizontal: 14 }}>
          <Ionicons name="search" size={18} color={p.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search jobs, hirers or areas"
            placeholderTextColor={p.textMuted}
            returnKeyType="search"
            style={{ flex: 1, color: p.text, fontSize: 15, height: '100%' }}
          />
          {query ? (
            <Pressable accessibilityLabel="Clear search" onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={p.textMuted} />
            </Pressable>
          ) : null}
        </Row>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Filters"
          onPress={() => {
            tap();
            setShowFilters(!showFilters);
          }}
          style={{
            height: 48,
            paddingHorizontal: 14,
            borderRadius: radius.pill,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: showFilters || filterCount ? p.accent : p.surface,
            borderWidth: 1,
            borderColor: showFilters || filterCount ? p.accent : p.border,
          }}>
          <Ionicons name="options" size={18} color={showFilters || filterCount ? p.accentText : p.text} />
          <T variant="label" color={showFilters || filterCount ? p.accentText : p.text}>
            {filterCount ? `Filters · ${filterCount}` : 'Filters'}
          </T>
        </Pressable>
      </Row>

      {showFilters && (
        <Card style={{ gap: 14 }}>
          <FilterGroup title="Sort by">
            <Chip label="Best match" selected={sort === 'match'} onPress={() => setSort('match')} />
            <Chip label="Newest" selected={sort === 'newest'} onPress={() => setSort('newest')} />
            <Chip label="Highest pay" selected={sort === 'pay'} onPress={() => setSort('pay')} />
          </FilterGroup>
          <FilterGroup title="Service">
            {services.map((s) => (
              <Chip key={s.id} label={s.short} selected={svc.includes(s.id)} onPress={() => toggle(svc, setSvc, s.id)} />
            ))}
          </FilterGroup>
          <FilterGroup title={`Area (${homeState})`}>
            {launchLocations[homeState].map((a) => (
              <Chip key={a} label={a} selected={areas.includes(a)} onPress={() => toggle(areas, setAreas, a)} />
            ))}
          </FilterGroup>
          <FilterGroup title="Schedule">
            {scheduleOptions.map((s) => (
              <Chip key={s} label={s} selected={schedule.includes(s)} onPress={() => toggle(schedule, setSchedule, s)} />
            ))}
          </FilterGroup>
          <Row style={{ justifyContent: 'space-between' }}>
            <Pressable onPress={clear} hitSlop={8}>
              <T variant="label" color={p.accent}>
                Clear all
              </T>
            </Pressable>
            <Pressable onPress={() => setShowFilters(false)} hitSlop={8}>
              <T variant="label">Show {filtered.length} jobs</T>
            </Pressable>
          </Row>
        </Card>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        <Chip label={`Recommended · ${all.filter((m) => m.score >= RECOMMENDED_THRESHOLD).length}`} selected={tab === 'recommended'} onPress={() => setTab('recommended')} />
        <Chip label={`All jobs · ${all.length}`} selected={tab === 'all'} onPress={() => setTab('all')} />
        <Chip label={`My applications · ${appliedIds.size}`} selected={tab === 'applied'} onPress={() => setTab('applied')} />
      </ScrollView>

      {(q || filterCount > 0) && (
        <Row style={{ justifyContent: 'space-between' }}>
          <T variant="caption" muted>
            {filtered.length} result{filtered.length === 1 ? '' : 's'}
            {q ? ` for “${query.trim()}”` : ''}
          </T>
          <Pressable onPress={clear} hitSlop={8}>
            <T variant="caption" color={p.accent}>
              Clear
            </T>
          </Pressable>
        </Row>
      )}

      {filtered.length === 0 && (
        <Card style={{ alignItems: 'center', gap: 10, paddingVertical: 28 }}>
          <Ionicons name={tab === 'applied' ? 'paper-plane-outline' : 'search-outline'} size={36} color={p.textMuted} />
          <T muted style={{ textAlign: 'center' }}>
            {tab === 'applied' && !q && !filterCount
              ? 'You haven’t applied to any jobs yet. Recommended jobs are a great place to start.'
              : 'No jobs match. Try a different search, clear filters, or look in All jobs.'}
          </T>
        </Card>
      )}

      {filtered.map((m) => (
        <JobCard key={m.item.id} match={m} />
      ))}

      <T variant="caption" muted style={{ textAlign: 'center' }}>
        Demo job posts are fictional.
      </T>
    </ScrollView>
  );
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <T variant="caption" muted>
        {title}
      </T>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{children}</View>
    </View>
  );
}

/** One line telling the worker exactly what to do next for each live application. */
function ActiveCard({ application: a }: { application: Application }) {
  const now = useNow(60000);
  const job = getJob(a.jobId);
  if (!job) return null;
  const next =
    a.status === 'offered'
      ? { text: 'Job offer: accept to confirm', color: p.accent, icon: 'gift' as const }
      : a.status === 'hired' && a.offer
        ? { text: `You start ${daysUntil(a.offer.startAt, now)} · ${formatStart(a.offer.startAt)}`, color: p.success, icon: 'checkmark-circle' as const }
        : a.status === 'shortlisted'
          ? { text: a.unread ? 'New message from the hirer' : 'Shortlisted · keep the chat going', color: p.accent, icon: 'chatbubbles' as const }
          : { text: 'Waiting for the hirer to review', color: p.textMuted, icon: 'time' as const };
  return (
    <Pressable onPress={() => router.push(`/job/${job.id}`)}>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: a.status === 'applied' ? p.border : next.color }}>
        <Ionicons name={next.icon} size={22} color={next.color} />
        <View style={{ flex: 1 }}>
          <T variant="label" numberOfLines={1}>
            {job.title}
          </T>
          <T variant="caption" color={next.color} numberOfLines={1}>
            {next.text}
          </T>
        </View>
        {a.unread > 0 && (
          <View style={{ minWidth: 22, height: 22, borderRadius: 11, backgroundColor: p.danger, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 }}>
            <T variant="caption" color="#fff" style={{ fontWeight: '800' }}>
              {a.unread}
            </T>
          </View>
        )}
        <Ionicons name="chevron-forward" size={18} color={p.textMuted} />
      </Card>
    </Pressable>
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
