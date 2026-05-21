import { useEffect, useState, useCallback } from 'react';
import { getFullBalance } from '@/services/rpc.service';
import { formatBalance, shortenAddress } from '@/lib/utils';
import type { WalletBalance } from '@/types/wallet';
import { useTranslation } from 'react-i18next';
import { RefreshCw, Coins, Copy, Check, ChevronDown } from 'lucide-react';
import { CHAINS, getChainKey } from '@/lib/constants';
import { TransactionHistory } from './TransactionHistory';

interface Props {
  networkMode: 'mainnet' | 'testnet';
  address?: string;
}

const SUPPORTED_CHAINS = ['ethereum', 'bsc', 'polygon', 'arbitrum', 'optimism', 'avalanche', 'base', 'linea', 'fantom', 'scroll', 'gnosis', 'celo'];

export function BalanceDisplay({ networkMode, address }: Props) {
  const { t } = useTranslation();
  const [activeChain, setActiveChain] = useState('ethereum');
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const key = getChainKey(activeChain, networkMode);
  const config = CHAINS[key];

  const refresh = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const result = await getFullBalance(address, key);
      setBalance(result);
    } catch {
      setBalance(null);
    }
    setLoading(false);
  }, [address, key]);

  useEffect(() => { refresh(); }, [refresh]);

  const switchChain = (chain: string) => {
    if (chain !== activeChain) {
      setActiveChain(chain);
      setBalance(null);
    }
  };

  useEffect(() => { refresh(); }, [activeChain]);

  if (!address) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-muted-foreground">{t('wallet.balance')}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-tertiary">{shortenAddress(address)}</span>
          <button
            onClick={() => { navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
            className="p-0.5 text-muted-foreground hover:text-foreground"
            title={t('wallet.copyAddress')}
          >
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
          </button>
          <button onClick={refresh} disabled={loading} className="p-1 text-muted-foreground hover:text-foreground">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="relative mb-3">
        <select
          value={activeChain}
          onChange={e => switchChain(e.target.value)}
          className="w-full appearance-none bg-secondary border border-border rounded-lg px-3 py-2 pr-8 text-sm font-medium focus:outline-none focus:border-primary cursor-pointer"
        >
          {SUPPORTED_CHAINS.map((chain) => {
            const cKey = getChainKey(chain, networkMode);
            const cConfig = CHAINS[cKey];
            return (
              <option key={chain} value={chain}>
                {cConfig?.name ?? chain}
              </option>
            );
          })}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>

      <div className="bg-secondary rounded-lg p-3">
        {balance ? (
          <div className="space-y-1">
            <div className="text-base font-semibold">
              {config?.nativeToken.symbol}: {formatBalance(balance.nativeBalance, config?.nativeToken.decimals ?? 18)}
            </div>
            {balance.tokenBalances.map(tb => (
              <div key={tb.symbol} className="text-xs text-muted-foreground">
                {tb.symbol}: {formatBalance(tb.balance, 18)}
              </div>
            ))}
            {balance.tokenBalances.length === 0 && (
              <div className="text-xs text-text-tertiary">{t('wallet.noTokens')}</div>
            )}
          </div>
        ) : (
          <div className="text-xs text-text-tertiary">
            {t('common.loading')}
          </div>
        )}
      </div>

      <TransactionHistory address={address} chainKey={key} />
    </div>
  );
}
