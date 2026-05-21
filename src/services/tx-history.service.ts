import { getTransactionHistory } from './rpc.service';
import { getTransactions, saveTransactions } from '@/db/indexdb';
import { CHAINS } from '@/lib/constants';
import type { StoredTransaction } from '@/types/wallet';

export async function refreshTxHistory(
  address: string,
  chainKey: string,
): Promise<StoredTransaction[]> {
  const chain = CHAINS[chainKey];
  if (!chain?.explorerApiUrl) return getTransactions(chainKey);

  try {
    const remoteTxs = await getTransactionHistory(address, chainKey, 20);
    if (remoteTxs.length === 0) return getTransactions(chainKey);

    const stored: StoredTransaction[] = remoteTxs.map(tx => ({
      id: `${tx.hash}_${chainKey}`,
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      timestamp: tx.timestamp,
      status: tx.status,
      chainKey,
      chainName: chain.name,
      symbol: chain.nativeToken.symbol,
    }));

    await saveTransactions(stored);
    return stored;
  } catch {
    return getTransactions(chainKey);
  }
}

export async function loadTxHistory(chainKey: string): Promise<StoredTransaction[]> {
  return getTransactions(chainKey, 50);
}
