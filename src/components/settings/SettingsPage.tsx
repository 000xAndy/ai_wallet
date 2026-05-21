import { ApiKeyConfig } from './ApiKeyConfig';
import { LanguageSelector } from './LanguageSelector';
import { useTranslation } from 'react-i18next';

export function SettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <h1 className="text-xl md:text-2xl font-bold mb-6">{t('settings.title')}</h1>
      <ApiKeyConfig />
      <div className="mt-6">
        <LanguageSelector />
      </div>
    </div>
  );
}
