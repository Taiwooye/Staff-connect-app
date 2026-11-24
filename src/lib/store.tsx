import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';

import {
  type DemoPro,
  demoClients,
  getJob,
  getPro,
  getService,
  HOURS_PER_UNIT,
  PLATFORM_COMMISSION,
  SERVICE_FEE_RATE,
  services,
} from './catalog';
import type { ClientPrefs } from './matching';

export type Role = 'client' | 'provider';

export type Profile = {
  name: string;
  phone: string;
  state: string;
  area: string;
  photo?: string; // data URI of a small square photo
};

export type BankAccount = {
  bank: string;
  accountNumber: string;
  accountName: string;
};

export type Review = {
  id: string;
  proId: string;
  jobId: string;
  rating: number;
  tags: string[];
  comment: string;
  at: number;
};

export type DocKey = 'id' | 'selfie' | 'address' | 'reference';

export type ProviderProfile = {
  services: string[];
  areas: string[];
  hourlyRate: number;
  availability: string[];
  bio: string;
  docs: Record<DocKey, boolean>;
  status: 'review' | 'approved';
  submittedAt: number;
};

export type ClientJobStatus =
  | 'choosing' // client is comparing pros; nothing is sent yet
  | 'searching' // request sent to the chosen pro, waiting for them to accept
  | 'accepted'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type ClientJob = {
  id: string;
  serviceId: string;
  area: string;
  address: string;
  when: string;
  hours: number;
  tasks: string[];
  notes: string;
  subtotal: number;
  fee: number;
  total: number;
  payment: 'cash' | 'transfer';
  status: ClientJobStatus;
  createdAt: number;
  acceptedAt?: number;
  arrivedAt?: number;
  startedAt?: number;
  completedAt?: number;
  travelMs: number;
  pin: string;
  pro?: DemoPro;
  preferredProId?: string;
  rating?: number;
  tip?: number;
  reviewSkipped?: boolean;
};

export type Offer = {
  id: string;
  serviceId: string;
  clientName: string;
  clientRating: number;
  area: string;
  distanceKm: number;
  hours: number;
  gross: number;
  pay: number;
  tasks: string[];
  pin: string;
  createdAt: number;
  expiresAt: number;
};

export type ProviderJobStatus = 'to_client' | 'arrived' | 'in_progress' | 'completed';

export type ProviderJob = Offer & {
  status: ProviderJobStatus;
  acceptedAt: number;
  startedAt?: number;
  completedAt?: number;
  clientRatingGiven?: number;
};

type State = {
  hydrated: boolean;
  role?: Role;
  profile?: Profile;
  providerProfile?: ProviderProfile;
  online: boolean;
  clientJobs: ClientJob[];
  providerJobs: ProviderJob[];
  incoming?: Offer;
  offersSeen: number;
  offersAccepted: number;
  clientPrefs?: ClientPrefs;
  applications: Application[];
  bankAccount?: BankAccount;
  reviews: Review[];
};

export type ApplicationStatus = 'applied' | 'shortlisted' | 'hired' | 'not_selected';

export type Application = {
  jobId: string;
  rate: number; // proposed pay, in the job's pay unit
  note: string;
  status: ApplicationStatus;
  appliedAt: number;
  updatedAt: number;
};

const initialState: State = {
  hydrated: false,
  online: false,
  clientJobs: [],
  providerJobs: [],
  offersSeen: 0,
  offersAccepted: 0,
  applications: [],
  reviews: [],
};

type Action =
  | { type: 'hydrate'; state: Partial<State> }
  | { type: 'setRole'; role: Role }
  | { type: 'setProfile'; profile: Profile }
  | { type: 'submitProvider'; providerProfile: ProviderProfile }
  | { type: 'approveProvider' }
  | { type: 'setOnline'; online: boolean }
  | { type: 'requestJob'; job: ClientJob }
  | { type: 'updateClientJob'; id: string; patch: Partial<ClientJob> }
  | { type: 'offer'; offer: Offer }
  | { type: 'dismissOffer' }
  | { type: 'acceptOffer'; now: number }
  | { type: 'updateProviderJob'; id: string; patch: Partial<ProviderJob> }
  | { type: 'setClientPrefs'; prefs: ClientPrefs }
  | { type: 'apply'; application: Application }
  | { type: 'updateApplication'; jobId: string; patch: Partial<Application> }
  | { type: 'withdraw'; jobId: string }
  | { type: 'updateProfile'; patch: Partial<Profile> }
  | { type: 'updateProviderProfile'; patch: Partial<ProviderProfile> }
  | { type: 'setBank'; bank?: BankAccount }
  | { type: 'choosePro'; jobId: string; pro: DemoPro; now: number }
  | { type: 'rateJob'; jobId: string; review: Review; tip: number }
  | { type: 'reset' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'hydrate':
      return { ...state, ...action.state, hydrated: true };
    case 'setRole':
      return { ...state, role: action.role, online: action.role === 'provider' ? state.online : false };
    case 'setProfile':
      return { ...state, profile: action.profile };
    case 'submitProvider':
      return { ...state, providerProfile: action.providerProfile };
    case 'approveProvider':
      return state.providerProfile
        ? { ...state, providerProfile: { ...state.providerProfile, status: 'approved' } }
        : state;
    case 'setOnline':
      return { ...state, online: action.online, incoming: action.online ? state.incoming : undefined };
    case 'requestJob':
      return { ...state, clientJobs: [action.job, ...state.clientJobs] };
    case 'updateClientJob':
      return {
        ...state,
        clientJobs: state.clientJobs.map((j) => (j.id === action.id ? { ...j, ...action.patch } : j)),
      };
    case 'offer':
      return { ...state, incoming: action.offer, offersSeen: state.offersSeen + 1 };
    case 'dismissOffer':
      return { ...state, incoming: undefined };
    case 'acceptOffer': {
      if (!state.incoming) return state;
      const job: ProviderJob = { ...state.incoming, status: 'to_client', acceptedAt: action.now };
      return {
        ...state,
        incoming: undefined,
        offersAccepted: state.offersAccepted + 1,
        providerJobs: [job, ...state.providerJobs],
      };
    }
    case 'updateProviderJob':
      return {
        ...state,
        providerJobs: state.providerJobs.map((j) => (j.id === action.id ? { ...j, ...action.patch } : j)),
      };
    case 'setClientPrefs':
      return { ...state, clientPrefs: action.prefs };
    case 'apply':
      return {
        ...state,
        applications: [action.application, ...state.applications.filter((a) => a.jobId !== action.application.jobId)],
      };
    case 'updateApplication':
      return {
        ...state,
        applications: state.applications.map((a) => (a.jobId === action.jobId ? { ...a, ...action.patch } : a)),
      };
    case 'withdraw':
      return { ...state, applications: state.applications.filter((a) => a.jobId !== action.jobId) };
    case 'updateProfile':
      return state.profile ? { ...state, profile: { ...state.profile, ...action.patch } } : state;
    case 'updateProviderProfile':
      return state.providerProfile ? { ...state, providerProfile: { ...state.providerProfile, ...action.patch } } : state;
    case 'setBank':
      return { ...state, bankAccount: action.bank };
    case 'choosePro':
      return {
        ...state,
        clientJobs: state.clientJobs.map((j) => {
          if (j.id !== action.jobId) return j;
          const price = priceFor(j.serviceId, j.hours, action.pro.hourlyRate);
          return { ...j, ...price, preferredProId: action.pro.id, status: 'searching', createdAt: action.now };
        }),
      };
    case 'rateJob':
      return {
        ...state,
        clientJobs: state.clientJobs.map((j) =>
          j.id === action.jobId ? { ...j, rating: action.review.rating, tip: action.tip } : j,
        ),
        reviews: [action.review, ...state.reviews.filter((r) => r.jobId !== action.jobId)],
      };
    case 'reset':
      return { ...initialState, hydrated: true };
  }
}

const STORAGE_KEY = 'staffconnect-mobile/v1';

// Demo time compression: one booked hour of work plays out in a few seconds.
export const DEMO_MS_PER_HOUR = 6000;
const MATCH_DELAY_MS = 5000;
const OFFER_WINDOW_MS = 15000;
const APPLICATION_SHORTLIST_MS = 8000;
const APPLICATION_DECISION_MS = 18000;

/** Converts an hourly rate into a job's pay unit (hour, day or month). */
export function rateInUnit(hourly: number, unit: keyof typeof HOURS_PER_UNIT) {
  const v = hourly * HOURS_PER_UNIT[unit];
  return unit === 'hour' ? v : Math.round(v / 1000) * 1000;
}

export function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

export function makePin() {
  return String(1000 + Math.floor(Math.random() * 9000));
}

export function createClientJob(
  input: Omit<ClientJob, 'id' | 'createdAt' | 'pin' | 'status' | 'travelMs'>,
): ClientJob {
  return {
    ...input,
    id: makeId(),
    createdAt: Date.now(),
    pin: makePin(),
    // Nothing is sent until the client picks a pro themselves.
    status: input.preferredProId ? 'searching' : 'choosing',
    travelMs: 20000,
  };
}

export function priceFor(serviceId: string, hours: number, hourlyRate?: number) {
  const subtotal = (hourlyRate ?? getService(serviceId).hourlyRate) * hours;
  const fee = Math.round(subtotal * SERVICE_FEE_RATE);
  return { subtotal, fee, total: subtotal + fee };
}

type Ctx = {
  state: State;
  dispatch: (action: Action) => void;
  activeClientJob?: ClientJob;
  activeProviderJob?: ProviderJob;
};

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => dispatch({ type: 'hydrate', state: raw ? JSON.parse(raw) : {} }))
      .catch(() => dispatch({ type: 'hydrate', state: {} }));
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    const { hydrated: _h, incoming: _i, ...persisted } = state;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persisted)).catch(() => {});
  }, [state]);

  const activeClientJob = state.clientJobs.find(
    (j) => j.status !== 'cancelled' && (j.status !== 'completed' || (j.rating === undefined && !j.reviewSkipped)),
  );
  const activeProviderJob = state.providerJobs.find(
    (j) => j.status !== 'completed' || j.clientRatingGiven === undefined,
  );

  useSimulation(state, dispatch, activeClientJob, activeProviderJob);

  const value = useMemo(
    () => ({ state, dispatch, activeClientJob, activeProviderJob }),
    [state, activeClientJob, activeProviderJob],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

/**
 * Plays the "other side" of the marketplace so a single device can demo both apps:
 * - Client mode: a nearby pro accepts, travels, arrives and finishes the job.
 * - Provider mode: while online, nearby clients send job offers with a countdown.
 */
function useSimulation(
  state: State,
  dispatch: (a: Action) => void,
  clientJob?: ClientJob,
  providerJob?: ProviderJob,
) {
  const now = useNow(1000);
  const nextOfferAt = useRef<number | null>(null);

  useEffect(() => {
    if (!state.hydrated) return;

    if (clientJob) {
      const j = clientJob;
      const chosen = getPro(j.preferredProId);
      // Only the pro the client chose can accept; nobody is assigned automatically.
      if (j.status === 'searching' && chosen && now - j.createdAt > MATCH_DELAY_MS) {
        dispatch({ type: 'updateClientJob', id: j.id, patch: { status: 'accepted', acceptedAt: now, pro: chosen } });
      } else if (j.status === 'accepted' && j.acceptedAt && now - j.acceptedAt > j.travelMs) {
        dispatch({ type: 'updateClientJob', id: j.id, patch: { status: 'arrived', arrivedAt: now } });
      } else if (
        j.status === 'in_progress' &&
        j.startedAt &&
        now - j.startedAt > j.hours * DEMO_MS_PER_HOUR
      ) {
        dispatch({ type: 'updateClientJob', id: j.id, patch: { status: 'completed', completedAt: now } });
      }
    }

    const approved = state.providerProfile?.status === 'approved';
    if (state.role === 'provider' && state.online && approved && !providerJob) {
      if (state.incoming) {
        if (now > state.incoming.expiresAt) {
          dispatch({ type: 'dismissOffer' });
          nextOfferAt.current = now + 4000;
        }
      } else if (nextOfferAt.current === null) {
        nextOfferAt.current = now + 4000 + Math.random() * 4000;
      } else if (now >= nextOfferAt.current) {
        nextOfferAt.current = null;
        dispatch({ type: 'offer', offer: makeOffer(state, now) });
      }
    } else {
      nextOfferAt.current = null;
    }
  }, [now, state, clientJob, providerJob, dispatch]);

  // Hirers respond to job applications: shortlist, then hire if the asking pay fits.
  useEffect(() => {
    for (const a of state.applications) {
      const job = getJob(a.jobId);
      if (!job) continue;
      if (a.status === 'applied' && now - a.appliedAt > APPLICATION_SHORTLIST_MS) {
        dispatch({ type: 'updateApplication', jobId: a.jobId, patch: { status: 'shortlisted', updatedAt: now } });
      } else if (a.status === 'shortlisted' && now - a.appliedAt > APPLICATION_DECISION_MS) {
        const fits = a.rate <= job.payMax;
        dispatch({
          type: 'updateApplication',
          jobId: a.jobId,
          patch: { status: fits ? 'hired' : 'not_selected', updatedAt: now },
        });
      }
    }
  }, [now, state.applications, dispatch]);

  // Auto-approve provider applications after a short "review" in the demo.
  useEffect(() => {
    const pp = state.providerProfile;
    if (pp?.status === 'review' && now - pp.submittedAt > 6000) {
      dispatch({ type: 'approveProvider' });
    }
  }, [now, state.providerProfile, dispatch]);
}

function makeOffer(state: State, now: number): Offer {
  const pp = state.providerProfile;
  const serviceIds = pp?.services.length ? pp.services : services.map((s) => s.id);
  const serviceId = serviceIds[Math.floor(Math.random() * serviceIds.length)];
  const service = getService(serviceId);
  const areas = pp?.areas.length ? pp.areas : [state.profile?.area ?? 'Lekki'];
  const client = demoClients[Math.floor(Math.random() * demoClients.length)];
  const hours = service.minHours + Math.floor(Math.random() * 3);
  const rate = pp?.hourlyRate ?? service.hourlyRate;
  const gross = rate * hours;
  const shuffled = [...service.tasks].sort(() => Math.random() - 0.5);
  return {
    id: makeId(),
    serviceId,
    clientName: client.name,
    clientRating: client.rating,
    area: areas[Math.floor(Math.random() * areas.length)],
    distanceKm: Math.round((0.8 + Math.random() * 4.5) * 10) / 10,
    hours,
    gross,
    pay: Math.round(gross * (1 - PLATFORM_COMMISSION)),
    tasks: shuffled.slice(0, 2 + Math.floor(Math.random() * 2)),
    pin: makePin(),
    createdAt: now,
    expiresAt: now + OFFER_WINDOW_MS,
  };
}

/** Share of decided offers that were accepted; a pending offer doesn't count yet. */
export function acceptanceRate(state: Pick<State, 'offersSeen' | 'offersAccepted' | 'incoming'>) {
  const decided = state.offersSeen - (state.incoming ? 1 : 0);
  return decided > 0 ? Math.round((state.offersAccepted / decided) * 100) : 100;
}

/** Where a client job should open: the pro picker while choosing, otherwise live tracking. */
export function clientJobHref(job: Pick<ClientJob, 'id' | 'status'>) {
  return job.status === 'choosing' ? (`/choose/${job.id}` as const) : (`/trip/${job.id}` as const);
}

/** The client's own choice of pro for a job, stamped with the time it was sent. */
export function chooseProAction(jobId: string, pro: DemoPro): Action {
  return { type: 'choosePro', jobId, pro, now: Date.now() };
}

export function rateJobAction(
  job: Pick<ClientJob, 'id'> & { pro?: DemoPro },
  input: { rating: number; tags: string[]; comment: string; tip: number },
): Action {
  return {
    type: 'rateJob',
    jobId: job.id,
    tip: input.tip,
    review: {
      id: makeId(),
      proId: job.pro?.id ?? '',
      jobId: job.id,
      rating: input.rating,
      tags: input.tags,
      comment: input.comment,
      at: Date.now(),
    },
  };
}
