// Two distinct visual identities, the way Uber/Bolt separate rider and driver apps:
// Clients get a bright, calm interface; Providers get a dark, high-contrast
// "work mode" interface that is easy to read at a glance while on the move.

export type Palette = {
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  accent: string;
  accentText: string;
  accentSoft: string;
  success: string;
  danger: string;
  warning: string;
  map: {
    land: string;
    block: string;
    road: string;
    roadMajor: string;
    water: string;
    park: string;
    route: string;
  };
};

// Brand colours, taken straight from the StaffConnect web app (Tailwind classes
// in parentheses) so the web and mobile apps look like one product.
export const brand = {
  navy: '#142236', // primary buttons, dark cards
  navyHover: '#20334C',
  navyDeep: '#0D1725',
  ink: '#172638', // headings
  cream: '#FBF8F2', // page background
  mist: '#F7F8F6', // inset panels
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate500: '#64748B',
  slate600: '#475569',
  amber50: '#FFFBEB',
  amber100: '#FEF3C7',
  amber200: '#FDE68A',
  amber300: '#FCD34D',
  amber400: '#FBBF24',
  amber600: '#D97706',
  amber700: '#B45309',
  amber800: '#92400E',
  amber950: '#451A03',
  orange100: '#FFEDD5',
  emerald100: '#D1FAE5',
  emerald500: '#10B981',
  emerald700: '#047857',
  rose600: '#E11D48',
};

export const clientPalette: Palette = {
  bg: brand.cream,
  surface: '#FFFFFF',
  surfaceAlt: brand.mist,
  border: brand.slate200,
  text: brand.ink,
  textMuted: brand.slate600,
  accent: brand.navy,
  accentText: '#FFFFFF',
  accentSoft: brand.amber100,
  success: brand.emerald700,
  danger: brand.rose600,
  warning: brand.amber600,
  map: {
    land: '#F1EDE4',
    block: '#E8E3D8',
    road: '#FFFFFF',
    roadMajor: brand.amber200,
    water: '#BFDBFE',
    park: brand.emerald100,
    route: brand.navy,
  },
};

export const providerPalette: Palette = {
  bg: '#0D1725',
  surface: '#142236',
  surfaceAlt: '#172638',
  border: '#20334C',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  accent: '#FBBF24',
  accentText: '#142236',
  accentSoft: '#3A3017',
  success: '#34D399',
  danger: '#FB7185',
  warning: '#FBBF24',
  map: {
    land: '#111D2E',
    block: '#15233A',
    road: '#20334C',
    roadMajor: '#2C4263',
    water: '#0B2A40',
    park: '#13302A',
    route: '#FBBF24',
  },
};

export const radius = { sm: 10, md: 16, lg: 24, xl: 32, pill: 999 };
export const space = (n: number) => n * 4;

export function formatNaira(amount: number) {
  return `₦${Math.round(amount).toLocaleString('en-NG')}`;
}

export function initialsOf(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((s) => s[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?'
  );
}
