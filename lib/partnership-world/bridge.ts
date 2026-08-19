/**
 * =============================================================================
 * PARTNERSHIPWORLD_BRIDGE
 * =============================================================================
 * Collectiverse is the first puzzle piece of PartnershipWorld. This file is
 * the labelled hook for that later connection.
 *
 * When PW is ready:
 *   1. Flip PARTNERSHIP_WORLD_UNLOCKED (or read a remote flag)
 *   2. Implement openPartnershipWorld() as the deep-link / SSO handshake
 *   3. The vault "locked door" reads isPartnershipWorldUnlocked() and
 *      becomes an open door automatically
 *
 * Do not scatter PW logic across screens — keep it here.
 * =============================================================================
 */

export const PARTNERSHIP_WORLD_UNLOCKED = false;

export const PARTNERSHIP_WORLD = {
  name: 'PartnershipWorld',
  tagline: 'A door to the wider universe.',
  comingSoonLabel: 'Coming soon',
} as const;

export function isPartnershipWorldUnlocked() {
  return PARTNERSHIP_WORLD_UNLOCKED;
}

export async function openPartnershipWorld(): Promise<void> {
  if (!PARTNERSHIP_WORLD_UNLOCKED) {
    return;
  }
  // TODO: deep-link / auth handshake with PartnershipWorld
}
