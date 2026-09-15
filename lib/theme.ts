export const fonts = {
  pixel: 'PressStart2P',
  body: 'VT323',
};

export const THEME_ORDER = ['blossom', 'cosmos'] as const;
export type ThemeId = (typeof THEME_ORDER)[number];

export type Palette = {
  bg: string;
  card: string;
  border: string;
  borderStrong: string;
  accent: string;
  gold: string;
  lavender: string;
  muted: string;
  body: string;
  white: string;
  metamask: string;
  walletconnect: string;
  chassis: string;
  lcd: string;
  lcdSky: string;
  menu: string;
  menuInk: string;
  menuMuted: string;
  menuBorder: string;
  menuBorderDark: string;
  cursor: string;
  selectBar: string;
  chipFill: string;
};

export const palettes: Record<ThemeId, Palette> = {
  blossom: {
    bg: '#12091f',
    card: '#1b0d2b',
    border: '#3b2454',
    borderStrong: '#6d3b8f',
    accent: '#ff8ec4',
    gold: '#ffd166',
    lavender: '#d9b8ff',
    muted: '#9d7bc4',
    body: '#bda7d1',
    white: '#ffffff',
    metamask: '#f6851b',
    walletconnect: '#3b99fc',
    chassis: '#c48bc8',
    lcd: '#0c0624',
    lcdSky: '#1a0a48',
    menu: '#fff4fb',
    menuInk: '#4a2068',
    menuMuted: '#8b5aa0',
    menuBorder: '#ff8ec4',
    menuBorderDark: '#c44e8a',
    cursor: '#ffd56a',
    selectBar: '#ff8ec4',
    chipFill: '#2a1238',
  },
  cosmos: {
    bg: '#050b1a',
    card: '#0a1630',
    border: '#1c3a6e',
    borderStrong: '#3d6bff',
    accent: '#3ee8ff',
    gold: '#ffd166',
    lavender: '#b8c8ff',
    muted: '#6d8ec4',
    body: '#a7c0d1',
    white: '#ffffff',
    metamask: '#f6851b',
    walletconnect: '#3b99fc',
    chassis: '#304489',
    lcd: '#040519',
    lcdSky: '#0a1a48',
    menu: '#e8f4ff',
    menuInk: '#14285c',
    menuMuted: '#5a7aa0',
    menuBorder: '#3ee8ff',
    menuBorderDark: '#2a62d4',
    cursor: '#ffd56a',
    selectBar: '#6b5cff',
    chipFill: '#102448',
  },
};

export const THEME_LABELS: Record<ThemeId, string> = {
  blossom: 'BLOSSOM',
  cosmos: 'COSMOS',
};

export const themeAssets = {
  blossom: {
    chassis: require('../assets/images/gameboy-chassis.png'),
    boot: require('../assets/images/lcd-boot.png'),
  },
  cosmos: {
    chassis: require('../assets/images/gameboy-chassis-cosmos.png'),
    boot: require('../assets/images/lcd-boot-cosmos.png'),
  },
} as const;

export function isThemeId(value: unknown): value is ThemeId {
  return value === 'blossom' || value === 'cosmos';
}

export function nextTheme(id: ThemeId): ThemeId {
  const index = THEME_ORDER.indexOf(id);
  return THEME_ORDER[(index + 1) % THEME_ORDER.length];
}

export const DECK_ICONS = ['🃏', '💎', '🪙', '🎮', '🧸', '🎸', '📚', '🧿'] as const;

export const CONDITIONS = [
  'Mint',
  'Near Mint',
  'Excellent',
  'Good',
  'Played',
  'Unknown',
] as const;

export type Condition = (typeof CONDITIONS)[number];
