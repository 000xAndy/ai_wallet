import { ethers } from 'ethers';
import { CHAINS, ERC20_ABI } from '@/lib/constants';
import type { WalletBalance, TokenBalance } from '@/types/wallet';

async function withFallback<T>(chainKey: string, fn: (rpcUrl: string) => Promise<T>): Promise<T> {
  const chain = CHAINS[chainKey];
  if (!chain) throw new Error(`不支持的链: ${chainKey}`);
  const urls = [chain.rpcUrl, ...(chain.fallbackRpcs ?? [])];
  let lastError: Error | null = null;
  for (const url of urls) {
    try {
      return await fn(url);
    } catch (e: any) {
      lastError = e;
    }
  }
  throw lastError ?? new Error(`无法连接到 ${chain.name}`);
}

export async function getNativeBalance(address: string, chainKey: string): Promise<string> {
  return withFallback(chainKey, async (rpcUrl) => {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    return (await provider.getBalance(address)).toString();
  });
}

export async function getTokenBalance(address: string, chainKey: string, contractAddress: string): Promise<string> {
  return withFallback(chainKey, async (rpcUrl) => {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(contractAddress, ERC20_ABI, provider);
    return (await contract.balanceOf(address)).toString();
  });
}

export async function getFullBalance(address: string, chainKey: string): Promise<WalletBalance> {
  const chain = CHAINS[chainKey];
  if (!chain) throw new Error(`不支持的链: ${chainKey}`);

  return withFallback(chainKey, async (rpcUrl) => {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const nativeBalance = (await provider.getBalance(address)).toString();

    const tokenBalances: TokenBalance[] = [];
    for (const token of chain.tokens) {
      try {
        if (token.contractAddress) {
          const contract = new ethers.Contract(token.contractAddress, ERC20_ABI, provider);
          const balance = (await contract.balanceOf(address)).toString();
          tokenBalances.push({ symbol: token.symbol, balance, contractAddress: token.contractAddress });
        }
      } catch {
        tokenBalances.push({ symbol: token.symbol, balance: '0', contractAddress: token.contractAddress });
      }
    }

    return { chain: chain.chain, address, nativeBalance, tokenBalances };
  });
}

export async function sendNativeToken(
  privateKey: string,
  to: string,
  amount: string,
  chainKey: string
): Promise<string> {
  return withFallback(chainKey, async (rpcUrl) => {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const tx = await wallet.sendTransaction({ to, value: ethers.parseEther(amount) });
    return tx.hash;
  });
}

export async function sendERC20Token(
  privateKey: string,
  to: string,
  amount: string,
  tokenSymbol: string,
  chainKey: string
): Promise<string> {
  const chain = CHAINS[chainKey];
  if (!chain) throw new Error(`不支持的链: ${chainKey}`);

  const token = chain.tokens.find(t => t.symbol.toUpperCase() === tokenSymbol.toUpperCase());
  if (!token?.contractAddress) throw new Error(`不支持的代币: ${tokenSymbol} 在 ${chain.name}`);

  return withFallback(chainKey, async (rpcUrl) => {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(token.contractAddress!, ERC20_ABI, wallet);
    const parsedAmount = ethers.parseUnits(amount, token.decimals);
    const tx = await contract.transfer(to, parsedAmount);
    return tx.hash;
  });
}

// ---- Transaction History ----

export interface TransactionRecord {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  status: 'success' | 'failed' | 'pending';
}

export async function getTransactionHistory(address: string, chainKey: string, limit = 10): Promise<TransactionRecord[]> {
  const chain = CHAINS[chainKey];
  if (!chain?.explorerApiUrl) return [];

  try {
    const params = new URLSearchParams({
      chainid: String(chain.chainId),
      module: 'account',
      action: 'txlist',
      address,
      page: '1',
      offset: String(limit),
      sort: 'desc',
    });
    const url = `${chain.explorerApiUrl}?${params}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status !== '1' || !Array.isArray(data.result)) return [];
    return data.result.slice(0, limit).map((tx: any) => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      timestamp: parseInt(tx.timeStamp, 10),
      status: tx.isError === '0' ? 'success' : 'failed',
    }));
  } catch {
    return [];
  }
}

// ---- Gas Estimation ----

export interface GasEstimate {
  gasLimit: string;
  gasPrice: string;
  estimatedCost: string;
  estimatedCostFormatted: string;
  symbol: string;
}

export async function estimateGasFee(from: string, to: string, amount: string, chainKey: string): Promise<GasEstimate> {
  const chain = CHAINS[chainKey];
  if (!chain) throw new Error(`不支持的链: ${chainKey}`);

  return withFallback(chainKey, async (rpcUrl) => {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const gasPrice = await provider.getFeeData();
    const gasLimit = await provider.estimateGas({
      from, to, value: ethers.parseEther(amount),
    });
    const gasPriceWei = gasPrice.gasPrice ?? BigInt(0);
    const cost = gasLimit * gasPriceWei;
    return {
      gasLimit: gasLimit.toString(),
      gasPrice: gasPriceWei.toString(),
      estimatedCost: cost.toString(),
      estimatedCostFormatted: ethers.formatEther(cost),
      symbol: chain.nativeToken.symbol,
    };
  });
}

// ---- Transaction Status ----

export interface TxStatus {
  hash: string;
  status: 'pending' | 'success' | 'failed' | 'not_found';
  confirmations: number;
  blockNumber?: number;
  from?: string;
  to?: string;
  value?: string;
}

export async function getTransactionReceipt(txHash: string, chainKey: string): Promise<TxStatus> {
  return withFallback(chainKey, async (rpcUrl) => {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const tx = await provider.getTransaction(txHash);
    if (!tx) return { hash: txHash, status: 'not_found', confirmations: 0 };

    const currentBlock = await provider.getBlockNumber();
    const confirmations = tx.blockNumber ? currentBlock - tx.blockNumber + 1 : 0;
    const status: TxStatus = {
      hash: txHash,
      status: tx.blockNumber ? (confirmations > 0 ? 'success' : 'pending') : 'pending',
      confirmations: Math.max(0, confirmations),
      blockNumber: tx.blockNumber ?? undefined,
      from: tx.from,
      to: tx.to ?? undefined,
      value: tx.value.toString(),
    };

    if (tx.blockNumber) {
      try {
        const receipt = await provider.getTransactionReceipt(txHash);
        status.status = receipt?.status === 1 ? 'success' : 'failed';
      } catch { /* keep pending status */ }
    }

    return status;
  });
}

// ---- Token Approvals ----

export interface TokenAllowance {
  symbol: string;
  contractAddress: string;
  spender: string;
  allowance: string;
  allowanceFormatted: string;
  decimals: number;
  risk: 'none' | 'low' | 'high';
}

const HIGH_RISK_SPENDERS: Record<string, string> = {
  '0x7a250d5630b4cf539739df2c5dacb4c659f2488d': 'Uniswap V2 Router',
  '0x1111111254eeb25477b68fb85ed929f73a960582': '1inch Router',
  '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45': 'Uniswap V3 Router',
};

export async function getTokenAllowances(address: string, chainKey: string): Promise<TokenAllowance[]> {
  const chain = CHAINS[chainKey];
  if (!chain) throw new Error(`不支持的链: ${chainKey}`);

  return withFallback(chainKey, async (rpcUrl) => {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const results: TokenAllowance[] = [];

    for (const token of chain.tokens) {
      if (!token.contractAddress) continue;

      // Query Transfer events to find spenders that have allowances
      const filter = {
        address: token.contractAddress,
        topics: [
          ethers.id('Approval(address,address,uint256)'),
          ethers.zeroPadValue(address, 32),
        ],
        fromBlock: await getRecentBlock(provider, -10000),
        toBlock: 'latest',
      };

      try {
        const logs = await provider.getLogs(filter);
        const spenders = new Set<string>();
        for (const log of logs) {
          const spender = '0x' + log.topics[2].slice(26);
          spenders.add(spender);
        }

        const contract = new ethers.Contract(token.contractAddress, ERC20_ABI, provider);
        for (const spender of spenders) {
          try {
            const allowance = await contract.allowance(address, spender);
            if (allowance > BigInt(0)) {
              const formatted = ethers.formatUnits(allowance, token.decimals);
              const risk = HIGH_RISK_SPENDERS[spender.toLowerCase()]
                ? 'high' : parseFloat(formatted) > 1000 ? 'high' : 'low';
              results.push({
                symbol: token.symbol,
                contractAddress: token.contractAddress,
                spender,
                allowance: allowance.toString(),
                allowanceFormatted: formatted,
                decimals: token.decimals,
                risk,
              });
            }
          } catch { /* skip */ }
        }
      } catch { /* skip this token */ }
    }

    return results;
  });
}

async function getRecentBlock(provider: ethers.JsonRpcProvider, offset: number): Promise<number> {
  const current = await provider.getBlockNumber();
  return Math.max(0, current + offset);
}

export async function revokeApproval(
  privateKey: string,
  contractAddress: string,
  spender: string,
  chainKey: string
): Promise<string> {
  const chain = CHAINS[chainKey];
  if (!chain) throw new Error(`不支持的链: ${chainKey}`);

  return withFallback(chainKey, async (rpcUrl) => {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddress, ERC20_ABI, wallet);
    const tx = await contract.approve(spender, 0);
    return tx.hash;
  });
}

export function resolveChainKey(networkName: string, networkMode: 'mainnet' | 'testnet' = 'mainnet'): string {
  const name = networkName.toLowerCase();
  const isTestnet = networkMode === 'testnet';
  const mapping: Record<string, Record<string, string>> = {
    bsc: { mainnet: 'bsc_mainnet', testnet: 'bsc_testnet' },
    bnb: { mainnet: 'bsc_mainnet', testnet: 'bsc_testnet' },
    'binance smart chain': { mainnet: 'bsc_mainnet', testnet: 'bsc_testnet' },
    ethereum: { mainnet: 'ethereum_mainnet', testnet: 'ethereum_sepolia' },
    eth: { mainnet: 'ethereum_mainnet', testnet: 'ethereum_sepolia' },
    polygon: { mainnet: 'polygon_mainnet', testnet: 'polygon_amoy' },
    matic: { mainnet: 'polygon_mainnet', testnet: 'polygon_amoy' },
    pol: { mainnet: 'polygon_mainnet', testnet: 'polygon_amoy' },
  };
  const entry = mapping[name];
  if (entry) return isTestnet ? entry.testnet : entry.mainnet;
  return isTestnet ? 'bsc_testnet' : 'bsc_mainnet';
}
