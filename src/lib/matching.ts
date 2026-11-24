import {
  type Arrangement,
  type DemoPro,
  demoPros,
  getService,
  HOURS_PER_UNIT,
  type JobOpening,
  jobOpenings,
} from './catalog';

export type Frequency = 'One-off' | 'Weekly' | 'Daily' | 'Live-in';
export const frequencies: { id: Frequency; label: string; hint: string }[] = [
  { id: 'One-off', label: 'One-off', hint: 'A single job' },
  { id: 'Weekly', label: 'Weekly', hint: 'Same day each week' },
  { id: 'Daily', label: 'Daily', hint: 'Comes in on weekdays' },
  { id: 'Live-in', label: 'Live-in', hint: 'Lives with you' },
];

export type ClientPrefs = { services: string[]; frequency: Frequency };

export type Match<T> = { item: T; score: number; reasons: string[] };

// How well a pro's working arrangement suits the client's frequency (0–15).
const arrangementFit: Record<Frequency, Partial<Record<Arrangement, number>>> = {
  'Live-in': { 'Live-in': 15, Flexible: 6 },
  Daily: { Daily: 15, Flexible: 10, 'Live-in': 5 },
  Weekly: { Weekends: 15, Flexible: 15, Daily: 10 },
  'One-off': { Flexible: 15, Weekends: 12, Daily: 8 },
};

/**
 * Ranks professionals for a client. Score out of 100:
 * service 45 · location 30 · arrangement 15 · track record 10.
 * Pros in another state, or without a needed service, are left out.
 */
export function matchPros(prefs: ClientPrefs, home: { state: string; area: string }): Match<DemoPro>[] {
  return demoPros
    .filter((p) => p.state === home.state && p.services.some((s) => prefs.services.includes(s)))
    .map((p) => {
      const shared = p.services.filter((s) => prefs.services.includes(s));
      const reasons = [`Offers ${shared.map((s) => getService(s).short.toLowerCase()).join(' & ')}`];
      // Covering every service the client needs earns the full 45; partial cover earns less.
      let score = Math.round(30 + 15 * (shared.length / prefs.services.length));

      if (p.area === home.area) {
        score += 30;
        reasons.push(`Lives in ${p.area}`);
      } else {
        score += 14;
        reasons.push(`Nearby in ${p.area}`);
      }

      const fit = arrangementFit[prefs.frequency][p.arrangement] ?? 0;
      score += fit;
      if (fit >= 10) reasons.push(p.arrangement === 'Flexible' ? 'Flexible schedule' : `Works ${p.arrangement.toLowerCase()}`);

      score += Math.round(Math.max(0, Math.min(1, (p.rating - 4.5) / 0.4)) * 10);
      if (p.rating >= 4.8) reasons.push(`${p.rating}★ from ${p.jobs} jobs`);

      return { item: p, score: Math.min(99, score), reasons };
    })
    .sort((a, b) => b.score - a.score);
}

type WorkerProfile = { services: string[]; areas: string[]; availability: string[]; hourlyRate: number };

/**
 * Ranks job openings for a professional. Score out of 100:
 * service 45 · location 30 · schedule 15 · pay 10.
 * Jobs for a service they don't offer score 0 and only show under "All jobs".
 */
export function matchJob(job: JobOpening, worker: WorkerProfile, homeState: string): Match<JobOpening> {
  const reasons: string[] = [];
  if (!worker.services.includes(job.serviceId)) return { item: job, score: 0, reasons };

  let score = 45;
  reasons.push(`You offer ${getService(job.serviceId).short.toLowerCase()}`);

  if (worker.areas.includes(job.area)) {
    score += 30;
    reasons.push(`In your area (${job.area})`);
  } else if (job.state === homeState) {
    score += 12;
    reasons.push(`In ${job.state}`);
  }

  const overlap = job.schedule.filter((s) => worker.availability.includes(s));
  if (overlap.length) {
    score += Math.round((overlap.length / job.schedule.length) * 15);
    reasons.push(`Fits your ${overlap[0].toLowerCase()}`);
  }

  const maxHourly = job.payMax / HOURS_PER_UNIT[job.payUnit];
  if (worker.hourlyRate <= maxHourly) {
    score += 10;
    reasons.push('Pays your rate');
  } else if (worker.hourlyRate <= maxHourly * 1.2) {
    score += 5;
  }

  return { item: job, score: Math.min(99, score), reasons };
}

export function matchJobs(worker: WorkerProfile, homeState: string) {
  return jobOpenings.map((j) => matchJob(j, worker, homeState)).sort((a, b) => b.score - a.score);
}

export const RECOMMENDED_THRESHOLD = 60;

export function formatPay(job: Pick<JobOpening, 'payMin' | 'payMax' | 'payUnit'>) {
  const k = (n: number) => (n >= 10000 ? `₦${Math.round(n / 1000)}k` : `₦${n.toLocaleString('en-NG')}`);
  return `${k(job.payMin)}–${k(job.payMax)}/${job.payUnit === 'hour' ? 'hr' : job.payUnit}`;
}
