import type { Condition } from '@/lib/theme';

export type Deck = {
  id: string;
  name: string;
  icon: string;
  createdAt: string;
};

export type Collectible = {
  id: string;
  deckId: string;
  name: string;
  description: string;
  imageUri: string;
  year: string;
  setName: string;
  condition: Condition;
  notes: string;
  // V1 is local-only. These fields are reserved for the future minting layer.
  minted: boolean;
  tokenId: string | null;
  txHash: string | null;
  chain: 'polygon' | null;
  mintedAt: string | null;
  createdAt: string;
};

export type CollectibleDraft = {
  deckId: string;
  name: string;
  description: string;
  imageUri: string;
  year: string;
  setName: string;
  condition: Condition;
  notes: string;
};

export type VaultState = {
  decks: Deck[];
  collectibles: Collectible[];
};
