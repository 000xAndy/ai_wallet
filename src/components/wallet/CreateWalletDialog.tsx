import { useState } from 'react';
import { useWalletStore } from '@/stores/wallet.store';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Check, Copy } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateWalletDialog({ open, onClose }: Props) {
  const { t } = useTranslation();
  const createWallet = useWalletStore(s => s.createWallet);
  const loading = useWalletStore(s => s.loading);
  const [step, setStep] = useState<'form' | 'mnemonic' | 'verify'>('form');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    setError('');
    if (loading) return;
    if (!name.trim()) { setError(t('createWallet.nameRequired')); return; }
    if (password.length < 8) { setError(t('createWallet.passwordTooShort')); return; }
    if (password !== confirmPassword) { setError(t('createWallet.passwordMismatch')); return; }

    try {
      const { generateMnemonic: gen } = await import('bip39');
      const mn = gen(256);
      setMnemonic(mn);
      setStep('mnemonic');
    } catch (e: any) {
      const msg = String(e?.message ?? e ?? 'Unknown error');
      console.error('generateMnemonic failed:', e);
      setError(msg);
    }
  };

  const handleConfirm = async () => {
    if (loading) return;
    try {
      await createWallet(password, name, mnemonic);
      reset();
      onClose();
    } catch (e: any) {
      const msg = String(e?.message ?? e ?? 'Unknown error');
      console.error('createWallet failed:', e);
      setError(msg);
    }
  };

  const reset = () => {
    setStep('form');
    setName('');
    setPassword('');
    setConfirmPassword('');
    setMnemonic('');
    setError('');
    setCopied(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-card border border-border rounded-20 p-4 md:p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">
          {step === 'form' ? t('createWallet.title') : step === 'mnemonic' ? t('createWallet.backupMnemonic') : t('createWallet.verifyMnemonic')}
        </h2>

        {error && (
          <div className="flex items-center gap-2 p-2 mb-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        {step === 'form' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">{t('createWallet.name')}</label>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                placeholder={t('createWallet.namePlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">{t('createWallet.password')}</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                placeholder={t('createWallet.passwordPlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">{t('createWallet.confirmPassword')}</label>
              <input
                type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                placeholder={t('createWallet.confirmPasswordPlaceholder')}
              />
            </div>
            <button onClick={handleCreate} disabled={loading} className="w-full py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors">
              {loading ? t('common.loading') : t('createWallet.create')}
            </button>
          </div>
        )}

        {step === 'mnemonic' && (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-sm text-yellow-400">
                <AlertCircle className="w-4 h-4 inline mr-1" />
{t('createWallet.saveWarning')}
              </p>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-sm font-mono leading-relaxed select-all">{mnemonic}</p>
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(mnemonic); setCopied(true); }}
              className="flex items-center gap-2 text-sm text-primary hover:text-primary/80"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t('common.copied') : t('createWallet.copyMnemonic')}
            </button>
            <button onClick={handleConfirm} disabled={loading} className="w-full py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors">
              {loading ? t('common.loading') : t('createWallet.confirmCreate')}
            </button>
          </div>
        )}

        <button onClick={() => { reset(); onClose(); }} className="mt-3 w-full py-2 text-sm text-muted-foreground hover:text-foreground">
{t('common.cancel')}
        </button>
      </div>
    </div>
  );
}
