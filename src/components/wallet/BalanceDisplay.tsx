import { useEffect, useState, useCallback } from 'react';
import { getFullBalance } from '@/services/rpc.service';
import { formatBalance, shortenAddress } from '@/lib/utils';
import type { WalletBalance } from '@/types/wallet';
import { useTranslation } from 'react-i18next';
import { RefreshCw, Coins, Copy, Check } from 'lucide-react';
import { CHAINS, getChainKey } from '@/lib/constants';

interface Props {
  networkMode: 'mainnet' | 'testnet';
  address?: string;
}

const SUPPORTED_CHAINS = ['bsc', 'ethereum', 'polygon'];

export function BalanceDisplay({ networkMode, address }: Props) {
  const { t } = useTranslation();
  const [balances, setBalances] = useState<Record<string, WalletBalance | null>>({});
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const refresh = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    const results: Record<string, WalletBalance | null> = {};
    for (const chain of SUPPORTED_CHAINS) {
      const key = getChainKey(chain, networkMode);
      try {
        results[key] = await getFullBalance(address, key);
      } catch {
        results[key] = null;
      }
    }
    setBalances(results);
    setLoading(false);
  }, [address, networkMode]);

  useEffect(() => { refresh(); }, [refresh]);

  if (!address) return null;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-brand-400" />
          <h3 className="text-sm font-medium text-gray-400">{t('wallet.balance')}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">{shortenAddress(address)}</span>
          <button
            onClick={() => { navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
            className="p-0.5 text-gray-500 hover:text-gray-300"
            title={t('wallet.copyAddress')}
          >
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
          </button>
          <button onClick={refresh} disabled={loading} className="p-1 text-gray-500 hover:text-gray-300">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {SUPPORTED_CHAINS.map((chain) => {
          const key = getChainKey(chain, networkMode);
          const config = CHAINS[key];
          const balance = balances[key];
          return (
            <div key={chain} className="bg-gray-800 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-2">{config?.name ?? chain}</div>
              {balance ? (
                <div className="space-y-1">
                  <div className="text-base font-semibold">
                    {config?.nativeToken.symbol}: {formatBalance(balance.nativeBalance, config?.nativeToken.decimals ?? 18)}
                  </div>
                  {balance.tokenBalances.map(tb => (
                    <div key={tb.symbol} className="text-xs text-gray-400">
                      {tb.symbol}: {formatBalance(tb.balance, 18)}
                    </div>
                  ))}
                  {balance.tokenBalances.length === 0 && (
                    <div className="text-xs text-gray-600">{t('wallet.noTokens')}</div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-gray-600">{t('common.loading')}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
