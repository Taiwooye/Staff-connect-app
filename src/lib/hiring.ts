import type { JobOpening } from './catalog';
import { formatPay } from './matching';

/** When a newly hired worker should start, based on the job's schedule. */
export function suggestedStart(job: JobOpening, now: number) {
  const d = new Date(now);
  const weekend = job.schedule.includes('Weekends') && job.schedule.length === 1;
  const targetDay = weekend ? 6 : 1; // Saturday or Monday
  let add = (targetDay - d.getDay() + 7) % 7;
  if (add < 2) add += 7; // give at least a couple of days' notice
  d.setDate(d.getDate() + add);
  const hour = job.schedule.includes('Weekday afternoons') && !job.schedule.includes('Weekday mornings') ? 13 : job.schedule.includes('Evenings') ? 18 : 8;
  d.setHours(hour, 0, 0, 0);
  return d.getTime();
}

export function formatStart(ts: number) {
  const d = new Date(ts);
  return `${d.toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'short' })}, ${d.toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
}

export function daysUntil(ts: number, now: number) {
  const a = new Date(now);
  a.setHours(0, 0, 0, 0);
  const b = new Date(ts);
  b.setHours(0, 0, 0, 0);
  const days = Math.round((b.getTime() - a.getTime()) / 86400000);
  return days <= 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days`;
}

export function hirerContact(job: JobOpening) {
  let n = 0;
  for (const c of job.id) n = (n * 17 + c.charCodeAt(0)) % 10000;
  return { name: job.hirer, phone: `+234 803 555 ${String(n).padStart(4, '0')}` };
}

export function shortlistMessage(job: JobOpening, workerFirst: string) {
  return `Hi ${workerFirst}, thanks for applying for "${job.title}". Your profile looks great and we've shortlisted you. When would you be able to start?`;
}

export function offerMessage(job: JobOpening, workerFirst: string, startAt: number) {
  return `Good news, ${workerFirst}! We'd like to hire you for "${job.title}". Can you start ${formatStart(startAt)} in ${job.area}? Pay is ${formatPay(job)}. Please accept the offer in the app so we can share the full address.`;
}

export function rejectionMessage(job: JobOpening, workerFirst: string) {
  return `Hi ${workerFirst}, thank you for applying for "${job.title}". We've gone with another candidate whose asking pay fit our budget. We wish you all the best.`;
}

/** Simple canned replies so the demo conversation feels alive. */
export function hirerReply(text: string, job: JobOpening, hired: boolean, startAt?: number) {
  const t = text.toLowerCase();
  if (hired && startAt) return `Perfect. See you ${formatStart(startAt)}. Call us on arrival if you can't find the gate.`;
  if (/(start|when|available|resume)/.test(t)) return 'Ideally early next week. We’ll confirm the exact day with the offer.';
  if (/(pay|salary|money|rate|amount)/.test(t)) return `The pay is ${formatPay(job)}, through StaffConnect. We can review it after the first month.`;
  if (/(where|address|location|area)/.test(t)) return `We're in ${job.area}. The full address is shared once you accept an offer.`;
  if (/(thank|ok|okay|great|sure|yes)/.test(t)) return 'Great, thank you! We’ll be in touch shortly.';
  return 'Thanks for your message. We’ll get back to you shortly.';
}
