import { useSettingsStore } from '@/stores/settings.store';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LANGS = [
  { code: 'zh', label: '中文' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
];

export function LanguageSelector() {
  const language = useSettingsStore(s => s.language);
  const setLanguage = useSettingsStore(s => s.setLanguage);
  const { t } = useTranslation();

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">{t('settings.language')}</h2>
      </div>
      <div className="flex gap-2">
        {LANGS.map(({ code, label }) => (
          <button
            key={code}
            onClick={() => setLanguage(code)}
            className={`flex-1 py-2 text-sm rounded-lg transition-colors ${
              language === code
                ? 'bg-primary text-white'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
