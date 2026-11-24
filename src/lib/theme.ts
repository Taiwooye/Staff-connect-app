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

export const clientPalette: Palette = {
  bg: '#F6F7F5',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF2EE',
  border: '#E2E7E2',
  text: '#0E1A14',
  textMuted: '#5E6B64',
  accent: '#0F9D6B',
  accentText: '#FFFFFF',
  accentSoft: '#DDF5EA',
  success: '#0F9D6B',
  danger: '#D6453D',
  warning: '#E79A1B',
  map: {
    land: '#EDEFEA',
    block: '#E3E6DF',
    road: '#FFFFFF',
    roadMajor: '#FBE7B7',
    water: '#BFE0F0',
    park: '#CFEACB',
    route: '#0F9D6B',
  },
};

export const providerPalette: Palette = {
  bg: '#0B0F0E',
  surface: '#151B19',
  surfaceAlt: '#1E2623',
  border: '#28322E',
  text: '#F3F6F4',
  textMuted: '#93A19A',
  accent: '#F5B32F',
  accentText: '#141007',
  accentSoft: '#3A2E12',
  success: '#34D399',
  danger: '#F87171',
  warning: '#F5B32F',
  map: {
    land: '#141A18',
    block: '#1A2220',
    road: '#2A3431',
    roadMajor: '#3B4743',
    water: '#0F2633',
    park: '#14281D',
    route: '#F5B32F',
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
