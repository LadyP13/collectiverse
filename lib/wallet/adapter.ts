/**
 * =============================================================================
 * WALLET_ADAPTER
 * =============================================================================
 * The UI only talks to this file. Today this is a local mock so MetaMask and
 * WalletConnect buttons feel real without a WalletConnect Cloud project ID
 * or a native rebuild.
 *
 * To wire real wallets later:
 *   1. Install Reown AppKit (WalletConnect) + the MetaMask React Native SDK
 *   2. Replace MockWalletAdapter with a ReownWalletAdapter that implements
 *      the WalletAdapter interface below
 *   3. Keep connect / disconnect / getSession signatures the same
 * =============================================================================
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export type WalletProviderId = 'metamask' | 'walletconnect';

export type WalletSession = {
  address: string;
  provider: WalletProviderId;
  connectedAt: string;
  isMock: boolean;
};

export interface WalletAdapter {
  connect(provider: WalletProviderId): Promise<WalletSession>;
  disconnect(): Promise<void>;
  getSession(): Promise<WalletSession | null>;
}

const SESSION_KEY = 'collectiverse.wallet.session';

const MOCK_ADDRESSES: Record<WalletProviderId, string> = {
  metamask: '0x7A3f91C2e8B4d06F19A5cE71b8D2a091F4e81B2c',
  walletconnect: '0xB91c4E2a7D6f08A1e3C5b904d27F19Ae6c82D4b1',
};

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const walletAdapter: WalletAdapter = {
  async connect(provider) {
    await wait(700);
    const session: WalletSession = {
      address: MOCK_ADDRESSES[provider],
      provider,
      connectedAt: new Date().toISOString(),
      isMock: true,
    };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  },

  async disconnect() {
    await AsyncStorage.removeItem(SESSION_KEY);
  },

  async getSession() {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as WalletSession;
    } catch {
      await AsyncStorage.removeItem(SESSION_KEY);
      return null;
    }
  },
};

export function shortAddress(address: string) {
  if (address.length < 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function providerLabel(provider: WalletProviderId) {
  return provider === 'metamask' ? 'MetaMask' : 'WalletConnect';
}
