import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { mintCollectible as stubMint } from '@/lib/mint/polygon';
import {
  loadVault,
  newId,
  persistCollectibleImage,
  saveVault,
} from '@/lib/vault/storage';
import type { Collectible, CollectibleDraft, Deck } from '@/lib/vault/types';
import {
  providerLabel,
  shortAddress,
  walletAdapter,
  type WalletProviderId,
  type WalletSession,
} from '@/lib/wallet/adapter';

type CollectiverseContextValue = {
  ready: boolean;
  session: WalletSession | null;
  decks: Deck[];
  collectibles: Collectible[];
  connect: (provider: WalletProviderId) => Promise<void>;
  disconnect: () => Promise<void>;
  createDeck: (name: string, icon: string) => Promise<Deck>;
  mintNewCollectible: (draft: CollectibleDraft) => Promise<Collectible>;
};

const CollectiverseContext = createContext<CollectiverseContextValue | null>(null);

export function CollectiverseProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<WalletSession | null>(null);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [nextSession, vault] = await Promise.all([
        walletAdapter.getSession(),
        loadVault(),
      ]);
      if (cancelled) return;
      setSession(nextSession);
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

  const connect = useCallback(async (provider: WalletProviderId) => {
    const next = await walletAdapter.connect(provider);
    setSession(next);
  }, []);

  const disconnect = useCallback(async () => {
    await walletAdapter.disconnect();
    setSession(null);
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

  const mintNewCollectible = useCallback(
    async (draft: CollectibleDraft) => {
      if (!session) {
        throw new Error('Connect a wallet before minting.');
      }

      const id = newId('col');
      const imageUri = await persistCollectibleImage(draft.imageUri, id);
      const mint = await stubMint({
        name: draft.name,
        description: draft.description,
        imageUri,
        walletAddress: session.address,
      });

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
        minted: true,
        tokenId: mint.tokenId,
        txHash: mint.txHash,
        chain: 'polygon',
        mintedAt: mint.mintedAt,
        createdAt: new Date().toISOString(),
      };

      await persist(decks, [collectible, ...collectibles]);
      return collectible;
    },
    [collectibles, decks, persist, session],
  );

  const value = useMemo(
    () => ({
      ready,
      session,
      decks,
      collectibles,
      connect,
      disconnect,
      createDeck,
      mintNewCollectible,
    }),
    [
      ready,
      session,
      decks,
      collectibles,
      connect,
      disconnect,
      createDeck,
      mintNewCollectible,
    ],
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

export { providerLabel, shortAddress };
