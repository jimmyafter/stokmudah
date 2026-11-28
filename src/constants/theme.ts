export const Colors = {
  light: {
    bg: '#EEF3F0',
    surface: '#FFFFFF',
    surfaceAlt: '#E7EEEA',
    border: '#E1EAE5',
    track: '#E7EEEA',
    text: '#17302A',
    textSoft: '#3A4C45',
    textMuted: '#55645D',
    primary: '#2E7D6B',
    primaryDark: '#1F6B5A',
    primarySoft: '#E3F2EA',
    deep: '#1F5C4B',
    onDeep: '#FFFFFF',
    onPrimary: '#FFFFFF',
    green: '#2E7D6B',
    greenSoft: '#DDF1E6',
    greenText: '#14573F',
    amber: '#E0A32E',
    amberSoft: '#FFF1D6',
    amberText: '#7A4B00',
    red: '#D9542B',
    redSoft: '#FDE4DC',
    redText: '#8F2A10',
    blue: '#4A7BA8',
    blueSoft: '#E6F0F7',
    blueText: '#1D4F73',
    rose: '#B35A7A',
    whatsapp: '#25D366',
    onWhatsapp: '#0B2A1A',
  },
  dark: {
    bg: '#121A16',
    surface: '#1C2723',
    surfaceAlt: '#24322C',
    border: '#2E3D36',
    track: '#2A3832',
    text: '#EAF1ED',
    textSoft: '#C5D3CB',
    textMuted: '#9DB0A7',
    primary: '#4FB59B',
    primaryDark: '#7FD6BE',
    primarySoft: '#1E3A32',
    deep: '#1E3A32',
    onDeep: '#EAF1ED',
    onPrimary: '#0B1A14',
    green: '#4FB59B',
    greenSoft: '#1F3B30',
    greenText: '#8FE0B5',
    amber: '#E7B04A',
    amberSoft: '#3A2F14',
    amberText: '#F0C878',
    red: '#EE7B58',
    redSoft: '#40231B',
    redText: '#F5A58B',
    blue: '#7BA7D1',
    blueSoft: '#1D2F3F',
    blueText: '#A9CCEA',
    rose: '#D77FA0',
    whatsapp: '#25D366',
    onWhatsapp: '#0B2A1A',
  },
} as const;

export type ColorName = keyof typeof Colors.light;

export const Spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 } as const;

export const Radius = { sm: 14, md: 20, lg: 24, xl: 32, pill: 999 } as const;

/** Soft, wide shadow used on cards so they float on the pale background. */
export const Shadow = {
  card: {
    shadowColor: '#1E4637',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  bar: {
    shadowColor: '#1E4637',
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
} as const;

export type FontWeight = 400 | 500 | 600 | 700 | 800;

const FAMILIES: Record<FontWeight, string> = {
  400: 'PlusJakartaSans_400Regular',
  500: 'PlusJakartaSans_500Medium',
  600: 'PlusJakartaSans_600SemiBold',
  700: 'PlusJakartaSans_700Bold',
  800: 'PlusJakartaSans_800ExtraBold',
};

export function fontFor(weight: FontWeight): string {
  return FAMILIES[weight];
}

/** Minimum tap target, in points. */
export const TapTarget = 44;
