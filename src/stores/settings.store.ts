import { create } from 'zustand';
import { getSetting, setSetting } from '@/db/indexdb';
import { changeLanguage } from '@/i18n';

type NetworkMode = 'mainnet' | 'testnet';

interface SettingsState {
  openaiApiKey: string;
  aiProvider: 'openai' | 'custom';
  aiBaseUrl: string;
  aiModel: string;
  networkMode: NetworkMode;
  language: string;
  loaded: boolean;

  loadSettings: () => Promise<void>;
  setApiKey: (key: string) => Promise<void>;
  setProvider: (provider: 'openai' | 'custom') => Promise<void>;
  setBaseUrl: (url: string) => Promise<void>;
  setModel: (model: string) => Promise<void>;
  setNetworkMode: (mode: NetworkMode) => Promise<void>;
  setLanguage: (lang: string) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  openaiApiKey: '',
  aiProvider: 'openai',
  aiBaseUrl: 'https://api.openai.com/v1',
  aiModel: 'gpt-5.3-codex',
  networkMode: 'mainnet',
  language: 'zh',
  loaded: false,

  loadSettings: async () => {
    const key = await getSetting<string>('openaiApiKey') ?? '';
    const provider = await getSetting<'openai' | 'custom'>('aiProvider') ?? 'openai';
    const baseUrl = await getSetting<string>('aiBaseUrl') ?? 'https://api.openai.com/v1';
    const model = await getSetting<string>('aiModel') ?? 'gpt-5.3-codex';
    const networkMode = await getSetting<NetworkMode>('networkMode') ?? 'mainnet';
    const language = await getSetting<string>('language') ?? 'zh';
    set({ openaiApiKey: key, aiProvider: provider, aiBaseUrl: baseUrl, aiModel: model, networkMode, language, loaded: true });
  },

  setApiKey: async (key) => {
    await setSetting('openaiApiKey', key);
    set({ openaiApiKey: key });
  },

  setProvider: async (provider) => {
    await setSetting('aiProvider', provider);
    set({ aiProvider: provider });
  },

  setBaseUrl: async (url) => {
    await setSetting('aiBaseUrl', url);
    set({ aiBaseUrl: url });
  },

  setModel: async (model) => {
    await setSetting('aiModel', model);
    set({ aiModel: model });
  },

  setNetworkMode: async (mode) => {
    await setSetting('networkMode', mode);
    set({ networkMode: mode });
  },

  setLanguage: async (lang) => {
    await setSetting('language', lang);
    await changeLanguage(lang);
    set({ language: lang });
  },
}));

export type { NetworkMode };
