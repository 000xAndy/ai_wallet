import type { ChainConfig, TcxChain } from '@/types/wallet';

export const CHAINS: Record<string, ChainConfig> = {
  bsc_mainnet: {
    chain: 'bsc',
    name: 'BSC Mainnet',
    chainId: 56,
    rpcUrl: 'https://bsc-dataseed.binance.org',
    fallbackRpcs: ['https://bsc-dataseed1.binance.org', 'https://bsc-dataseed2.binance.org'],
    explorerUrl: 'https://bscscan.com',
    explorerApiUrl: 'https://api.etherscan.io/v2/api',
    nativeToken: { symbol: 'BNB', name: 'BNB', decimals: 18 },
    tokens: [
      { symbol: 'USDT', name: 'Tether USD', decimals: 18, contractAddress: '0x55d398326f99059fF775485246999027B3197955' },
      { symbol: 'USDC', name: 'USD Coin', decimals: 18, contractAddress: '0x8AC76a51cc950dA2F293B86f8dA63B1D3AeFb4a1' },
    ],
  },
  bsc_testnet: {
    chain: 'bsc',
    name: 'BSC Testnet',
    chainId: 97,
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    fallbackRpcs: ['https://data-seed-prebsc-2-s1.binance.org:8545', 'https://bsc-testnet-rpc.publicnode.com'],
    explorerUrl: 'https://testnet.bscscan.com',
    explorerApiUrl: 'https://api.etherscan.io/v2/api',
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
    rpcUrl: 'https://cloudflare-eth.com',
    fallbackRpcs: ['https://ethereum-rpc.publicnode.com', 'https://rpc.ankr.com/eth'],
    explorerUrl: 'https://etherscan.io',
    explorerApiUrl: 'https://api.etherscan.io/v2/api',
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
    fallbackRpcs: ['https://rpc.sepolia.org', 'https://1rpc.io/sepolia'],
    explorerUrl: 'https://sepolia.etherscan.io',
    explorerApiUrl: 'https://api.etherscan.io/v2/api',
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
    rpcUrl: 'https://polygon-bor-rpc.publicnode.com',
    fallbackRpcs: ['https://1rpc.io/matic'],
    explorerUrl: 'https://polygonscan.com',
    explorerApiUrl: 'https://api.etherscan.io/v2/api',
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
    explorerApiUrl: 'https://api.etherscan.io/v2/api',
    nativeToken: { symbol: 'POL', name: 'Amoy POL', decimals: 18 },
    tokens: [],
  },
  arbitrum_mainnet: {
    chain: 'arbitrum',
    name: 'Arbitrum One',
    chainId: 42161,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    fallbackRpcs: ['https://arbitrum-one-rpc.publicnode.com', 'https://1rpc.io/arb'],
    explorerUrl: 'https://arbiscan.io',
    explorerApiUrl: 'https://api.etherscan.io/v2/api',
    nativeToken: { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
    tokens: [
      { symbol: 'USDT', name: 'Tether USD', decimals: 6, contractAddress: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9' },
      { symbol: 'USDC', name: 'USD Coin', decimals: 6, contractAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' },
    ],
  },
  arbitrum_sepolia: {
    chain: 'arbitrum',
    name: 'Arbitrum Sepolia',
    chainId: 421614,
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
    fallbackRpcs: ['https://arbitrum-sepolia-rpc.publicnode.com'],
    explorerUrl: 'https://sepolia.arbiscan.io',
    explorerApiUrl: 'https://api.etherscan.io/v2/api',
    nativeToken: { symbol: 'ETH', name: 'Sepolia ETH', decimals: 18 },
    tokens: [],
  },
  optimism_mainnet: {
    chain: 'optimism',
    name: 'OP Mainnet',
    chainId: 10,
    rpcUrl: 'https://mainnet.optimism.io',
    fallbackRpcs: ['https://optimism-rpc.publicnode.com', 'https://1rpc.io/op'],
    explorerUrl: 'https://optimistic.etherscan.io',
    explorerApiUrl: 'https://api.etherscan.io/v2/api',
    nativeToken: { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
    tokens: [
      { symbol: 'USDT', name: 'Tether USD', decimals: 6, contractAddress: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58' },
      { symbol: 'USDC', name: 'USD Coin', decimals: 6, contractAddress: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85' },
    ],
  },
  optimism_sepolia: {
    chain: 'optimism',
    name: 'OP Sepolia',
    chainId: 11155420,
    rpcUrl: 'https://sepolia.optimism.io',
    fallbackRpcs: ['https://optimism-sepolia-rpc.publicnode.com'],
    explorerUrl: 'https://sepolia-optimistic.etherscan.io',
    explorerApiUrl: 'https://api.etherscan.io/v2/api',
    nativeToken: { symbol: 'ETH', name: 'Sepolia ETH', decimals: 18 },
    tokens: [],
  },
  avalanche_mainnet: {
    chain: 'avalanche',
    name: 'Avalanche C-Chain',
    chainId: 43114,
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    fallbackRpcs: ['https://avalanche-c-chain-rpc.publicnode.com', 'https://1rpc.io/avax/c'],
    explorerUrl: 'https://snowtrace.io',
    explorerApiUrl: 'https://api.etherscan.io/v2/api',
    nativeToken: { symbol: 'AVAX', name: 'Avalanche', decimals: 18 },
    tokens: [
      { symbol: 'USDT', name: 'Tether USD', decimals: 6, contractAddress: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7' },
      { symbol: 'USDC', name: 'USD Coin', decimals: 6, contractAddress: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E' },
    ],
  },
  avalanche_fuji: {
    chain: 'avalanche',
    name: 'Avalanche Fuji',
    chainId: 43113,
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
    fallbackRpcs: ['https://avalanche-fuji-c-chain-rpc.publicnode.com'],
    explorerUrl: 'https://testnet.snowtrace.io',
    explorerApiUrl: 'https://api.etherscan.io/v2/api',
    nativeToken: { symbol: 'AVAX', name: 'Fuji AVAX', decimals: 18 },
    tokens: [],
  },
  base_mainnet: {
    chain: 'base',
    name: 'Base',
    chainId: 8453,
    rpcUrl: 'https://mainnet.base.org',
    fallbackRpcs: ['https://base-rpc.publicnode.com', 'https://1rpc.io/base'],
    explorerUrl: 'https://basescan.org',
    explorerApiUrl: 'https://api.etherscan.io/v2/api',
    nativeToken: { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
    tokens: [
      { symbol: 'USDC', name: 'USD Coin', decimals: 6, contractAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' },
    ],
  },
  base_sepolia: {
    chain: 'base',
    name: 'Base Sepolia',
    chainId: 84532,
    rpcUrl: 'https://sepolia.base.org',
    fallbackRpcs: ['https://base-sepolia-rpc.publicnode.com'],
    explorerUrl: 'https://sepolia.basescan.org',
    explorerApiUrl: 'https://api.etherscan.io/v2/api',
    nativeToken: { symbol: 'ETH', name: 'Sepolia ETH', decimals: 18 },
    tokens: [],
  },
  linea_mainnet: {
    chain: 'linea',
    name: 'Linea',
    chainId: 59144,
    rpcUrl: 'https://rpc.linea.build',
    fallbackRpcs: ['https://linea-rpc.publicnode.com', 'https://1rpc.io/linea'],
    explorerUrl: 'https://lineascan.build',
    explorerApiUrl: 'https://api.etherscan.io/v2/api',
    nativeToken: { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
    tokens: [
      { symbol: 'USDC', name: 'USD Coin', decimals: 6, contractAddress: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff' },
    ],
  },
  fantom_mainnet: {
    chain: 'fantom',
    name: 'Fantom Opera',
    chainId: 250,
    rpcUrl: 'https://rpcapi.fantom.network',
    fallbackRpcs: ['https://fantom-rpc.publicnode.com', 'https://1rpc.io/ftm'],
    explorerUrl: 'https://ftmscan.com',
    explorerApiUrl: 'https://api.etherscan.io/v2/api',
    nativeToken: { symbol: 'FTM', name: 'Fantom', decimals: 18 },
    tokens: [
      { symbol: 'USDT', name: 'Tether USD', decimals: 6, contractAddress: '0x049d68029688eAbF473097a2fC38ef61633A3C7A' },
      { symbol: 'USDC', name: 'USD Coin', decimals: 6, contractAddress: '0x28a92dde19D9989F39A49905d7C9C2FAc7799bDf' },
    ],
  },
  scroll_mainnet: {
    chain: 'scroll',
    name: 'Scroll',
    chainId: 534352,
    rpcUrl: 'https://rpc.scroll.io',
    fallbackRpcs: ['https://scroll-rpc.publicnode.com', 'https://1rpc.io/scroll'],
    explorerUrl: 'https://scrollscan.com',
    explorerApiUrl: 'https://api.etherscan.io/v2/api',
    nativeToken: { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
    tokens: [
      { symbol: 'USDC', name: 'USD Coin', decimals: 6, contractAddress: '0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4' },
    ],
  },
  gnosis_mainnet: {
    chain: 'gnosis',
    name: 'Gnosis Chain',
    chainId: 100,
    rpcUrl: 'https://rpc.gnosischain.com',
    fallbackRpcs: ['https://gnosis-rpc.publicnode.com', 'https://1rpc.io/gnosis'],
    explorerUrl: 'https://gnosisscan.io',
    explorerApiUrl: 'https://api.etherscan.io/v2/api',
    nativeToken: { symbol: 'xDAI', name: 'xDai', decimals: 18 },
    tokens: [
      { symbol: 'USDT', name: 'Tether USD', decimals: 6, contractAddress: '0x4ECaBa5870353805a9F068101A40E0f32ed605C6' },
      { symbol: 'USDC', name: 'USD Coin', decimals: 6, contractAddress: '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83' },
    ],
  },
  celo_mainnet: {
    chain: 'celo',
    name: 'Celo',
    chainId: 42220,
    rpcUrl: 'https://forno.celo.org',
    fallbackRpcs: ['https://celo-rpc.publicnode.com', 'https://1rpc.io/celo'],
    explorerUrl: 'https://celoscan.io',
    explorerApiUrl: 'https://api.etherscan.io/v2/api',
    nativeToken: { symbol: 'CELO', name: 'CELO', decimals: 18 },
    tokens: [
      { symbol: 'USDT', name: 'Tether USD', decimals: 6, contractAddress: '0x617f3112bf5397D0467D315cC709EF968D9ba546' },
      { symbol: 'USDC', name: 'USD Coin', decimals: 6, contractAddress: '0xcebA9300f2b948710d2653dD7B07f33A8B32118C' },
    ],
  },
};

export const DEFAULT_CHAIN = 'bsc_mainnet';

export const NETWORK_GROUPS: Record<string, string[]> = {
  bsc: ['bsc_mainnet', 'bsc_testnet'],
  ethereum: ['ethereum_mainnet', 'ethereum_sepolia'],
  polygon: ['polygon_mainnet', 'polygon_amoy'],
  arbitrum: ['arbitrum_mainnet', 'arbitrum_sepolia'],
  optimism: ['optimism_mainnet', 'optimism_sepolia'],
  avalanche: ['avalanche_mainnet', 'avalanche_fuji'],
  base: ['base_mainnet', 'base_sepolia'],
  linea: ['linea_mainnet'],
  fantom: ['fantom_mainnet'],
  scroll: ['scroll_mainnet'],
  gnosis: ['gnosis_mainnet'],
  celo: ['celo_mainnet'],
};

export function getChainKey(chain: string, networkMode: 'mainnet' | 'testnet'): string {
  const mapping: Record<string, Record<string, string>> = {
    bsc: { mainnet: 'bsc_mainnet', testnet: 'bsc_testnet' },
    ethereum: { mainnet: 'ethereum_mainnet', testnet: 'ethereum_sepolia' },
    polygon: { mainnet: 'polygon_mainnet', testnet: 'polygon_amoy' },
    arbitrum: { mainnet: 'arbitrum_mainnet', testnet: 'arbitrum_sepolia' },
    optimism: { mainnet: 'optimism_mainnet', testnet: 'optimism_sepolia' },
    avalanche: { mainnet: 'avalanche_mainnet', testnet: 'avalanche_fuji' },
    base: { mainnet: 'base_mainnet', testnet: 'base_sepolia' },
    linea: { mainnet: 'linea_mainnet', testnet: 'linea_mainnet' },
    fantom: { mainnet: 'fantom_mainnet', testnet: 'fantom_mainnet' },
    scroll: { mainnet: 'scroll_mainnet', testnet: 'scroll_mainnet' },
    gnosis: { mainnet: 'gnosis_mainnet', testnet: 'gnosis_mainnet' },
    celo: { mainnet: 'celo_mainnet', testnet: 'celo_mainnet' },
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

const _EK = 'WlNHNzU2WTlCQlhaUTg0UVc2QzFZQ0Y2WVpTNURXRUZLVQ==';
export function getExplorerApiKey(): string {
  return atob(_EK);
}

// ---- tcx-wasm constants ----

export const TCX_CHAIN_MAP: Record<string, TcxChain> = {
  bsc_mainnet: 'ETHEREUM', bsc_testnet: 'ETHEREUM',
  ethereum_mainnet: 'ETHEREUM', ethereum_sepolia: 'ETHEREUM',
  polygon_mainnet: 'ETHEREUM', polygon_amoy: 'ETHEREUM',
  arbitrum_mainnet: 'ETHEREUM', arbitrum_sepolia: 'ETHEREUM',
  optimism_mainnet: 'ETHEREUM', optimism_sepolia: 'ETHEREUM',
  avalanche_mainnet: 'ETHEREUM', avalanche_fuji: 'ETHEREUM',
  base_mainnet: 'ETHEREUM', base_sepolia: 'ETHEREUM',
  linea_mainnet: 'ETHEREUM',
  fantom_mainnet: 'ETHEREUM',
  scroll_mainnet: 'ETHEREUM',
  gnosis_mainnet: 'ETHEREUM',
  celo_mainnet: 'ETHEREUM',
};

export const TCX_DERIVATION_PATH = "m/44'/60'/0'/0/0";

export const DEFAULT_DERIVE_CHAINS: TcxChain[] = ['ETHEREUM'];

export const AI_TOOLS = {
  send_transfer: {
    name: 'send_transfer',
    description: '发送代币到指定钱包地址。支持 BSC、Ethereum、Polygon、Arbitrum、Optimism、Avalanche、Base、Linea、Fantom、Scroll、Gnosis、Celo 网络上的原生代币和 ERC-20 代币。',
    parameters: {
      type: 'object',
      properties: {
        to: { type: 'string', description: '收款钱包地址 (0x...)' },
        amount: { type: 'string', description: '转账金额，例如 "100"' },
        token: { type: 'string', description: '代币符号: ETH, BNB, POL, AVAX, FTM, CELO, USDT, USDC 等，默认为网络原生代币' },
        network: { type: 'string', description: '网络: BSC, Ethereum, Polygon, Arbitrum, Optimism, Avalanche, Base 等，默认为 BSC' },
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
        network: { type: 'string', description: '网络: BSC, Ethereum, Polygon, Arbitrum 等，默认为 BSC' },
      },
      required: [],
    },
  },
};
