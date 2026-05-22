import { useEffect, useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useTranslation } from 'react-i18next';
import { ExternalLink, RefreshCw, ArrowUpRight, ArrowDownLeft, Clock, Copy, Check } from 'lucide-react';
import { loadTxHistory } from '@/services/tx-history.service';
import { CHAINS } from '@/lib/constants';
import type { StoredTransaction } from '@/types/wallet';

interface Props {
  address: string;
  chainKey: string;
}

export function TransactionHistory({ address, chainKey }: Props) {
  const { t } = useTranslation();
  const [txs, setTxs] = useState<StoredTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chain = CHAINS[chainKey];

  const load = useCallback(async () => {
    setLoading(true);
    const cached = await loadTxHistory(chainKey);
    setTxs(cached);
    setLoading(false);
  }, [chainKey]);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh while there are pending txs (pollLocalReceipt updates IndexedDB in background)
  useEffect(() => {
    const hasPending = txs.some(tx => tx.status === 'pending');
    if (!hasPending) return;
    const id = setInterval(async () => {
      const cached = await loadTxHistory(chainKey);
      setTxs(cached);
    }, 3000);
    return () => clearInterval(id);
  }, [txs, chainKey]);

  const openExplorer = (hash: string) => {
    if (chain) {
      window.open(`${chain.explorerUrl}/tx/${hash}`, '_blank', 'noopener');
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts * 1000);
    return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }) + ' ' +
      d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  const isSent = (tx: StoredTransaction) =>
    tx.from.toLowerCase() === address.toLowerCase();

  const formatValue = (wei: string) => {
    try {
      const formatted = ethers.formatEther(wei);
      const num = parseFloat(formatted);
      if (num === 0) return '0';
      if (num < 0.0001) return '<0.0001';
      return num.toFixed(num < 1 ? 6 : 4);
    } catch {
      return '0';
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-card mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-muted-foreground">{t('wallet.transactionHistory')}</h3>
        <button onClick={load} disabled={loading} className="p-1 text-muted-foreground hover:text-foreground">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {txs.length === 0 ? (
        <p className="text-xs text-text-tertiary text-center py-4">
          {loading ? t('wallet.loading') : t('wallet.noTransactions')}
        </p>
      ) : (
        <div className="space-y-1">
          {txs.slice(0, 10).map(tx => (
          <div
            key={tx.id}
            onClick={() => openExplorer(tx.hash)}
            className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-secondary cursor-pointer transition-colors group"
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
              tx.status === 'success'
                ? isSent(tx) ? 'bg-warning/10 text-warning' : 'bg-success-surface text-success'
                : tx.status === 'failed'
                ? 'bg-destructive/10 text-destructive'
                : 'bg-muted text-muted-foreground'
            }`}>
              {tx.status === 'pending'
                ? <Clock className="w-3.5 h-3.5" />
                : isSent(tx)
                ? <ArrowUpRight className="w-3.5 h-3.5" />
                : <ArrowDownLeft className="w-3.5 h-3.5" />
              }
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium">
                  {isSent(tx) ? t('wallet.sent') : t('wallet.received')}
                </span>
                {tx.from.toLowerCase() === tx.to.toLowerCase() && (
                  <span className="text-xs px-1 py-0.5 rounded bg-blue-500/15 text-blue-400 font-medium">SELF</span>
                )}
                <span className={`text-xs px-1 py-0.5 rounded ${
                  tx.status === 'success' ? 'bg-success-surface text-success' :
                  tx.status === 'failed' ? 'bg-destructive/10 text-destructive' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {tx.status === 'success' ? t('wallet.txSuccess') :
                   tx.status === 'failed' ? t('wallet.txFailed') :
                   t('wallet.txPending')}
                </span>
              </div>
              <div className="text-xs text-text-tertiary mt-0.5 flex items-center gap-1 min-w-0">
                <span className="text-muted-foreground flex-shrink-0">{isSent(tx) ? t('wallet.to') : t('wallet.from')}:</span>
                <span className="font-mono truncate">{isSent(tx) ? tx.to : tx.from}</span>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    const addr = isSent(tx) ? tx.to : tx.from;
                    navigator.clipboard.writeText(addr);
                    setCopiedId(addr);
                    setTimeout(() => setCopiedId(null), 1500);
                  }}
                  className="flex-shrink-0 p-0.5 text-muted-foreground hover:text-foreground"
                  title={t('wallet.copyAddress')}
                >
                  {copiedId === (isSent(tx) ? tx.to : tx.from) ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <div className="text-xs text-text-tertiary font-mono mt-0.5 truncate">
                {tx.hash} · {formatTime(tx.timestamp)}
              </div>
            </div>

            <div className="text-sm font-medium text-right flex-shrink-0">
              <span className={isSent(tx) ? 'text-foreground' : 'text-success'}>
                {isSent(tx) ? '-' : '+'}{formatValue(tx.value)} {tx.symbol}
              </span>
            </div>

            <a
              href={chain ? `${chain.explorerUrl}/tx/${tx.hash}` : '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex-shrink-0 p-1 text-muted-foreground hover:text-foreground transition-colors"
              title={t('wallet.viewOnExplorer')}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
