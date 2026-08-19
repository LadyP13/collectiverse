/**
 * =============================================================================
 * MINT_ON_POLYGON
 * =============================================================================
 * Fake mint for now. Photograph + metadata still run for real; this module
 * only pretends to put the collectible on-chain.
 *
 * To mint for real later:
 *   1. Deploy an ERC-721 on Polygon Amoy (testnet), then flip to mainnet
 *   2. Host the photo + metadata (IPFS or a Pinata/NFT.storage equivalent)
 *   3. Replace mintCollectible() with a contract write from the connected
 *      wallet (ethers / viem + the WALLET_ADAPTER session)
 *   4. Keep the MintResult shape so the vault UI does not need a rewrite
 *
 * Chain choice: Polygon stays. Cheap mints, huge wallet support. Start on
 * Amoy so nobody spends real POL until the flow is proven.
 * =============================================================================
 */

export const POLYGON_NETWORK = 'amoy-stub' as const;
export const POLYGON_CHAIN = 'polygon' as const;

export type MintRequest = {
  name: string;
  description: string;
  imageUri: string;
  walletAddress: string;
};

export type MintResult = {
  tokenId: string;
  txHash: string;
  chain: typeof POLYGON_CHAIN;
  network: typeof POLYGON_NETWORK;
  mintedAt: string;
};

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fakeTokenId() {
  return String(10_000 + Math.floor(Math.random() * 89_999));
}

function fakeTxHash() {
  const hex = Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join('');
  return `0x${hex}`;
}

export async function mintCollectible(_request: MintRequest): Promise<MintResult> {
  await wait(1100);
  return {
    tokenId: fakeTokenId(),
    txHash: fakeTxHash(),
    chain: POLYGON_CHAIN,
    network: POLYGON_NETWORK,
    mintedAt: new Date().toISOString(),
  };
}
