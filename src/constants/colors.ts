export type ColorScheme = 'light' | 'dark';

export type ThemeColors = Record<ColorToken, string>;

export const COLORS: Record<ColorScheme, ThemeColors> = {
  light: {
    bg: '#f7f3e7',
    surface: '#fffdf6',
    surfaceMuted: '#f1ecdc',
    surfaceDashed: '#faf6ea',
    segmentedBg: '#efe8d6',
    segmentActive: '#fffdf6',
    track: '#efe8d6',
    indexBg: '#f0ead6',
    handleBg: '#fffdf6',

    border: '#e2dac0',
    borderDashed: '#ded5b8',
    divider: '#e2dac0',
    progressEmpty: '#ded5b8',

    ink: '#1c1a12',
    body: '#403b27',
    bodyMuted: '#5c5741',
    muted: '#6b6548',
    mutedAlt: '#6b6548',
    label: '#6f6a4b',
    faint: '#6e6850',
    icon: '#7c7659',
    outlineText: '#5c5741',

    accent: '#2b2a1c',
    accentOn: '#f7f3e7',
    accentLine: '#2b2a1c',
    accentRing: 'rgba(43,42,28,0.1)',
    selectedText: '#fff8ef',
    selectedIndexBg: 'rgba(255,248,239,0.25)',

    destructive: '#a33b2a',
    destructiveBorder: '#e6c9bc',
    destructiveOn: '#fff8ef',
    destructiveBadgeText: '#a33b2a',

    tabBg: '#f2ecdc',
    tabBorder: '#e3dabf',
    tabActive: '#e3dcc2',
    tabActiveText: '#3f3a24',
    tabIdle: '#6a6547',
    bannerBg: '#eee7d5',

    overlay: 'rgba(28,26,18,0.5)',
    modalBorder: 'transparent',
    cardShadow: 'rgba(28,26,18,0.06)',
    selectedShadow: 'rgba(43,42,28,0.22)',
    handleShadow: 'rgba(28,26,18,0.18)',
    segmentShadow: 'rgba(28,26,18,0.1)',
    modalShadow: 'rgba(28,26,18,0.35)',
  },
  dark: {
    bg: '#15130b',
    surface: '#1e1b11',
    surfaceMuted: '#1b1810',
    surfaceDashed: '#1a1710',
    segmentedBg: '#1b1810',
    segmentActive: '#3a3620',
    track: '#2a2617',
    indexBg: '#2a2617',
    handleBg: '#15130b',

    border: '#302c1b',
    borderDashed: '#3a3620',
    divider: '#332f1d',
    progressEmpty: '#332f1d',

    ink: '#f2e8ca',
    body: '#ded3b0',
    bodyMuted: '#c4b993',
    muted: '#8e8763',
    mutedAlt: '#a49c78',
    label: '#8e8763',
    faint: '#7a745f',
    icon: '#cfc5a2',
    outlineText: '#cfc5a2',

    accent: '#f2e8ca',
    accentOn: '#1c1a12',
    accentLine: '#cfc5a2',
    accentRing: 'rgba(207,197,162,0.14)',
    selectedText: '#1c1a12',
    selectedIndexBg: 'rgba(28,26,18,0.16)',

    destructive: '#d17a52',
    destructiveBorder: '#4a2d1f',
    destructiveOn: '#15130b',
    destructiveBadgeText: '#e6a184',

    tabBg: '#15130b',
    tabBorder: '#322e1c',
    tabActive: '#3a3620',
    tabActiveText: '#f2e8ca',
    tabIdle: '#9d9678',
    bannerBg: '#100f09',

    overlay: 'rgba(8,7,4,0.66)',
    modalBorder: '#332f1d',
    cardShadow: 'transparent',
    selectedShadow: 'transparent',
    handleShadow: 'transparent',
    segmentShadow: 'transparent',
    modalShadow: 'rgba(0,0,0,0.6)',
  },
};

type ColorToken =
  | 'bg'
  | 'surface'
  | 'surfaceMuted'
  | 'surfaceDashed'
  | 'segmentedBg'
  | 'segmentActive'
  | 'track'
  | 'indexBg'
  | 'handleBg'
  | 'border'
  | 'borderDashed'
  | 'divider'
  | 'progressEmpty'
  | 'ink'
  | 'body'
  | 'bodyMuted'
  | 'muted'
  | 'mutedAlt'
  | 'label'
  | 'faint'
  | 'icon'
  | 'outlineText'
  | 'accent'
  | 'accentOn'
  | 'accentLine'
  | 'accentRing'
  | 'selectedText'
  | 'selectedIndexBg'
  | 'destructive'
  | 'destructiveBorder'
  | 'destructiveOn'
  | 'destructiveBadgeText'
  | 'tabBg'
  | 'tabBorder'
  | 'tabActive'
  | 'tabActiveText'
  | 'tabIdle'
  | 'bannerBg'
  | 'overlay'
  | 'modalBorder'
  | 'cardShadow'
  | 'selectedShadow'
  | 'handleShadow'
  | 'segmentShadow'
  | 'modalShadow';
