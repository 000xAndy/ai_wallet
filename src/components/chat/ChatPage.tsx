import { useEffect, useState } from 'react';
import { useChatStore } from '@/stores/chat.store';
import { useSettingsStore } from '@/stores/settings.store';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { MessageCircle, Key, ArrowRight, Plus, Trash2, MessageSquare, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export function ChatPage() {
  const { t } = useTranslation();
  const {
    currentSession, sessions, loaded, newSession, switchSession, deleteSession,
  } = useChatStore();
  const openaiApiKey = useSettingsStore(s => s.openaiApiKey);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (loaded && !currentSession) newSession();
  }, [loaded, currentSession, newSession]);

  const sessionList = (
    <>
      <div className="p-3 border-b border-border flex items-center justify-between">
        <button
          onClick={() => { newSession(); setSidebarOpen(false); }}
          className="flex items-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary-hover rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> {t('chat.newChat')}
        </button>
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {sessions.map(s => (
          <div
            key={s.id}
            onClick={() => { switchSession(s.id); setSidebarOpen(false); }}
            className={cn(
              'group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors',
              s.id === currentSession?.id
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
            )}
          >
            <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="flex-1 truncate">{s.title}</span>
            <button
              onClick={e => { e.stopPropagation(); deleteSession(s.id); }}
              className="opacity-0 group-hover:opacity-100 p-0.5 text-text-tertiary hover:text-destructive transition-all"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
        {sessions.length === 0 && (
          <p className="text-xs text-text-tertiary text-center mt-4">{t('chat.noHistory')}</p>
        )}
      </div>
    </>
  );

  return (
    <div className="flex h-full">
      {/* Desktop session sidebar */}
      <div className="hidden md:flex flex-col w-52 border-r border-border bg-card/50">
        {sessionList}
      </div>

      {/* Mobile session overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 bg-card border-r border-border flex flex-col">
            {sessionList}
          </div>
        </div>
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-4 md:px-6 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 text-muted-foreground hover:text-foreground -ml-1"
            >
              <Menu className="w-5 h-5" />
            </button>
            <MessageCircle className="w-5 h-5 text-primary flex-shrink-0" />
            <h1 className="text-base md:text-lg font-semibold truncate">
              {currentSession?.title ?? t('chat.title')}
            </h1>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => newSession()}
              className="hidden md:block text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('chat.newChat')}
            </button>
          </div>
        </div>

        {/* Messages or Empty State */}
        {!currentSession || currentSession.messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            {!openaiApiKey ? (
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Key className="w-8 h-8 text-muted-foreground" />
                </div>
                <h2 className="text-lg font-medium text-muted-foreground mb-2">{t('chat.noApiKey')}</h2>
                <p className="text-sm text-text-tertiary mb-4">{t('chat.noApiKeyDesc')}</p>
                <button
                  onClick={() => navigate('/settings')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover rounded-lg text-sm font-medium transition-colors"
                >
                  {t('chat.goToSettings')} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <h2 className="text-lg font-medium text-muted-foreground mb-2">{t('chat.startChat')}</h2>
                <p className="text-sm text-text-tertiary">{t('chat.tryThese')}</p>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground max-w-lg mx-auto text-left">
                  {[
                    { icon: '💰', text: `"${t('chat.suggestions.balance')}"` },
                    { icon: '💸', text: `"${t('chat.suggestions.transfer')}"` },
                    { icon: '👤', text: `"${t('chat.suggestions.contact')}"` },
                    { icon: '📋', text: `"${t('chat.suggestions.history')}"` },
                    { icon: '⛽', text: `"${t('chat.suggestions.gas')}"` },
                    { icon: '🔍', text: `"${t('chat.suggestions.txStatus')}"` },
                    { icon: '🛡️', text: `"${t('chat.suggestions.approvals')}"` },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-lg">
                      <span className="text-sm flex-shrink-0">{icon}</span>
                      <span className="text-xs">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <ChatMessages messages={currentSession.messages} />
        )}

        {/* Input */}
        <div className="px-4 md:px-6 py-3 md:py-4 border-t border-border">
          <ChatInput disabled={!openaiApiKey} />
        </div>
      </div>
    </div>
  );
}
