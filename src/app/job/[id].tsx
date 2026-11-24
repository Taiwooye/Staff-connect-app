import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { Field, FormScreen } from '@/components/form-screen';
import { MatchBadge, ReasonList } from '@/components/match-badge';
import { useToast } from '@/components/toast';
import { Button, Card, DemoNote, PaletteProvider, Row, T, tap } from '@/components/ui';
import { getJob, getService, type IconName, type JobOpening } from '@/lib/catalog';
import { daysUntil, formatStart } from '@/lib/hiring';
import { formatPay, matchJob } from '@/lib/matching';
import { FEE_RATE, splitPayment } from '@/lib/money';
import { type Application, newApplication, rateInUnit, respondToOfferAction, useNow, useStore } from '@/lib/store';
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
  const toast = useToast();
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
      dispatch({ type: 'apply', application: newApplication({ jobId: job.id, rate, note: note.trim() }) });
      setSending(false);
    }, 700);
  };

  const openChat = () => router.push(`/chat/${job.id}`);

  const facts: { icon: IconName; label: string }[] = [
    { icon: 'location-outline', label: `${job.area}, ${job.state}` },
    { icon: 'time-outline', label: job.schedule.join(', ') },
    { icon: 'people-outline', label: job.workers > 1 ? `${job.workers} people needed` : '1 person needed' },
    { icon: 'business-outline', label: `${job.hirer} · ${job.hirerType}` },
  ];

  const footer = !application ? (
    <Button label={`Apply for ${formatNaira(rate)}${UNIT_LABEL[job.payUnit]}`} icon="paper-plane" onPress={submit} loading={sending} />
  ) : application.status === 'offered' ? (
    <>
      <Button
        label="Accept offer"
        icon="checkmark-circle"
        onPress={() => {
          tap('success');
          dispatch(respondToOfferAction(job.id, true, application.offer?.startAt));
        }}
      />
      <Button label="Decline offer" variant="ghost" size="md" onPress={() => dispatch(respondToOfferAction(job.id, false))} />
    </>
  ) : application.messages.length ? (
    <ChatButton application={application} hirer={job.hirer} onPress={openChat} />
  ) : (
    <Button
      label="Withdraw application"
      variant="secondary"
      onPress={() => {
        dispatch({ type: 'withdrawApplication', jobId: job.id });
        router.back();
      }}
    />
  );

  return (
    <>
      <FormScreen
        title={job.title}
        subtitle={`${service.label} · posted ${job.postedDaysAgo === 1 ? 'yesterday' : `${job.postedDaysAgo} days ago`}`}
        footer={footer}>
        <Row style={{ justifyContent: 'space-between' }}>
          <T variant="title" color={p.accent}>
            {formatPay(job)}
          </T>
          {match && match.score > 0 && <MatchBadge score={match.score} />}
        </Row>

        {application && <NextStep application={application} job={job} onChat={openChat} toast={toast.show} />}

        {match && match.reasons.length > 0 && !application && (
          <Card style={{ gap: 10 }}>
            <T variant="heading">Why this matches you</T>
            <ReasonList reasons={match.reasons} max={5} />
          </Card>
        )}
        {!offersService && !application && (
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
            <FeeLine amount={rate} unit={UNIT_LABEL[job.payUnit]} />
            <Field
              label="Note to the hirer (optional)"
              value={note}
              onChangeText={setNote}
              multiline
              maxLength={280}
              placeholder="Say why you’re a good fit and when you can start."
            />
            <DemoNote>Demo: hirers reply within seconds. You get an offer if your asking pay is within their budget.</DemoNote>
          </View>
        )}
      </FormScreen>
      {toast.node}
    </>
  );
}

/** Shows exactly where the application stands and what to do next. */
function NextStep({ application: a, job, onChat, toast }: { application: Application; job: JobOpening; onChat: () => void; toast: (m: string) => void }) {
  const now = useNow(60000);
  const steps = ['Applied', 'Shortlisted', 'Offer', 'Hired'];
  const order = ['applied', 'shortlisted', 'offered', 'hired'];
  const reached = order.indexOf(a.status === 'not_selected' ? 'shortlisted' : a.status === 'declined' ? 'offered' : a.status);
  const ended = a.status === 'not_selected' || a.status === 'declined';

  return (
    <View style={{ gap: 12 }}>
      <Row gap={4}>
        {steps.map((label, i) => (
          <View key={label} style={{ flex: 1, gap: 6 }}>
            <View style={{ height: 4, borderRadius: 2, backgroundColor: i <= reached ? (ended && i === reached ? p.textMuted : p.accent) : p.surfaceAlt }} />
            <T variant="caption" color={i <= reached ? p.text : p.textMuted}>
              {label}
            </T>
          </View>
        ))}
      </Row>

      {a.status === 'applied' && (
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator color={p.accent} />
          <View style={{ flex: 1 }}>
            <T variant="label">Waiting for {job.hirer} to review</T>
            <T variant="caption" muted>
              You asked {formatNaira(a.rate)}. We’ll notify you as soon as they respond.
            </T>
          </View>
        </Card>
      )}

      {a.status === 'shortlisted' && (
        <Card style={{ gap: 10, borderColor: p.accent }}>
          <T variant="label">⭐ You’re shortlisted</T>
          <T variant="caption" muted>
            {job.hirer} sent you a message. Replying quickly improves your chances of an offer.
          </T>
          <ChatButton application={a} hirer={job.hirer} onPress={onChat} />
        </Card>
      )}

      {a.status === 'offered' && a.offer && (
        <Card style={{ gap: 12, borderColor: p.accent, borderWidth: 2 }}>
          <T variant="heading">🎉 You have a job offer</T>
          <Info icon="calendar" label="Start" value={`${formatStart(a.offer.startAt)} (${daysUntil(a.offer.startAt, now)})`} />
          <Info icon="location" label="Where" value={`${job.area}, ${job.state} · full address after you accept`} />
          <Info
            icon="cash"
            label="Pay"
            value={`${formatNaira(a.rate)}${UNIT_LABEL[job.payUnit]} · you receive ${formatNaira(splitPayment(a.rate).toWorker)} after the 10% fee`}
          />
          <Info icon="person" label="Contact" value={a.offer.contactName} />
          <T variant="caption" muted>
            Accept below to confirm your start date. {job.hirer} will be told straight away.
          </T>
          <ChatButton application={a} hirer={job.hirer} onPress={onChat} secondary />
        </Card>
      )}

      {a.status === 'hired' && a.offer && (
        <Card style={{ gap: 12, borderColor: p.success, borderWidth: 2 }}>
          <Row gap={8}>
            <Ionicons name="checkmark-circle" size={22} color={p.success} />
            <T variant="heading" color={p.success} style={{ flex: 1 }}>
              You’re hired. You start {daysUntil(a.offer.startAt, now)}
            </T>
          </Row>
          <Info icon="calendar" label="Start" value={formatStart(a.offer.startAt)} />
          <Info icon="location" label="Address" value={`14 Palm Avenue, ${job.area}, ${job.state}`} />
          <Info icon="person" label="Ask for" value={`${a.offer.contactName} · ${a.offer.contactPhone}`} />
          <Row gap={8} style={{ flexWrap: 'wrap' }}>
            <Button label="Call" icon="call" size="md" variant="secondary" onPress={() => toast(`Calling ${a.offer!.contactPhone} (demo).`)} />
            <Button label="Directions" icon="navigate" size="md" variant="secondary" onPress={() => toast('Opening directions (demo).')} />
            <Button label="Add to calendar" icon="calendar" size="md" variant="secondary" onPress={() => toast('Added to your calendar (demo).')} />
          </Row>
          <T variant="caption" muted>
            Arrive 10 minutes early and bring a valid ID. We’ll remind you the day before.
          </T>
        </Card>
      )}

      {a.status === 'not_selected' && (
        <Card style={{ gap: 6 }}>
          <T variant="label">Not selected this time</T>
          <T variant="caption" muted>
            {job.hirer} chose another candidate. Check Recommended jobs; new ones are posted daily.
          </T>
        </Card>
      )}
      {a.status === 'declined' && (
        <Card>
          <T variant="caption" muted>
            You declined this offer. {job.hirer} has been told.
          </T>
        </Card>
      )}
    </View>
  );
}

function ChatButton({ application, hirer, onPress, secondary }: { application: Application; hirer: string; onPress: () => void; secondary?: boolean }) {
  return (
    <View>
      <Button
        label={application.unread ? `Reply to ${hirer}` : `Message ${hirer}`}
        icon="chatbubbles"
        variant={secondary ? 'secondary' : 'primary'}
        size={secondary ? 'md' : 'lg'}
        onPress={onPress}
      />
      {application.unread > 0 && (
        <View
          style={{
            position: 'absolute',
            top: -6,
            right: -6,
            minWidth: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: p.danger,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 5,
          }}>
          <T variant="caption" color="#fff" style={{ fontWeight: '800' }}>
            {application.unread}
          </T>
        </View>
      )}
    </View>
  );
}

function Info({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <Row gap={10} style={{ alignItems: 'flex-start' }}>
      <Ionicons name={icon} size={18} color={p.accent} style={{ marginTop: 1 }} />
      <View style={{ flex: 1 }}>
        <T variant="caption" muted>
          {label}
        </T>
        <T variant="label">{value}</T>
      </View>
    </Row>
  );
}

function FeeLine({ amount, unit }: { amount: number; unit: string }) {
  const { fee, toWorker } = splitPayment(amount);
  return (
    <Card style={{ gap: 6 }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <T muted>Hirer pays</T>
        <T variant="label">
          {formatNaira(amount)}
          {unit}
        </T>
      </Row>
      <Row style={{ justifyContent: 'space-between' }}>
        <T muted>StaffConnect service fee ({FEE_RATE * 100}%)</T>
        <T variant="label">−{formatNaira(fee)}</T>
      </Row>
      <Row style={{ justifyContent: 'space-between' }}>
        <T variant="label">You receive</T>
        <T variant="heading" color={p.accent}>
          {formatNaira(toWorker)}
          {unit}
        </T>
      </Row>
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
