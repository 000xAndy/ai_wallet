import { useState } from 'react';
import { useWalletStore } from '@/stores/wallet.store';
import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ImportWalletDialog({ open, onClose }: Props) {
  const { t } = useTranslation();
  const importMnemonic = useWalletStore(s => s.importMnemonic);
  const importPrivateKey = useWalletStore(s => s.importPrivateKey);
  const [mode, setMode] = useState<'mnemonic' | 'privateKey'>('mnemonic');
  const [input, setInput] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleImport = async () => {
    setError('');
    if (!input.trim()) { setError(t('importWallet.inputRequired')); return; }
    if (!name.trim()) { setError(t('createWallet.nameRequired')); return; }
    if (password.length < 8) { setError(t('createWallet.passwordTooShort')); return; }
    if (password !== confirmPassword) { setError(t('createWallet.passwordMismatch')); return; }

    try {
      if (mode === 'mnemonic') {
        await importMnemonic(input.trim(), password, name);
      } else {
        await importPrivateKey(input.trim(), password, name);
      }
      onClose();
      reset();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const reset = () => {
    setInput('');
    setName('');
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-card border border-border rounded-20 p-4 md:p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">{t('importWallet.title')}</h2>

        {error && (
          <div className="flex items-center gap-2 p-2 mb-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode('mnemonic')}
            className={`flex-1 py-2 text-sm rounded-lg transition-colors ${mode === 'mnemonic' ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'}`}
          >{t('importWallet.mnemonic')}</button>
          <button
            onClick={() => setMode('privateKey')}
            className={`flex-1 py-2 text-sm rounded-lg transition-colors ${mode === 'privateKey' ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'}`}
          >{t('importWallet.privateKey')}</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              {mode === 'mnemonic' ? t('importWallet.mnemonic') : t('importWallet.privateKey')}
            </label>
            <textarea
              value={input} onChange={e => setInput(e.target.value)}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none h-20"
              placeholder={mode === 'mnemonic' ? t('importWallet.mnemonicPlaceholder') : t('importWallet.privateKeyPlaceholder')}
            />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">{t('createWallet.name')}</label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">{t('createWallet.password')}</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">{t('createWallet.confirmPassword')}</label>
            <input
              type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <button onClick={handleImport} className="w-full py-2.5 bg-primary hover:bg-primary-hover rounded-lg text-sm font-medium transition-colors">
{t('importWallet.import')}
          </button>
        </div>

        <button onClick={() => { reset(); onClose(); }} className="mt-3 w-full py-2 text-sm text-muted-foreground hover:text-foreground">
          {t('common.cancel')}
        </button>
      </div>
    </div>
  );
}
