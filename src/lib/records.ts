import { useEffect, useRef } from 'react';

import { supabase } from './supabase';

/**
 * Keeps StaffConnect's company records in Supabase: each user's contact details
 * (including street address) and every job with where it took place. The app
 * still works fully offline; records are sent whenever Supabase is reachable.
 */

type Role = 'client' | 'provider';

export type ContactRecord = {
  name: string;
  phone: string;
  state: string;
  area: string;
  address?: string;
  landmark?: string;
};

export type JobRecord = {
  id: string;
  kind: 'booking' | 'pro_job';
  serviceId: string;
  status: string;
  area: string;
  address: string;
  landmark?: string;
  scheduledFor?: string;
  hours: number;
  amount: number;
  payment: 'cash' | 'transfer';
  clientName?: string;
  proName?: string;
  createdAt: number;
};

let sessionPromise: Promise<string | null> | null = null;

/** Signs in once per install (anonymously) so rows are tied to this user. */
function ensureUser(role: Role, name: string): Promise<string | null> {
  if (!supabase) return Promise.resolve(null);
  sessionPromise ??= (async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) return data.session.user.id;
    const { data: created, error } = await supabase.auth.signInAnonymously({
      options: { data: { account_type: role, display_name: name } },
    });
    if (error) throw error;
    return created.user?.id ?? null;
  })().catch((e) => {
    sessionPromise = null; // try again next time
    warnOnce(e);
    return null;
  });
  return sessionPromise;
}

let warned = false;
function warnOnce(e: unknown) {
  if (warned) return;
  warned = true;
  console.warn('[StaffConnect] Could not save records to Supabase:', e instanceof Error ? e.message : e);
}

async function saveContact(role: Role, c: ContactRecord) {
  const userId = await ensureUser(role, c.name);
  if (!supabase || !userId || !c.address) return;
  const { error } = await supabase.from('contact_details').upsert({
    user_id: userId,
    account_type: role,
    full_name: c.name,
    phone: c.phone || null,
    state: c.state,
    area: c.area,
    address: c.address,
    landmark: c.landmark ?? null,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

async function saveJobs(role: Role, name: string, jobs: JobRecord[]) {
  const userId = await ensureUser(role, name);
  if (!supabase || !userId || !jobs.length) return;
  const { error } = await supabase.from('job_records').upsert(
    jobs.map((j) => ({
      user_id: userId,
      id: j.id,
      kind: j.kind,
      service_id: j.serviceId,
      status: j.status,
      area: j.area,
      address: j.address,
      landmark: j.landmark ?? null,
      scheduled_for: j.scheduledFor ?? null,
      hours: j.hours,
      amount: Math.round(j.amount),
      payment: j.payment,
      client_name: j.clientName ?? null,
      pro_name: j.proName ?? null,
      created_at: new Date(j.createdAt).toISOString(),
      updated_at: new Date().toISOString(),
    })),
    { onConflict: 'user_id,id' },
  );
  if (error) throw error;
}

/** Sends the contact details and any new or changed jobs to Supabase. */
export function useCompanyRecords(role: Role | undefined, contact: ContactRecord | undefined, jobs: JobRecord[]) {
  const lastContact = useRef('');
  const lastJobs = useRef(new Map<string, string>());

  const contactKey = contact && role ? JSON.stringify([role, contact]) : '';
  useEffect(() => {
    if (!supabase || !role || !contact || contactKey === lastContact.current) return;
    lastContact.current = contactKey;
    saveContact(role, contact).catch((e) => {
      lastContact.current = '';
      warnOnce(e);
    });
    // contactKey captures every field of role + contact
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactKey]);

  useEffect(() => {
    if (!supabase || !role || !contact) return;
    const changed = jobs.filter((j) => lastJobs.current.get(j.id) !== JSON.stringify(j));
    if (!changed.length) return;
    changed.forEach((j) => lastJobs.current.set(j.id, JSON.stringify(j)));
    saveJobs(role, contact.name, changed).catch((e) => {
      changed.forEach((j) => lastJobs.current.delete(j.id));
      warnOnce(e);
    });
  }, [role, contact, jobs]);
}
