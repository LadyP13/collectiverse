/**
 * Flip this to true to restore the original Earth splash art.
 * The Earth file stays at assets/images/icon-background.png.
 */
export const USE_EARTH_SPLASH_FALLBACK = false;

export const splashImage = USE_EARTH_SPLASH_FALLBACK
  ? require('../assets/images/icon-background.png')
  : require('../assets/images/splash-collectiverse.jpg');
