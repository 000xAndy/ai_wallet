import type { ChainConfig } from '@/types/wallet';

export const CHAINS: Record<string, ChainConfig> = {
  bsc_mainnet: {
    chain: 'bsc',
    name: 'BSC Mainnet',
    chainId: 56,
    rpcUrl: 'https://bsc-dataseed.binance.org',
    fallbackRpcs: ['https://bsc-dataseed1.binance.org', 'https://bsc-dataseed2.binance.org'],
    explorerUrl: 'https://bscscan.com',
    explorerApiUrl: 'https://api.bscscan.com/api',
    nativeToken: { symbol: 'BNB', name: 'BNB', decimals: 18 },
    tokens: [
      { symbol: 'USDT', name: 'Tether USD', decimals: 18, contractAddress: '0x55d398326f99059fF775485246999027B3197955' },
      { symbol: 'USDC', name: 'USD Coin', decimals: 18, contractAddress: '0x8AC76a51cc950dA2F293B86f8dA63B1D3AeFb4a1' },
      { symbol: 'BUSD', name: 'Binance USD', decimals: 18, contractAddress: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56' },
    ],
  },
  bsc_testnet: {
    chain: 'bsc',
    name: 'BSC Testnet',
    chainId: 97,
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    fallbackRpcs: ['https://data-seed-prebsc-2-s1.binance.org:8545', 'https://bsc-testnet-rpc.publicnode.com'],
    explorerUrl: 'https://testnet.bscscan.com',
    explorerApiUrl: 'https://api-testnet.bscscan.com/api',
    nativeToken: { symbol: 'BNB', name: 'tBNB', decimals: 18 },
    tokens: [
      { symbol: 'USDT', name: 'Test USDT', decimals: 18, contractAddress: '0x337610d27c682E347C9cD60BD4b3b107A9dDDdD8' },
      { symbol: 'USDC', name: 'Test USDC', decimals: 18, contractAddress: '0x64544969ed7EBf5f083679233325356EbE738930' },
    ],
  },
  ethereum_mainnet: {
    chain: 'ethereum',
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpcUrl: 'https://eth.llamarpc.com',
    fallbackRpcs: ['https://ethereum-rpc.publicnode.com', 'https://rpc.ankr.com/eth'],
    explorerUrl: 'https://etherscan.io',
    explorerApiUrl: 'https://api.etherscan.io/api',
    nativeToken: { symbol: 'ETH', name: 'Ether', decimals: 18 },
    tokens: [
      { symbol: 'USDT', name: 'Tether USD', decimals: 6, contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
      { symbol: 'USDC', name: 'USD Coin', decimals: 6, contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
    ],
  },
  ethereum_sepolia: {
    chain: 'ethereum',
    name: 'Ethereum Sepolia',
    chainId: 11155111,
    rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
    fallbackRpcs: ['https://rpc.sepolia.org', 'https://1rpc.io/sepolia', 'https://sepolia.gateway.tenderly.co'],
    explorerUrl: 'https://sepolia.etherscan.io',
    explorerApiUrl: 'https://api-sepolia.etherscan.io/api',
    nativeToken: { symbol: 'ETH', name: 'Sepolia ETH', decimals: 18 },
    tokens: [
      { symbol: 'USDT', name: 'Test USDT', decimals: 6, contractAddress: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0' },
      { symbol: 'USDC', name: 'Test USDC', decimals: 6, contractAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' },
    ],
  },
  polygon_mainnet: {
    chain: 'polygon',
    name: 'Polygon Mainnet',
    chainId: 137,
    rpcUrl: 'https://polygon-rpc.com',
    fallbackRpcs: ['https://rpc.ankr.com/polygon', 'https://polygon-bor-rpc.publicnode.com'],
    explorerUrl: 'https://polygonscan.com',
    explorerApiUrl: 'https://api.polygonscan.com/api',
    nativeToken: { symbol: 'POL', name: 'POL', decimals: 18 },
    tokens: [
      { symbol: 'USDT', name: 'Tether USD', decimals: 6, contractAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F' },
      { symbol: 'USDC', name: 'USD Coin', decimals: 6, contractAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359' },
    ],
  },
  polygon_amoy: {
    chain: 'polygon',
    name: 'Polygon Amoy',
    chainId: 80002,
    rpcUrl: 'https://rpc-amoy.polygon.technology',
    fallbackRpcs: ['https://polygon-amoy-bor-rpc.publicnode.com'],
    explorerUrl: 'https://amoy.polygonscan.com',
    explorerApiUrl: 'https://api-amoy.polygonscan.com/api',
    nativeToken: { symbol: 'POL', name: 'Amoy POL', decimals: 18 },
    tokens: [],
  },
};

export const DEFAULT_CHAIN = 'bsc_mainnet';

export const NETWORK_GROUPS: Record<string, string[]> = {
  bsc: ['bsc_mainnet', 'bsc_testnet'],
  ethereum: ['ethereum_mainnet', 'ethereum_sepolia'],
  polygon: ['polygon_mainnet', 'polygon_amoy'],
};

export function getChainKey(chain: string, networkMode: 'mainnet' | 'testnet'): string {
  const mapping: Record<string, Record<string, string>> = {
    bsc: { mainnet: 'bsc_mainnet', testnet: 'bsc_testnet' },
    ethereum: { mainnet: 'ethereum_mainnet', testnet: 'ethereum_sepolia' },
    polygon: { mainnet: 'polygon_mainnet', testnet: 'polygon_amoy' },
  };
  return mapping[chain]?.[networkMode] ?? `${chain}_${networkMode}`;
}

export const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];

export const ENCRYPTION = {
  PBKDF2_ITERATIONS: 200000,
  KEY_LENGTH: 256,
  ALGORITHM: 'AES-GCM' as const,
  HASH: 'SHA-256' as const,
};

export const AI_TOOLS = {
  send_transfer: {
    name: 'send_transfer',
    description: '发送代币到指定钱包地址。支持 BSC、Ethereum、Polygon 网络上的原生代币(BNB/ETH/POL)和 ERC-20 代币(USDT/USDC 等)。',
    parameters: {
      type: 'object',
      properties: {
        to: { type: 'string', description: '收款钱包地址 (0x...)' },
        amount: { type: 'string', description: '转账金额，例如 "100"' },
        token: { type: 'string', description: '代币符号: ETH, BNB, POL, USDT, USDC 等，默认为网络原生代币' },
        network: { type: 'string', description: '网络: BSC, Ethereum, Polygon，默认为 BSC' },
      },
      required: ['to', 'amount'],
    },
  },
  save_contact: {
    name: 'save_contact',
    description: '将钱包地址保存为命名的联系人',
    parameters: {
      type: 'object',
      properties: {
        address: { type: 'string', description: '钱包地址 (0x...)' },
        name: { type: 'string', description: '联系人名称' },
      },
      required: ['address', 'name'],
    },
  },
  get_balance: {
    name: 'get_balance',
    description: '查询当前钱包的余额',
    parameters: {
      type: 'object',
      properties: {
        token: { type: 'string', description: '代币符号，默认为网络原生代币' },
        network: { type: 'string', description: '网络: BSC, Ethereum, Polygon，默认为 BSC' },
      },
      required: [],
    },
  },
};
