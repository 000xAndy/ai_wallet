import { useState } from 'react';
import { cn, shortenAddress } from '@/lib/utils';
import type { StoredWallet } from '@/types/wallet';
import { useTranslation } from 'react-i18next';
import { Key, Copy, Check, Trash2, Star } from 'lucide-react';

interface Props {
  wallet: StoredWallet;
  selected: boolean;
  isDefault: boolean;
  onSelect: () => void;
  onExport: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}

export function WalletCard({ wallet, selected, isDefault, onSelect, onExport, onDelete, onSetDefault }: Props) {
  const { t } = useTranslation();
  const mainAddr = wallet.addresses[0];
  const createdAt = new Date(wallet.createdAt).toLocaleDateString('zh-CN');
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mainAddr) {
      navigator.clipboard.writeText(mainAddr.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div
      onClick={onSelect}
      className={cn(
        'p-3 md:p-4 rounded-xl border cursor-pointer transition-all',
        selected
          ? 'border-brand-500 bg-brand-600/10'
          : 'border-gray-800 bg-gray-900 hover:border-gray-700'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div className="w-9 h-9 md:w-10 md:h-10 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
            <Key className="w-4 h-4 md:w-5 md:h-5 text-brand-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-medium text-sm md:text-base truncate">{wallet.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onSetDefault(); }}
                className="flex-shrink-0 p-0.5 transition-colors"
                title={isDefault ? t('wallet.defaultSet') : t('wallet.setDefault')}
              >
                <Star className={cn('w-3 h-3 md:w-3.5 md:h-3.5', isDefault ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600 hover:text-yellow-500')} />
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {mainAddr ? shortenAddress(mainAddr.address) : t('wallet.noAddress')} · {createdAt}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-0.5 md:gap-1 flex-shrink-0">
          {mainAddr && (
            <button
              onClick={handleCopy}
              className="p-1.5 text-gray-500 hover:text-gray-300 transition-colors"
              title={t('wallet.copyAddress')}
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onExport(); }}
            className="px-2 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
{t('wallet.exportPrivateKey')}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 text-gray-600 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
