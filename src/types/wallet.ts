export interface StoredWallet {
  id: string;
  name: string;
  encryptedMnemonic: string; // AES-GCM encrypted, hex-encoded
  encryptedPrivateKey: string; // AES-GCM encrypted, hex-encoded
  iv: string; // hex-encoded IV
  salt: string; // hex-encoded PBKDF2 salt
  addresses: DerivedAddress[];
  createdAt: number;
}

export interface DerivedAddress {
  chain: ChainType;
  network: NetworkType;
  path: string;
  address: string;
}

export type ChainType = 'ethereum' | 'bsc' | 'polygon';
export type NetworkType = 'mainnet' | 'testnet';

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
