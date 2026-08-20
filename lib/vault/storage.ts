import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

import type { Collectible, Deck, VaultState } from '@/lib/vault/types';

const VAULT_KEY = 'collectiverse.vault.v1';
const IDENTITY_KEY = 'collectiverse.identity.v1';

const STARTER_DECKS: Deck[] = [
  {
    id: 'deck-pokemon',
    name: 'Pokémon',
    icon: '🃏',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'deck-crystals',
    name: 'Crystals',
    icon: '💎',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

export function emptyVault(): VaultState {
  return {
    decks: STARTER_DECKS,
    collectibles: [],
  };
}

export async function loadVault(): Promise<VaultState> {
  const raw = await AsyncStorage.getItem(VAULT_KEY);
  if (!raw) {
    const fresh = emptyVault();
    await saveVault(fresh);
    return fresh;
  }

  try {
    const parsed = JSON.parse(raw) as VaultState;
    return {
      decks: Array.isArray(parsed.decks) ? parsed.decks : STARTER_DECKS,
      collectibles: Array.isArray(parsed.collectibles) ? parsed.collectibles : [],
    };
  } catch {
    const fresh = emptyVault();
    await saveVault(fresh);
    return fresh;
  }
}

export async function saveVault(state: VaultState) {
  await AsyncStorage.setItem(VAULT_KEY, JSON.stringify(state));
}

export async function getOrCreateLocalUid(): Promise<string> {
  const existing = await AsyncStorage.getItem(IDENTITY_KEY);
  if (existing) return existing;

  const uid = newId('cv-user');
  await AsyncStorage.setItem(IDENTITY_KEY, uid);
  return uid;
}

export function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function persistCollectibleImage(
  sourceUri: string,
  id: string,
): Promise<string> {
  if (Platform.OS === 'web' || sourceUri.startsWith('data:')) {
    return sourceUri;
  }

  if (!FileSystem.documentDirectory) {
    return sourceUri;
  }

  try {
    const dir = `${FileSystem.documentDirectory}collectibles`;
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    const dest = `${dir}/${id}.jpg`;
    await FileSystem.copyAsync({ from: sourceUri, to: dest });
    return dest;
  } catch {
    return sourceUri;
  }
}

export function collectiblesInDeck(collectibles: Collectible[], deckId: string) {
  return collectibles.filter((item) => item.deckId === deckId);
}
