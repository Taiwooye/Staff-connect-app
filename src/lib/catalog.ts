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
};

// Fictional demo profiles (no real people, ratings are illustrative).
export const demoPros: DemoPro[] = [
  { id: 'p1', name: 'Amara Okafor', initials: 'AO', color: '#0F9D6B', rating: 4.9, jobs: 212, years: 4, services: ['cleaning', 'cooking'], languages: ['English', 'Igbo'] },
  { id: 'p2', name: 'Chioma Eze', initials: 'CE', color: '#E07A2E', rating: 4.8, jobs: 148, years: 3, services: ['cleaning', 'childcare'], languages: ['English', 'Igbo'] },
  { id: 'p3', name: 'Aisha Bello', initials: 'AB', color: '#7C5CDB', rating: 4.7, jobs: 96, years: 2, services: ['cooking', 'cleaning'], languages: ['English', 'Hausa'] },
  { id: 'p4', name: 'Tunde Adeyemi', initials: 'TA', color: '#2C7BE5', rating: 4.9, jobs: 301, years: 6, services: ['drivers', 'home-maintenance'], languages: ['English', 'Yoruba'] },
  { id: 'p5', name: 'Bisi Oladipo', initials: 'BO', color: '#C2417A', rating: 4.8, jobs: 174, years: 5, services: ['elderly-care', 'childcare'], languages: ['English', 'Yoruba'] },
  { id: 'p6', name: 'Emeka Nwosu', initials: 'EN', color: '#3E8E41', rating: 4.6, jobs: 88, years: 3, services: ['gardeners', 'pet-care'], languages: ['English', 'Igbo'] },
];

export function proForService(serviceId: string) {
  const matches = demoPros.filter((p) => p.services.includes(serviceId));
  const pool = matches.length ? matches : demoPros;
  return pool[Math.floor(Math.random() * pool.length)];
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
