import { useState } from 'react';
import { useWalletStore } from '@/stores/wallet.store';
import { exportPrivateKey, exportMnemonic } from '@/services/wallet.service';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Eye, EyeOff, Copy, Check } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ExportPrivateKeyDialog({ open, onClose }: Props) {
  const { t } = useTranslation();
  const selectedWalletId = useWalletStore(s => s.selectedWalletId);
  const [password, setPassword] = useState('');
  const [key, setKey] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<'pk' | 'mnemonic' | null>(null);

  const handleExport = async () => {
    setError('');
    setLoading(true);
    try {
      if (!selectedWalletId) throw new Error(t('wallet.noWallet'));
      const pk = await exportPrivateKey(selectedWalletId, password);
      setKey(pk);
      try {
        const mn = await exportMnemonic(selectedWalletId, password);
        setMnemonic(mn);
      } catch { /* no mnemonic */ }
    } catch (e: any) {
      setError(e.message || t('exportWallet.wrongPassword'));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPassword('');
    setKey('');
    setMnemonic('');
    setShowKey(false);
    setShowMnemonic(false);
    setError('');
    setCopied(null);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => { reset(); onClose(); }}>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 md:p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">{t('exportWallet.title')}</h2>

        {error && (
          <div className="flex items-center gap-2 p-2 mb-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        {!key ? (
          <div className="space-y-3">
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-sm text-yellow-400">{t('exportWallet.securityWarning')}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">{t('exportWallet.enterPassword')}</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                onKeyDown={e => e.key === 'Enter' && handleExport()}
              />
            </div>
            <button
              onClick={handleExport}
              disabled={loading}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? t('exportWallet.verifying') : t('exportWallet.confirmExport')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm text-gray-400">{t('exportWallet.privateKey')}</label>
                <div className="flex gap-2">
                  <button onClick={() => setShowKey(!showKey)} className="text-gray-500 hover:text-gray-300">
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => { navigator.clipboard.writeText(key); setCopied('pk'); }} className="text-gray-500 hover:text-gray-300">
                    {copied === 'pk' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg">
                <p className="text-xs font-mono break-all select-all">
                  {showKey ? key : '•'.repeat(64)}
                </p>
              </div>
            </div>
            {mnemonic && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm text-gray-400">{t('exportWallet.mnemonic')}</label>
                  <div className="flex gap-2">
                    <button onClick={() => setShowMnemonic(!showMnemonic)} className="text-gray-500 hover:text-gray-300">
                      {showMnemonic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button onClick={() => { navigator.clipboard.writeText(mnemonic); setCopied('mnemonic'); }} className="text-gray-500 hover:text-gray-300">
                      {copied === 'mnemonic' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="p-3 bg-gray-800 rounded-lg">
                  <p className="text-xs font-mono leading-relaxed select-all">
                    {showMnemonic ? mnemonic : '•'.repeat(48)}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <button onClick={() => { reset(); onClose(); }} className="mt-3 w-full py-2 text-sm text-gray-500 hover:text-gray-300">
{t('common.close')}
        </button>
      </div>
    </div>
  );
}
