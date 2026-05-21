export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  pendingAction?: PendingAction;
}

export interface PendingAction {
  type: 'send_transfer' | 'save_contact';
  params: Record<string, string>;
  confirmed: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}
