import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { applicationCopy } from '@/components/application-status';
import { Field, FormScreen } from '@/components/form-screen';
import { MatchBadge, ReasonList } from '@/components/match-badge';
import { Button, Card, DemoNote, PaletteProvider, Row, T, tap } from '@/components/ui';
import { getJob, getService, type IconName, type JobOpening } from '@/lib/catalog';
import { formatPay, matchJob } from '@/lib/matching';
import { type Application, rateInUnit, useStore } from '@/lib/store';
import { formatNaira, providerPalette as p, radius } from '@/lib/theme';

const STEP = { hour: 100, day: 1000, month: 5000 } as const;
const UNIT_LABEL = { hour: '/hr', day: '/day', month: '/month' } as const;

export default function JobDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const job = getJob(id);
  return (
    <PaletteProvider palette={p}>
      {job ? (
        <Detail job={job} />
      ) : (
        <FormScreen title="Job not found">
          <Button label="Back to jobs" onPress={() => router.replace('/provider/jobs')} />
        </FormScreen>
      )}
    </PaletteProvider>
  );
}

function Detail({ job }: { job: JobOpening }) {
  const { state, dispatch } = useStore();
  const pp = state.providerProfile;
  const service = getService(job.serviceId);
  const match = pp ? matchJob(job, pp, state.profile?.state ?? 'Lagos') : null;
  const application = state.applications.find((a) => a.jobId === job.id);

  const suggested = Math.min(job.payMax, Math.max(job.payMin, rateInUnit(pp?.hourlyRate ?? service.hourlyRate, job.payUnit)));
  const [rate, setRate] = useState(suggested);
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);

  const offersService = pp?.services.includes(job.serviceId) ?? false;

  const submit = () => {
    setSending(true);
    setTimeout(() => {
      tap('success');
      const now = Date.now();
      const a: Application = { jobId: job.id, rate, note: note.trim(), status: 'applied', appliedAt: now, updatedAt: now };
      dispatch({ type: 'apply', application: a });
      setSending(false);
    }, 700);
  };

  const facts: { icon: IconName; label: string }[] = [
    { icon: 'location-outline', label: `${job.area}, ${job.state}` },
    { icon: 'time-outline', label: job.schedule.join(', ') },
    { icon: 'people-outline', label: job.workers > 1 ? `${job.workers} people needed` : '1 person needed' },
    { icon: 'business-outline', label: `${job.hirer} · ${job.hirerType}` },
  ];

  return (
    <FormScreen
      title={job.title}
      subtitle={`${service.label} · posted ${job.postedDaysAgo === 1 ? 'yesterday' : `${job.postedDaysAgo} days ago`}`}
      footer={
        application ? (
          application.status === 'hired' ? (
            <Button label="Back to jobs" variant="secondary" onPress={() => router.back()} />
          ) : application.status === 'not_selected' ? (
            <Button label="See other jobs" onPress={() => router.back()} />
          ) : (
            <Button
              label="Withdraw application"
              variant="secondary"
              onPress={() => {
                dispatch({ type: 'withdrawApplication', jobId: job.id });
                router.back();
              }}
            />
          )
        ) : (
          <Button label={`Apply for ${formatNaira(rate)}${UNIT_LABEL[job.payUnit]}`} icon="paper-plane" onPress={submit} loading={sending} />
        )
      }>
      <Row style={{ justifyContent: 'space-between' }}>
        <T variant="title" color={p.accent}>
          {formatPay(job)}
        </T>
        {match && match.score > 0 && <MatchBadge score={match.score} />}
      </Row>

      {application ? <Timeline application={application} job={job} /> : null}

      {match && match.reasons.length > 0 && !application && (
        <Card style={{ gap: 10 }}>
          <T variant="heading">Why this matches you</T>
          <ReasonList reasons={match.reasons} max={5} />
        </Card>
      )}
      {!offersService && (
        <Row gap={8} style={{ backgroundColor: p.surfaceAlt, borderRadius: radius.sm, padding: 12 }}>
          <Ionicons name="information-circle-outline" size={18} color={p.warning} />
          <T variant="caption" style={{ flex: 1 }}>
            {service.label} isn’t in your services. You can still apply; mention your experience in the note.
          </T>
        </Row>
      )}

      <Card style={{ gap: 12 }}>
        {facts.map((f) => (
          <Row key={f.label} gap={10}>
            <Ionicons name={f.icon} size={18} color={p.textMuted} />
            <T>{f.label}</T>
          </Row>
        ))}
      </Card>

      <View style={{ gap: 8 }}>
        <T variant="heading">About the job</T>
        <T muted>{job.description}</T>
      </View>
      <View style={{ gap: 8 }}>
        <T variant="heading">They’re looking for</T>
        {job.requirements.map((r) => (
          <Row key={r} gap={8}>
            <Ionicons name="ellipse" size={6} color={p.accent} />
            <T>{r}</T>
          </Row>
        ))}
      </View>

      {!application && (
        <View style={{ gap: 14 }}>
          <T variant="heading">Your application</T>
          <Card style={{ alignItems: 'center', gap: 8 }}>
            <T variant="overline" muted>
              Your asking pay
            </T>
            <Row gap={18}>
              <Step icon="remove" onPress={() => setRate(Math.max(STEP[job.payUnit], rate - STEP[job.payUnit]))} />
              <T variant="title">
                {formatNaira(rate)}
                <T muted variant="label">
                  {UNIT_LABEL[job.payUnit]}
                </T>
              </T>
              <Step icon="add" onPress={() => setRate(rate + STEP[job.payUnit])} />
            </Row>
            <T variant="caption" color={rate > job.payMax ? p.warning : p.textMuted}>
              {rate > job.payMax ? 'Above the hirer’s budget. This may lower your chances.' : `Hirer’s budget: ${formatPay(job)}`}
            </T>
          </Card>
          <Field
            label="Note to the hirer (optional)"
            value={note}
            onChangeText={setNote}
            multiline
            maxLength={280}
            placeholder="Say why you’re a good fit and when you can start."
          />
          <DemoNote>Demo: hirers respond in seconds. You’re hired if your asking pay is within their budget.</DemoNote>
        </View>
      )}
    </FormScreen>
  );
}

function Timeline({ application, job }: { application: Application; job: JobOpening }) {
  const { state } = useStore();
  const final = application.status === 'hired' || application.status === 'not_selected';
  const steps: { key: string; label: string; done: boolean; active: boolean }[] = [
    { key: 'applied', label: `Applied at ${formatNaira(application.rate)}${UNIT_LABEL[job.payUnit]}`, done: true, active: false },
    {
      key: 'shortlisted',
      label: 'Shortlisted by the hirer',
      done: application.status !== 'applied',
      active: application.status === 'applied',
    },
    {
      key: 'final',
      label: application.status === 'not_selected' ? applicationCopy.not_selected.label : 'Hired',
      done: final,
      active: application.status === 'shortlisted',
    },
  ];

  return (
    <Card style={{ gap: 14, borderColor: application.status === 'hired' ? p.success : p.border }}>
      {application.status === 'hired' && (
        <View style={{ gap: 6 }}>
          <T variant="heading" color={p.success}>
            🎉 {job.hirer} hired you!
          </T>
          <T muted>
            They’ll call you on {state.profile?.phone} to agree a start date. Keep your phone close. (Demo: no call is made.)
          </T>
        </View>
      )}
      {application.status === 'not_selected' && (
        <T muted>The hirer went with someone else this time. Keep applying; new jobs are posted daily.</T>
      )}
      {steps.map((s) => (
        <Row key={s.key} gap={12}>
          <View style={{ width: 24, alignItems: 'center' }}>
            {s.done ? (
              <Ionicons
                name={s.key === 'final' && application.status === 'not_selected' ? 'close-circle' : 'checkmark-circle'}
                size={22}
                color={s.key === 'final' && application.status === 'not_selected' ? p.textMuted : p.success}
              />
            ) : s.active ? (
              <ActivityIndicator color={p.accent} size="small" />
            ) : (
              <Ionicons name="ellipse-outline" size={20} color={p.border} />
            )}
          </View>
          <T variant="label" color={s.done || s.active ? p.text : p.textMuted}>
            {s.label}
          </T>
        </Row>
      ))}
    </Card>
  );
}

function Step({ icon, onPress }: { icon: 'add' | 'remove'; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel={icon === 'add' ? 'Increase' : 'Decrease'}
      onPress={() => {
        tap();
        onPress();
      }}
      style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: p.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={icon} size={22} color={p.text} />
    </Pressable>
  );
}
