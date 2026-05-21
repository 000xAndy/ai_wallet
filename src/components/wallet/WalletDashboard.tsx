import { useState } from 'react';
import { useWalletStore } from '@/stores/wallet.store';
import { useSettingsStore } from '@/stores/settings.store';
import { WalletCard } from './WalletCard';
import { CreateWalletDialog } from './CreateWalletDialog';
import { ImportWalletDialog } from './ImportWalletDialog';
import { ExportPrivateKeyDialog } from './ExportPrivateKeyDialog';
import { BalanceDisplay } from './BalanceDisplay';
import { useTranslation } from 'react-i18next';
import { Plus, Download, Key } from 'lucide-react';

export function WalletDashboard() {
  const { t } = useTranslation();
  const { wallets, selectedWalletId, defaultWalletId, selectWallet, setDefaultWallet, removeWallet } = useWalletStore();
  const networkMode = useSettingsStore(s => s.networkMode);
  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const selected = wallets.find(w => w.id === selectedWalletId);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">{t('wallet.title')}</h1>
          {networkMode === 'testnet' && (
            <span className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full">{t('sidebar.testnetMode')}</span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-brand-600 hover:bg-brand-700 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">{t('wallet.createWallet')}</span>
          </button>
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" /> <span className="hidden sm:inline">{t('wallet.importWallet')}</span>
          </button>
        </div>
      </div>

      {wallets.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8 text-gray-500" />
          </div>
          <h2 className="text-lg font-medium text-gray-400 mb-2">{t('wallet.noWallet')}</h2>
          <p className="text-sm text-gray-600 mb-4">{t('wallet.noWalletDesc')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {wallets.map(wallet => (
            <WalletCard
              key={wallet.id}
              wallet={wallet}
              selected={wallet.id === selectedWalletId}
              isDefault={wallet.id === defaultWalletId}
              onSelect={() => selectWallet(wallet.id)}
              onExport={() => { selectWallet(wallet.id); setShowExport(true); }}
              onDelete={() => { if (confirm(t('wallet.deleteConfirm'))) removeWallet(wallet.id); }}
              onSetDefault={() => setDefaultWallet(wallet.id)}
            />
          ))}
        </div>
      )}

      {selected && (
        <div className="mt-6">
          <BalanceDisplay networkMode={networkMode} address={selected.addresses[0]?.address} />
        </div>
      )}

      <CreateWalletDialog open={showCreate} onClose={() => setShowCreate(false)} />
      <ImportWalletDialog open={showImport} onClose={() => setShowImport(false)} />
      <ExportPrivateKeyDialog open={showExport} onClose={() => setShowExport(false)} />
    </div>
  );
}
