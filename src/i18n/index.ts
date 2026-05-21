import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zh from './locales/zh.json';
import en from './locales/en.json';
import ja from './locales/ja.json';

const resources = { zh: { translation: zh }, en: { translation: en }, ja: { translation: ja } };

const fallbackLng = 'zh';

function detectLanguage(): string {
  const navLang = (navigator.language || '').toLowerCase();
  if (navLang.startsWith('ja')) return 'ja';
  if (navLang.startsWith('en')) return 'en';
  if (navLang.startsWith('zh')) return 'zh';
  return fallbackLng;
}

i18n.use(initReactI18next).init({
  resources,
  lng: detectLanguage(),
  fallbackLng,
  interpolation: { escapeValue: false },
});

export function changeLanguage(lng: string) {
  return i18n.changeLanguage(lng);
}

export default i18n;
