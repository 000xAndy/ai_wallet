import { useState } from 'react';
import { useContactStore } from '@/stores/contact.store';
import { ContactForm } from './ContactForm';
import { shortenAddress } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { User, Plus, Trash2, Copy, Check } from 'lucide-react';

export function ContactList() {
  const { t } = useTranslation();
  const { contacts, removeContact } = useContactStore();
  const [showForm, setShowForm] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold">{t('contacts.title')}</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary-hover rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">{t('contacts.addContact')}</span>
        </button>
      </div>

      {contacts.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-medium text-muted-foreground mb-2">{t('contacts.noContacts')}</h2>
          <p className="text-sm text-text-tertiary">{t('contacts.noContactsDesc')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {contacts.map(c => (
            <div key={c.id} className="flex items-center justify-between p-3 md:p-4 bg-card border border-border rounded-xl">
              <div className="min-w-0">
                <div className="font-medium text-sm md:text-base truncate">{c.name}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground font-mono">{shortenAddress(c.address)}</span>
                  <button
                    onClick={() => { navigator.clipboard.writeText(c.address); setCopied(c.id); setTimeout(() => setCopied(null), 2000); }}
                    className="text-text-tertiary hover:text-muted-foreground"
                  >
                    {copied === c.id ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                {c.chain && <span className="text-xs text-text-tertiary">{c.chain}</span>}
              </div>
              <button
                onClick={() => { if (confirm(t('contacts.deleteConfirm'))) removeContact(c.id); }}
                className="p-2 text-text-tertiary hover:text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && <ContactForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
