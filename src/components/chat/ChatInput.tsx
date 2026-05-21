import { useState, useRef, useEffect, useCallback } from 'react';
import { useChatStore } from '@/stores/chat.store';
import { useWalletStore } from '@/stores/wallet.store';
import { useContactStore } from '@/stores/contact.store';
import { streamChat } from '@/services/ai-agent.service';
import { useTranslation } from 'react-i18next';
import { Send, Loader2 } from 'lucide-react';
import { TransferConfirmDialog } from './TransferConfirmDialog';

interface Props {
  disabled?: boolean;
}

export function ChatInput({ disabled }: Props) {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingTransfer, setPendingTransfer] = useState<{ messageId: string; params: Record<string, string> } | null>(null);
  const { addMessage, updateLastMessage, persistCurrent, isStreaming, setStreaming, currentSession } = useChatStore();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!loading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || loading || isStreaming || disabled) return;

    const userMsg = input.trim();
    setInput('');
    setLoading(true);
    setStreaming(true);
    addMessage('user', userMsg);
    addMessage('assistant', '');

    let fullText = '';
    let pending: { to: string; amount: string; token?: string; network?: string } | null = null;
    try {
      for await (const chunk of streamChat(userMsg)) {
        fullText = chunk.text;
        updateLastMessage(fullText);
        const pt = (chunk as any).pendingTransfer;
        if (pt) {
          pending = pt;
        }
      }
      if (!fullText) {
        updateLastMessage(t('chat.unableToProcess'));
      }
      if (pending) {
        setPendingTransfer({
          messageId: '',
          params: {
            to: pending.to,
            amount: pending.amount,
            token: pending.token || 'BNB',
            network: pending.network || 'BSC',
          },
        });
      }
    } catch (e: any) {
      updateLastMessage(`${t('common.error')}: ${e.message}`);
    } finally {
      setLoading(false);
      setStreaming(false);
      persistCurrent();
    }
  }, [input, loading, isStreaming, disabled, addMessage, updateLastMessage, setStreaming, persistCurrent]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || loading}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 resize-none"
          placeholder={disabled ? t('chat.inputDisabled') : t('chat.inputPlaceholder')}
          rows={1}
        />
        <button
          onClick={handleSend}
          disabled={disabled || loading || !input.trim()}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>

      {pendingTransfer && (
        <TransferConfirmDialog
          params={pendingTransfer.params}
          onConfirm={(password) => {
            // Transfer execution handled by dialog
            setPendingTransfer(null);
          }}
          onCancel={() => setPendingTransfer(null)}
        />
      )}
    </>
  );
}
