import type { Condition } from '@/lib/theme';
import type { WalletProviderId } from '@/lib/wallet/adapter';

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
  minted: boolean;
  tokenId: string | null;
  txHash: string | null;
  chain: 'polygon';
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

export type PersistedSession = {
  address: string;
  provider: WalletProviderId;
  connectedAt: string;
  isMock: boolean;
};
