import type { ChatMessage } from '@/types/chat';
import { User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  message: ChatMessage;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="w-8 h-8 bg-brand-600/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
          <Bot className="w-4 h-4 text-brand-400" />
        </div>
      )}

      <div
        className={cn(
          'max-w-[85%] md:max-w-[75%] rounded-2xl px-3 md:px-4 py-2 md:py-2.5',
          isUser
            ? 'bg-brand-600 text-white rounded-br-md'
            : 'bg-gray-800 text-gray-200 rounded-bl-md'
        )}
      >
        <p className="text-xs md:text-sm whitespace-pre-wrap break-words">{message.content}</p>
        <p className="text-[10px] mt-1 opacity-50">
          {new Date(message.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {isUser && (
        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
          <User className="w-4 h-4 text-gray-400" />
        </div>
      )}
    </div>
  );
}
