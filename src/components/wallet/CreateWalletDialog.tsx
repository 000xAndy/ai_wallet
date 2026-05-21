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
  const [step, setStep] = useState<'form' | 'mnemonic' | 'verify'>('form');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    setError('');
    if (!name.trim()) { setError(t('createWallet.nameRequired')); return; }
    if (password.length < 8) { setError(t('createWallet.passwordTooShort')); return; }
    if (password !== confirmPassword) { setError(t('createWallet.passwordMismatch')); return; }

    try {
      // Generate mnemonic first to show to user
      const { generateMnemonic } = await import('bip39');
      const mn = generateMnemonic(256);
      setMnemonic(mn);
      setStep('mnemonic');
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleConfirm = async () => {
    try {
      await createWallet(password, name);
      reset();
      onClose();
    } catch (e: any) {
      setError(e.message);
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
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 md:p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">
          {step === 'form' ? t('createWallet.title') : step === 'mnemonic' ? t('createWallet.backupMnemonic') : t('createWallet.verifyMnemonic')}
        </h2>

        {error && (
          <div className="flex items-center gap-2 p-2 mb-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        {step === 'form' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">{t('createWallet.name')}</label>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                placeholder={t('createWallet.namePlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">{t('createWallet.password')}</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                placeholder={t('createWallet.passwordPlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">{t('createWallet.confirmPassword')}</label>
              <input
                type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                placeholder={t('createWallet.confirmPasswordPlaceholder')}
              />
            </div>
            <button onClick={handleCreate} className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 rounded-lg text-sm font-medium transition-colors">
              {t('createWallet.create')}
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
            <div className="p-4 bg-gray-800 rounded-lg">
              <p className="text-sm font-mono leading-relaxed select-all">{mnemonic}</p>
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(mnemonic); setCopied(true); }}
              className="flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t('common.copied') : t('createWallet.copyMnemonic')}
            </button>
            <button onClick={handleConfirm} className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 rounded-lg text-sm font-medium transition-colors">
{t('createWallet.confirmCreate')}
            </button>
          </div>
        )}

        <button onClick={() => { reset(); onClose(); }} className="mt-3 w-full py-2 text-sm text-gray-500 hover:text-gray-300">
{t('common.cancel')}
        </button>
      </div>
    </div>
  );
}
