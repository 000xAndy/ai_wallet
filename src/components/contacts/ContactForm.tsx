import { useState } from 'react';
import { useContactStore } from '@/stores/contact.store';
import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export function ContactForm({ onClose }: Props) {
  const { t } = useTranslation();
  const addContact = useContactStore(s => s.addContact);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  const handleSave = async () => {
    setError('');
    if (!name.trim()) { setError(t('contacts.nameRequired')); return; }
    if (!/^0x[0-9a-fA-F]{40}$/.test(address.trim())) { setError(t('contacts.invalidAddress')); return; }

    try {
      await addContact(name.trim(), address.trim());
      onClose();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-card border border-border rounded-20 p-4 md:p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">{t('contacts.addContact')}</h2>

        {error && (
          <div className="flex items-center gap-2 p-2 mb-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-sm text-muted-foreground mb-1">{t('contacts.name')}</label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              placeholder="{t('contacts.namePlaceholder')}"
            />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">{t('contacts.address')}</label>
            <input
              type="text" value={address} onChange={e => setAddress(e.target.value)}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary"
              placeholder="0x..."
            />
          </div>
          <button onClick={handleSave} className="w-full py-2.5 bg-primary hover:bg-primary-hover rounded-lg text-sm font-medium transition-colors">
{t('common.save')}
          </button>
        </div>

        <button onClick={onClose} className="mt-3 w-full py-2 text-sm text-muted-foreground hover:text-foreground">
          {t('common.cancel')}
        </button>
      </div>
    </div>
  );
}
