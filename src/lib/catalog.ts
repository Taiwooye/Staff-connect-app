import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export type Service = {
  id: string;
  label: string;
  short: string;
  icon: IconName;
  tint: string;
  description: string;
  hourlyRate: number;
  minHours: number;
  tasks: string[];
};

// Same service lineup as the StaffConnect website, with demo hourly rates.
export const services: Service[] = [
  {
    id: 'cleaning',
    label: 'Home cleaning',
    short: 'Cleaning',
    icon: 'sparkles-outline',
    tint: '#DDF5EA',
    description: 'A fresh, comfortable home',
    hourlyRate: 2500,
    minHours: 2,
    tasks: ['Sweep & mop', 'Kitchen', 'Bathrooms', 'Laundry', 'Ironing'],
  },
  {
    id: 'childcare',
    label: 'Nanny & childcare',
    short: 'Nanny',
    icon: 'happy-outline',
    tint: '#FDE9D7',
    description: 'Thoughtful care for little ones',
    hourlyRate: 3000,
    minHours: 3,
    tasks: ['School pickup', 'Meals', 'Homework help', 'Bedtime'],
  },
  {
    id: 'cooking',
    label: 'Cooks & chefs',
    short: 'Cook',
    icon: 'restaurant-outline',
    tint: '#FCE3E1',
    description: 'Everyday meals, made easier',
    hourlyRate: 3500,
    minHours: 2,
    tasks: ['Weekly meal prep', 'Party cooking', 'Grocery run', 'Baking'],
  },
  {
    id: 'drivers',
    label: 'Drivers',
    short: 'Driver',
    icon: 'car-outline',
    tint: '#DCEBFB',
    description: 'Reliable help on the road',
    hourlyRate: 3000,
    minHours: 2,
    tasks: ['School run', 'Errands', 'Airport', 'Vehicle care'],
  },
  {
    id: 'gardeners',
    label: 'Gardeners',
    short: 'Garden',
    icon: 'leaf-outline',
    tint: '#E3F2D5',
    description: 'Care for your outdoor spaces',
    hourlyRate: 2500,
    minHours: 2,
    tasks: ['Lawn care', 'Plant care', 'Hedges', 'Clean-up'],
  },
  {
    id: 'elderly-care',
    label: 'Elderly care',
    short: 'Elderly',
    icon: 'heart-outline',
    tint: '#F2E2F7',
    description: 'Dependable day-to-day support',
    hourlyRate: 3500,
    minHours: 4,
    tasks: ['Companionship', 'Mobility help', 'Meal support', 'Medication reminders'],
  },
  {
    id: 'pet-care',
    label: 'Pet care',
    short: 'Pets',
    icon: 'paw-outline',
    tint: '#FBF0CF',
    description: 'Kind care for furry family',
    hourlyRate: 2000,
    minHours: 1,
    tasks: ['Dog walking', 'Feeding', 'Pet sitting', 'Grooming'],
  },
  {
    id: 'home-maintenance',
    label: 'Home maintenance',
    short: 'Repairs',
    icon: 'construct-outline',
    tint: '#E6E8EC',
    description: 'A hand with the little fixes',
    hourlyRate: 4000,
    minHours: 1,
    tasks: ['Plumbing', 'Electrical', 'Painting', 'Furniture'],
  },
];

export function getService(id: string | undefined) {
  return services.find((s) => s.id === id) ?? services[0];
}

export const launchLocations = {
  Lagos: ['Ajah', 'Ikeja', 'Lekki', 'Surulere', 'Yaba'],
  Oyo: ['Ibadan', 'Ogbomoso', 'Oyo', 'Iseyin', 'Saki'],
} as const;

export type LaunchState = keyof typeof launchLocations;
export const launchStates = Object.keys(launchLocations) as LaunchState[];

export type Arrangement = 'Live-in' | 'Daily' | 'Weekends' | 'Flexible';

export type DemoPro = {
  id: string;
  name: string;
  initials: string;
  color: string;
  rating: number;
  jobs: number;
  years: number;
  services: string[];
  languages: string[];
  state: LaunchState;
  area: string;
  arrangement: Arrangement;
  hourlyRate: number;
  about: string;
};

// Fictional demo profiles (no real people, ratings are illustrative).
export const demoPros: DemoPro[] = [
  { id: 'p1', name: 'Amara Okafor', initials: 'AO', color: '#0F9D6B', rating: 4.9, jobs: 212, years: 4, services: ['cleaning', 'cooking'], languages: ['English', 'Igbo'], state: 'Lagos', area: 'Lekki', arrangement: 'Live-in', hourlyRate: 2800, about: 'Keeps busy family homes spotless and cooks simple, tasty Nigerian meals.' },
  { id: 'p2', name: 'Chioma Eze', initials: 'CE', color: '#E07A2E', rating: 4.8, jobs: 148, years: 3, services: ['cleaning', 'childcare'], languages: ['English', 'Igbo'], state: 'Lagos', area: 'Ikeja', arrangement: 'Daily', hourlyRate: 3000, about: 'Comfortable with a daily commute and helping families keep a tidy, child-friendly home.' },
  { id: 'p3', name: 'Aisha Bello', initials: 'AB', color: '#7C5CDB', rating: 4.7, jobs: 96, years: 2, services: ['cooking', 'cleaning'], languages: ['English', 'Hausa'], state: 'Lagos', area: 'Yaba', arrangement: 'Weekends', hourlyRate: 3200, about: 'Weekend cleaning and meal prep with a focus on consistent routines.' },
  { id: 'p4', name: 'Tunde Adeyemi', initials: 'TA', color: '#2C7BE5', rating: 4.9, jobs: 301, years: 6, services: ['drivers', 'home-maintenance'], languages: ['English', 'Yoruba'], state: 'Lagos', area: 'Surulere', arrangement: 'Daily', hourlyRate: 3500, about: 'Careful driver who knows Lagos routes well; handy with small repairs too.' },
  { id: 'p5', name: 'Bisi Oladipo', initials: 'BO', color: '#C2417A', rating: 4.8, jobs: 174, years: 5, services: ['elderly-care', 'childcare'], languages: ['English', 'Yoruba'], state: 'Oyo', area: 'Ibadan', arrangement: 'Live-in', hourlyRate: 3200, about: 'Patient, warm carer for elderly parents and young children.' },
  { id: 'p6', name: 'Emeka Nwosu', initials: 'EN', color: '#3E8E41', rating: 4.6, jobs: 88, years: 3, services: ['gardeners', 'pet-care'], languages: ['English', 'Igbo'], state: 'Lagos', area: 'Ajah', arrangement: 'Flexible', hourlyRate: 2400, about: 'Loves outdoor work — lawns, hedges and walking dogs of every size.' },
  { id: 'p7', name: 'Kemi Afolabi', initials: 'KA', color: '#D35400', rating: 4.8, jobs: 133, years: 4, services: ['cleaning', 'cooking'], languages: ['English', 'Yoruba'], state: 'Oyo', area: 'Ibadan', arrangement: 'Daily', hourlyRate: 2300, about: 'Reliable daily housekeeper who enjoys cooking amala and ewedu.' },
  { id: 'p8', name: 'Grace Udo', initials: 'GU', color: '#8E44AD', rating: 4.9, jobs: 187, years: 7, services: ['childcare'], languages: ['English', 'Efik'], state: 'Lagos', area: 'Lekki', arrangement: 'Live-in', hourlyRate: 3300, about: 'Experienced live-in nanny; homework help, bedtime routines and school runs.' },
  { id: 'p9', name: 'Musa Abdullahi', initials: 'MA', color: '#16A085', rating: 4.7, jobs: 120, years: 5, services: ['drivers'], languages: ['English', 'Hausa'], state: 'Oyo', area: 'Ogbomoso', arrangement: 'Daily', hourlyRate: 2800, about: 'Calm, punctual driver for school runs and errands.' },
  { id: 'p10', name: 'Funmi Ajayi', initials: 'FA', color: '#C0392B', rating: 4.8, jobs: 98, years: 6, services: ['elderly-care'], languages: ['English', 'Yoruba'], state: 'Lagos', area: 'Ikeja', arrangement: 'Daily', hourlyRate: 3600, about: 'Trained in mobility support and medication reminders for older adults.' },
  { id: 'p11', name: 'Segun Bakare', initials: 'SB', color: '#2E86C1', rating: 4.6, jobs: 76, years: 8, services: ['home-maintenance', 'gardeners'], languages: ['English', 'Yoruba'], state: 'Oyo', area: 'Oyo', arrangement: 'Flexible', hourlyRate: 3800, about: 'Plumbing, electrical fixes and painting — no job too small.' },
  { id: 'p12', name: 'Ifeoma Obi', initials: 'IO', color: '#AF7AC5', rating: 4.7, jobs: 64, years: 2, services: ['pet-care', 'cleaning'], languages: ['English', 'Igbo'], state: 'Lagos', area: 'Yaba', arrangement: 'Weekends', hourlyRate: 2000, about: 'Pet sitter and weekend cleaner; great with nervous dogs.' },
  { id: 'p13', name: 'Halima Sani', initials: 'HS', color: '#1ABC9C', rating: 4.8, jobs: 110, years: 4, services: ['childcare', 'cleaning'], languages: ['English', 'Hausa', 'Yoruba'], state: 'Oyo', area: 'Iseyin', arrangement: 'Live-in', hourlyRate: 2600, about: 'Gentle live-in nanny who keeps the home neat as well.' },
  { id: 'p14', name: 'Dayo Ogunleye', initials: 'DO', color: '#E67E22', rating: 4.9, jobs: 205, years: 9, services: ['cooking'], languages: ['English', 'Yoruba'], state: 'Lagos', area: 'Ajah', arrangement: 'Flexible', hourlyRate: 3800, about: 'Private chef for weekly meal prep and small parties.' },
];

export function getPro(id: string | undefined) {
  return demoPros.find((p) => p.id === id);
}

export const scheduleOptions = ['Weekday mornings', 'Weekday afternoons', 'Evenings', 'Weekends', 'Live-in'] as const;

export type JobOpening = {
  id: string;
  title: string;
  hirer: string;
  hirerType: 'Household' | 'Education' | 'Events' | 'Business';
  serviceId: string;
  state: LaunchState;
  area: string;
  schedule: string[];
  payMin: number;
  payMax: number;
  payUnit: 'hour' | 'day' | 'month';
  workers: number;
  postedDaysAgo: number;
  description: string;
  requirements: string[];
};

// Fictional job openings posted by hirers (longer-term work, not instant jobs).
export const jobOpenings: JobOpening[] = [
  { id: 'j1', title: 'Live-in housekeeper for family of 4', hirer: 'Folake A.', hirerType: 'Household', serviceId: 'cleaning', state: 'Lagos', area: 'Lekki', schedule: ['Live-in'], payMin: 120000, payMax: 150000, payUnit: 'month', workers: 1, postedDaysAgo: 1, description: 'Busy family home with two school-age children. Daily cleaning, laundry and light cooking. Private room provided.', requirements: ['2+ years experience', 'References', 'Comfortable with children'] },
  { id: 'j2', title: 'After-school nanny', hirer: 'David O.', hirerType: 'Household', serviceId: 'childcare', state: 'Lagos', area: 'Ikeja', schedule: ['Weekday afternoons'], payMin: 2500, payMax: 3200, payUnit: 'hour', workers: 1, postedDaysAgo: 2, description: 'Pick up two children (6 and 9) from school, help with homework and prepare an early dinner.', requirements: ['Childcare experience', 'Lives near Ikeja'] },
  { id: 'j3', title: 'School cafeteria cook', hirer: 'Bright Future Academy', hirerType: 'Education', serviceId: 'cooking', state: 'Lagos', area: 'Yaba', schedule: ['Weekday mornings'], payMin: 90000, payMax: 120000, payUnit: 'month', workers: 2, postedDaysAgo: 3, description: 'Prepare breakfast and lunch for about 150 pupils. Work alongside our head cook.', requirements: ['Food hygiene knowledge', 'Large-batch cooking'] },
  { id: 'j4', title: 'Weekend event cleaners', hirer: 'Eko Events Co.', hirerType: 'Events', serviceId: 'cleaning', state: 'Lagos', area: 'Lekki', schedule: ['Weekends'], payMin: 15000, payMax: 20000, payUnit: 'day', workers: 6, postedDaysAgo: 1, description: 'Clean-up crew for weddings and parties at a Lekki venue. Saturday and Sunday shifts.', requirements: ['Team player', 'Available most weekends'] },
  { id: 'j5', title: 'Family driver', hirer: 'Ngozi K.', hirerType: 'Household', serviceId: 'drivers', state: 'Lagos', area: 'Surulere', schedule: ['Weekday mornings', 'Weekday afternoons'], payMin: 150000, payMax: 180000, payUnit: 'month', workers: 1, postedDaysAgo: 4, description: 'School runs, office drop-offs and errands. Car provided and maintained by the family.', requirements: ['Valid driver’s licence', '3+ years driving in Lagos'] },
  { id: 'j6', title: 'Evening office cleaner', hirer: 'Cocoa House Partners', hirerType: 'Business', serviceId: 'cleaning', state: 'Oyo', area: 'Ibadan', schedule: ['Evenings'], payMin: 60000, payMax: 80000, payUnit: 'month', workers: 2, postedDaysAgo: 2, description: 'Clean a small office after hours, Monday to Friday. Supplies provided.', requirements: ['Reliable', 'Lives near Ibadan'] },
  { id: 'j7', title: 'Companion for elderly mother', hirer: 'Yetunde M.', hirerType: 'Household', serviceId: 'elderly-care', state: 'Oyo', area: 'Ibadan', schedule: ['Weekday mornings'], payMin: 3000, payMax: 3800, payUnit: 'hour', workers: 1, postedDaysAgo: 1, description: 'Morning companionship, light meals and medication reminders for a lively 78-year-old.', requirements: ['Elderly care experience', 'Patient and kind'] },
  { id: 'j8', title: 'Estate garden upkeep', hirer: 'Palm Grove Estate', hirerType: 'Business', serviceId: 'gardeners', state: 'Lagos', area: 'Ajah', schedule: ['Weekends'], payMin: 2200, payMax: 2800, payUnit: 'hour', workers: 2, postedDaysAgo: 5, description: 'Maintain lawns and hedges across shared estate gardens every Saturday.', requirements: ['Own basic tools is a plus'] },
  { id: 'j9', title: 'Morning dog walker', hirer: 'Ibrahim S.', hirerType: 'Household', serviceId: 'pet-care', state: 'Lagos', area: 'Lekki', schedule: ['Weekday mornings'], payMin: 1800, payMax: 2400, payUnit: 'hour', workers: 1, postedDaysAgo: 2, description: 'Walk two friendly labradors for an hour each weekday morning.', requirements: ['Comfortable with large dogs'] },
  { id: 'j10', title: 'Handyman for short-let apartments', hirer: 'StayEasy Homes', hirerType: 'Business', serviceId: 'home-maintenance', state: 'Lagos', area: 'Yaba', schedule: ['Weekday afternoons'], payMin: 25000, payMax: 35000, payUnit: 'day', workers: 1, postedDaysAgo: 3, description: 'Fix taps, sockets and fittings across 8 apartments. Call-outs a few afternoons a week.', requirements: ['Plumbing or electrical skills'] },
  { id: 'j11', title: 'Live-in nanny', hirer: 'Adaeze N.', hirerType: 'Household', serviceId: 'childcare', state: 'Oyo', area: 'Ogbomoso', schedule: ['Live-in'], payMin: 80000, payMax: 110000, payUnit: 'month', workers: 1, postedDaysAgo: 6, description: 'Care for a toddler and a newborn alongside a stay-at-home parent.', requirements: ['Infant care experience', 'References'] },
  { id: 'j12', title: 'Weekly meal-prep chef', hirer: 'Tolu B.', hirerType: 'Household', serviceId: 'cooking', state: 'Lagos', area: 'Ikeja', schedule: ['Weekends'], payMin: 3500, payMax: 4500, payUnit: 'hour', workers: 1, postedDaysAgo: 1, description: 'Cook and portion a week of healthy meals every Sunday for a couple.', requirements: ['Nigerian and continental dishes'] },
  { id: 'j13', title: 'School bus driver', hirer: 'Oyo Grammar School', hirerType: 'Education', serviceId: 'drivers', state: 'Oyo', area: 'Oyo', schedule: ['Weekday mornings', 'Weekday afternoons'], payMin: 100000, payMax: 130000, payUnit: 'month', workers: 1, postedDaysAgo: 4, description: 'Morning and afternoon school routes in a 14-seater bus.', requirements: ['Commercial driving experience'] },
  { id: 'j14', title: 'Wedding kitchen team', hirer: 'Ayo & Bimpe’s wedding', hirerType: 'Events', serviceId: 'cooking', state: 'Oyo', area: 'Ibadan', schedule: ['Weekends'], payMin: 18000, payMax: 25000, payUnit: 'day', workers: 4, postedDaysAgo: 2, description: 'Help prepare jollof, small chops and stews for 300 guests on a Saturday.', requirements: ['Large-batch cooking'] },
];

export function getJob(id: string | undefined) {
  return jobOpenings.find((j) => j.id === id);
}

// Rough hours behind each pay unit, used to compare against hourly rates.
export const HOURS_PER_UNIT = { hour: 1, day: 8, month: 160 } as const;

const reviewPool = [
  { author: 'Folake A.', rating: 5, text: 'Arrived on time and left the place spotless. Would book again.' },
  { author: 'David O.', rating: 5, text: 'Very respectful and great with the kids.' },
  { author: 'Ngozi K.', rating: 4, text: 'Good work overall, just a little late the first day.' },
  { author: 'Tolu B.', rating: 5, text: 'Friendly, careful and communicated clearly the whole time.' },
  { author: 'Yetunde M.', rating: 5, text: 'Exactly what we needed. Thorough and kind.' },
  { author: 'Ibrahim S.', rating: 4, text: 'Did a solid job and followed every instruction.' },
];

export type ShownReview = { author: string; rating: number; text: string; tags?: string[]; mine?: boolean };

/** Three fictional sample reviews per demo pro (deterministic, so they don't reshuffle). */
export function sampleReviews(pro: DemoPro): ShownReview[] {
  const start = Number(pro.id.replace(/\D/g, '')) % reviewPool.length;
  return [0, 1, 2].map((i) => reviewPool[(start + i) % reviewPool.length]);
}

/** Combines a pro's existing rating with the reviews this user has left. */
export function ratingWith(pro: DemoPro, mine: { rating: number }[]) {
  const count = pro.jobs + mine.length;
  const sum = pro.rating * pro.jobs + mine.reduce((t, r) => t + r.rating, 0);
  return { average: Math.round((sum / count) * 10) / 10, count };
}

export const demoClients = [
  { name: 'Folake A.', rating: 4.9 },
  { name: 'David O.', rating: 4.7 },
  { name: 'Ngozi K.', rating: 5.0 },
  { name: 'Ibrahim S.', rating: 4.8 },
  { name: 'Yetunde M.', rating: 4.9 },
];

export const SERVICE_FEE_RATE = 0.1; // charged to clients
export const PLATFORM_COMMISSION = 0.15; // deducted from provider pay
