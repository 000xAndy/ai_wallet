import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { WalletDashboard } from '@/components/wallet/WalletDashboard';
import { ChatPage } from '@/components/chat/ChatPage';
import { SettingsPage } from '@/components/settings/SettingsPage';
import { ContactList } from '@/components/contacts/ContactList';
import { useWalletStore } from '@/stores/wallet.store';
import { useSettingsStore } from '@/stores/settings.store';
import { useContactStore } from '@/stores/contact.store';
import { useChatStore } from '@/stores/chat.store';
import { changeLanguage } from '@/i18n';

export default function App() {
  const loadWallets = useWalletStore(s => s.loadWallets);
  const loadSettings = useSettingsStore(s => s.loadSettings);
  const loadContacts = useContactStore(s => s.loadContacts);
  const loadSessions = useChatStore(s => s.loadSessions);

  useEffect(() => {
    loadWallets();
    loadSettings().then(() => {
      const lang = useSettingsStore.getState().language;
      if (lang) changeLanguage(lang);
    });
    loadContacts();
    loadSessions();
  }, [loadWallets, loadSettings, loadContacts, loadSessions]);

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/wallet" replace />} />
        <Route path="/wallet" element={<WalletDashboard />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/contacts" element={<ContactList />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </AppLayout>
  );
}
