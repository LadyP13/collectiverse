export const fonts = {
  pixel: 'PressStart2P',
  body: 'VT323',
};

export const palette = {
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
};

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
