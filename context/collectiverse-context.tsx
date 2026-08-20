import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  getOrCreateLocalUid,
  loadVault,
  newId,
  persistCollectibleImage,
  saveVault,
} from '@/lib/vault/storage';
import type { Collectible, CollectibleDraft, Deck } from '@/lib/vault/types';

export type LocalIdentity = {
  uid: string;
  createdAt: string;
};

type CollectiverseContextValue = {
  ready: boolean;
  identity: LocalIdentity | null;
  decks: Deck[];
  collectibles: Collectible[];
  createDeck: (name: string, icon: string) => Promise<Deck>;
  saveCollectible: (draft: CollectibleDraft) => Promise<Collectible>;
};

const CollectiverseContext = createContext<CollectiverseContextValue | null>(null);

export function CollectiverseProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [identity, setIdentity] = useState<LocalIdentity | null>(null);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [uid, vault] = await Promise.all([getOrCreateLocalUid(), loadVault()]);
      if (cancelled) return;
      setIdentity({ uid, createdAt: new Date().toISOString() });
      setDecks(vault.decks);
      setCollectibles(vault.collectibles);
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (nextDecks: Deck[], nextCollectibles: Collectible[]) => {
    setDecks(nextDecks);
    setCollectibles(nextCollectibles);
    await saveVault({ decks: nextDecks, collectibles: nextCollectibles });
  }, []);

  const createDeck = useCallback(
    async (name: string, icon: string) => {
      const deck: Deck = {
        id: newId('deck'),
        name: name.trim(),
        icon,
        createdAt: new Date().toISOString(),
      };
      await persist([...decks, deck], collectibles);
      return deck;
    },
    [collectibles, decks, persist],
  );

  const saveCollectible = useCallback(
    async (draft: CollectibleDraft) => {
      const id = newId('col');
      const imageUri = await persistCollectibleImage(draft.imageUri, id);

      const collectible: Collectible = {
        id,
        deckId: draft.deckId,
        name: draft.name.trim(),
        description: draft.description.trim(),
        imageUri,
        year: draft.year.trim(),
        setName: draft.setName.trim(),
        condition: draft.condition,
        notes: draft.notes.trim(),
        minted: false,
        tokenId: null,
        txHash: null,
        chain: null,
        mintedAt: null,
        createdAt: new Date().toISOString(),
      };

      await persist(decks, [collectible, ...collectibles]);
      return collectible;
    },
    [collectibles, decks, persist],
  );

  const value = useMemo(
    () => ({
      ready,
      identity,
      decks,
      collectibles,
      createDeck,
      saveCollectible,
    }),
    [ready, identity, decks, collectibles, createDeck, saveCollectible],
  );

  return (
    <CollectiverseContext.Provider value={value}>
      {children}
    </CollectiverseContext.Provider>
  );
}

export function useCollectiverse() {
  const value = useContext(CollectiverseContext);
  if (!value) {
    throw new Error('useCollectiverse must be used inside CollectiverseProvider');
  }
  return value;
}
