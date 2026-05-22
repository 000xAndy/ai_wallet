import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/stores/settings.store';
import { useTranslation } from 'react-i18next';
import { Key, Check, Eye, EyeOff, Globe, Cpu } from 'lucide-react';

export function ApiKeyConfig() {
  const { t } = useTranslation();
  const { openaiApiKey, aiProvider, aiBaseUrl, aiModel, setApiKey, setProvider, setBaseUrl, setModel, loadSettings } = useSettingsStore();
  const [localKey, setLocalKey] = useState('');
  const [localUrl, setLocalUrl] = useState('');
  const [localModel, setLocalModel] = useState('');
  const [localProvider, setLocalProvider] = useState<'openai' | 'custom'>('openai');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings().then(() => {
      const s = useSettingsStore.getState();
      setLocalKey(s.openaiApiKey);
      setLocalUrl(s.aiBaseUrl);
      setLocalModel(s.aiModel);
      setLocalProvider(s.aiProvider);
    });
  }, [loadSettings]);

  const handleSave = async () => {
    await setApiKey(localKey);
    await setBaseUrl(localUrl);
    await setModel(localModel);
    await setProvider(localProvider);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-5">
        <Key className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">{t('settings.aiConfig')}</h2>
      </div>

      <p className="text-sm text-muted-foreground mb-5">{t('settings.aiConfigDesc')}</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-muted-foreground mb-1">{t('settings.aiProvider')}</label>
          <div className="flex gap-2">
            <button
              onClick={() => setLocalProvider('openai')}
              className={`flex-1 py-2 text-sm rounded-lg transition-colors ${localProvider === 'openai' ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'}`}
            >OpenAI</button>
            <button
              onClick={() => setLocalProvider('custom')}
              className={`flex-1 py-2 text-sm rounded-lg transition-colors ${localProvider === 'custom' ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'}`}
            >{t('settings.custom')}</button>
          </div>
        </div>

        <div>
          <label className="block text-sm text-muted-foreground mb-1">{t('settings.apiKey')}</label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={localKey}
              onChange={e => setLocalKey(e.target.value)}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:border-primary"
              placeholder="sk-..."
            />
            <button onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {localProvider === 'custom' && (
          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              <Globe className="w-3.5 h-3.5 inline mr-1" /> {t('settings.baseUrl')}
            </label>
            <input
              type="text"
              value={localUrl}
              onChange={e => setLocalUrl(e.target.value)}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              placeholder="https://api.openai.com/v1"
            />
          </div>
        )}

        <div>
          <label className="block text-sm text-muted-foreground mb-1">
            <Cpu className="w-3.5 h-3.5 inline mr-1" /> {t('settings.model')}
          </label>
          <select
            value={localModel}
            onChange={e => setLocalModel(e.target.value)}
            className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
          >
            <option value="gpt-5.4">GPT-5.4 (推荐)</option>
            <option value="gpt-4o-mini">GPT-4o Mini</option>
            <option value="gpt-4o">GPT-4o</option>
            <option value="gpt-4-turbo">GPT-4 Turbo</option>
            <option value="deepseek-v4-pro">DeepSeek V4 Pro</option>
            <option value="claude-sonnet-4-6">Claude Sonnet 4.6</option>
            <option value="claude-opus-4-7">Claude Opus 4.7</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover rounded-lg text-sm font-medium transition-colors"
        >
          {saved ? <Check className="w-4 h-4" /> : null}
          {saved ? t('settings.saved') : t('settings.saveConfig')}
        </button>

        {saved && (
          <p className="text-sm text-success">{t('settings.configSaved')}</p>
        )}
      </div>
    </div>
  );
}
