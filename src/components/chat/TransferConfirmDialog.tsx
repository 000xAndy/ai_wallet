import { useState } from 'react';
import { executeTransfer } from '@/services/ai-agent.service';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Check, Loader2 } from 'lucide-react';

interface Props {
  params: Record<string, string>;
  onConfirm: (password: string) => void;
  onCancel: () => void;
}

export function TransferConfirmDialog({ params, onConfirm, onCancel }: Props) {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setError('');
    setLoading(true);
    try {
      const hash = await executeTransfer(
        { type: 'send_transfer', params, confirmed: true },
        password
      );
      setTxHash(hash);
    } catch (e: any) {
      setError(e.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-card border border-border rounded-20 p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">
          {txHash ? t('transfer.sentTitle') : t('transfer.confirmTitle')}
        </h2>

        {error && (
          <div className="flex items-center gap-2 p-2 mb-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        {txHash ? (
          <div className="space-y-3">
            <div className="p-3 bg-success-surface border border-success-border rounded-lg">
              <Check className="w-5 h-5 text-success mb-1" />
              <p className="text-sm text-success">{t('transfer.sentDesc')}</p>
            </div>
            <div className="p-3 bg-secondary rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">{t('transfer.txHash')}</p>
              <p className="text-xs font-mono break-all text-foreground">{txHash}</p>
            </div>
            <button onClick={onCancel} className="w-full py-2.5 bg-muted rounded-lg text-sm">
              {t('common.close')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-secondary rounded-lg space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('transfer.recipient')}</span>
                <span className="font-mono text-xs">{params.to}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('transfer.amount')}</span>
                <span>{params.amount} {params.token || 'BNB'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('transfer.network')}</span>
                <span>{params.network || 'BSC'}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-1">{t('transfer.enterPassword')}</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                onKeyDown={e => e.key === 'Enter' && handleConfirm()}
              />
            </div>

            <div className="flex gap-2">
              <button onClick={onCancel} className="flex-1 py-2.5 bg-secondary rounded-lg text-sm">
                {t('common.cancel')}
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading || !password}
                className="flex-1 py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {t('transfer.confirmTransfer')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
