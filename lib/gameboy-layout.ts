export const GAMEBOY_SIZE = { width: 941, height: 1672 } as const;

/** Inner LCD, matching the blank region in gameboy-chassis.png */
export const LCD_RECT = {
  x: 88 / 941,
  y: 110 / 1672,
  w: 760 / 941,
  h: 1060 / 1672,
} as const;

export const LCD_CORNER = 42 / 941;

export type GameBoyButtonId =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'a'
  | 'b'
  | 'start'
  | 'select'
  | 'heart';

export type Hitbox = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export const HITBOXES: Record<GameBoyButtonId, Hitbox> = {
  up: { x: 0.118, y: 0.752, w: 0.168, h: 0.052 },
  down: { x: 0.118, y: 0.848, w: 0.168, h: 0.052 },
  left: { x: 0.068, y: 0.792, w: 0.095, h: 0.072 },
  right: { x: 0.242, y: 0.792, w: 0.095, h: 0.072 },
  b: { x: 0.615, y: 0.78, w: 0.145, h: 0.085 },
  a: { x: 0.755, y: 0.728, w: 0.145, h: 0.085 },
  select: { x: 0.34, y: 0.888, w: 0.13, h: 0.065 },
  start: { x: 0.5, y: 0.888, w: 0.13, h: 0.065 },
  heart: { x: 0.4, y: 0.765, w: 0.2, h: 0.1 },
};

export const BUTTON_HINTS: Record<GameBoyButtonId, string> = {
  up: 'Up',
  down: 'Down',
  left: 'Left',
  right: 'Right',
  a: 'A — confirm',
  b: 'B — back',
  start: 'Start — vault',
  select: 'Select — PartnershipWorld',
  heart: 'Collect with love',
};

export function containFit(
  containerW: number,
  containerH: number,
  imageW: number,
  imageH: number,
) {
  const scale = Math.min(containerW / imageW, containerH / imageH);
  const w = imageW * scale;
  const h = imageH * scale;
  return {
    x: (containerW - w) / 2,
    y: (containerH - h) / 2,
    w,
    h,
    scale,
  };
}
