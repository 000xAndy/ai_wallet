export type WalletType = 'keystore' | 'privateKey';

export interface StoredWallet {
  id: string;
  name: string;
  walletType: WalletType;
  // For walletType === 'keystore': tcx-wasm keystore JSON, wrapped with outer AES-GCM
  encryptedKeystore?: string;
  // For walletType === 'privateKey': legacy ethers.js wallet fields
  encryptedMnemonic?: string;
  encryptedPrivateKey?: string;
  iv: string; // hex-encoded IV (used for both wallet types)
  salt: string; // hex-encoded PBKDF2 salt (used for both wallet types)
  addresses: DerivedAddress[];
  createdAt: number;
}

export interface DerivedAddress {
  chain: ChainType;
  network: NetworkType;
  path: string;
  address: string;
}

export type ChainType = 'ethereum' | 'bsc' | 'polygon' | 'arbitrum' | 'optimism' | 'avalanche' | 'base' | 'linea' | 'fantom' | 'scroll' | 'gnosis' | 'celo';
export type NetworkType = 'mainnet' | 'testnet';

// tcx-wasm chain identifiers (only EVM chains for this project)
export type TcxChain = 'ETHEREUM';

export interface ChainConfig {
  chain: ChainType;
  name: string;
  chainId: number;
  rpcUrl: string;
  fallbackRpcs?: string[];
  explorerUrl: string;
  explorerApiUrl?: string;
  nativeToken: TokenInfo;
  tokens: TokenInfo[];
}

export interface TokenInfo {
  symbol: string;
  name: string;
  decimals: number;
  contractAddress?: string; // undefined = native token
}

export interface WalletBalance {
  chain: ChainType;
  address: string;
  nativeBalance: string;
  tokenBalances: TokenBalance[];
}

export interface TokenBalance {
  symbol: string;
  balance: string;
  contractAddress?: string;
}

export interface StoredTransaction {
  id: string; // hash_chainKey
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  status: 'success' | 'failed' | 'pending';
  chainKey: string;
  chainName: string;
  symbol: string;
}
