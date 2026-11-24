/**
 * StaffConnect money rules
 * - Every payment carries a 10% StaffConnect fee taken out of the amount paid:
 *   a client pays ₦30,000 → the worker receives ₦27,000 → StaffConnect keeps ₦3,000.
 * - Bank transfer is the default. If a client pays cash, the worker keeps the cash and
 *   the 10% fee is deducted from the worker's StaffConnect balance instead.
 * - A worker's balance is paid out automatically every Friday to their bank account.
 *   They can withdraw any time, or move money to their Wallet to skip Friday payouts.
 */
export const FEE_RATE = 0.1;

export function splitPayment(amount: number) {
  const fee = Math.round(amount * FEE_RATE);
  return { fee, toWorker: amount - fee };
}

const PAYOUT_HOUR = 9; // Friday payouts run at 9:00 AM

/** The most recent Friday payout run at or before `now`. */
export function lastPayoutRun(now: number) {
  const d = new Date(now);
  const back = (d.getDay() - 5 + 7) % 7;
  d.setDate(d.getDate() - back);
  d.setHours(PAYOUT_HOUR, 0, 0, 0);
  if (d.getTime() > now) d.setDate(d.getDate() - 7);
  return d.getTime();
}

/** The next Friday payout run after `now`. */
export function nextPayoutRun(now: number) {
  return lastPayoutRun(now) + 7 * 86400000;
}

export function formatDay(ts: number) {
  return new Date(ts).toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'short' });
}

/** A unique transfer account for each payment (demo values, not a real bank account). */
export function virtualAccountFor(jobId: string) {
  let n = 0;
  for (const c of jobId) n = (n * 31 + c.charCodeAt(0)) % 100000000;
  return { bank: 'Wema Bank', name: 'StaffConnect Payments', number: `99${String(n).padStart(8, '0')}` };
}
