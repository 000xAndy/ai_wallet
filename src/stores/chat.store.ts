import { create } from 'zustand';
import type { ChatMessage, ChatSession, PendingAction } from '@/types/chat';
import { generateId, now } from '@/lib/utils';
import { getAllChatSessions, saveChatSession, deleteChatSession } from '@/db/indexdb';

interface ChatState {
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  isStreaming: boolean;
  loaded: boolean;

  loadSessions: () => Promise<void>;
  newSession: () => void;
  switchSession: (id: string) => void;
  deleteSession: (id: string) => Promise<void>;
  addMessage: (role: 'user' | 'assistant', content: string, pendingAction?: PendingAction) => void;
  updateLastMessage: (content: string) => void;
  setStreaming: (v: boolean) => void;
  persistCurrent: () => void;
  confirmAction: (messageId: string) => void;
  clearPendingAction: (messageId: string) => void;
}

function persist(session: ChatSession) {
  saveChatSession(session).catch(console.error);
}

export const useChatStore = create<ChatState>((set, get) => ({
  currentSession: null,
  sessions: [],
  isStreaming: false,
  loaded: false,

  loadSessions: async () => {
    const sessions = await getAllChatSessions();
    sessions.sort((a, b) => b.updatedAt - a.updatedAt);
    set({ sessions, currentSession: sessions[0] ?? null, loaded: true });
  },

  newSession: () => {
    const session: ChatSession = {
      id: generateId(),
      title: '新对话',
      messages: [],
      createdAt: now(),
      updatedAt: now(),
    };
    persist(session);
    set(s => ({
      currentSession: session,
      sessions: [session, ...s.sessions],
    }));
  },

  switchSession: (id) => {
    const session = get().sessions.find(s => s.id === id);
    if (session) set({ currentSession: session });
  },

  deleteSession: async (id) => {
    await deleteChatSession(id);
    set(s => {
      const sessions = s.sessions.filter(sess => sess.id !== id);
      const currentSession = s.currentSession?.id === id
        ? (sessions[0] ?? null)
        : s.currentSession;
      return { sessions, currentSession };
    });
  },

  addMessage: (role, content, pendingAction) => {
    const session = get().currentSession;
    if (!session) return;

    const message: ChatMessage = {
      id: generateId(),
      role,
      content,
      timestamp: now(),
      pendingAction,
    };

    const updated: ChatSession = {
      ...session,
      messages: [...session.messages, message],
      updatedAt: now(),
      title: session.messages.length === 0 && role === 'user'
        ? content.slice(0, 30)
        : session.title,
    };

    persist(updated);
    set(s => ({
      currentSession: updated,
      sessions: s.sessions.map(sess => sess.id === updated.id ? updated : sess),
    }));
  },

  updateLastMessage: (content) => {
    const session = get().currentSession;
    if (!session || session.messages.length === 0) return;
    const messages = [...session.messages];
    messages[messages.length - 1] = { ...messages[messages.length - 1], content };
    const updated = { ...session, messages, updatedAt: now() };

    set(s => ({
      currentSession: updated,
      sessions: s.sessions.map(sess => sess.id === updated.id ? updated : sess),
    }));
  },

  setStreaming: (v) => set({ isStreaming: v }),

  persistCurrent: () => {
    const session = get().currentSession;
    if (session) persist(session);
  },

  confirmAction: (messageId) => {
    const session = get().currentSession;
    if (!session) return;
    const messages = session.messages.map(m =>
      m.id === messageId && m.pendingAction
        ? { ...m, pendingAction: { ...m.pendingAction, confirmed: true } }
        : m
    );
    const updated = { ...session, messages, updatedAt: now() };
    set(s => ({
      currentSession: updated,
      sessions: s.sessions.map(sess => sess.id === updated.id ? updated : sess),
    }));
  },

  clearPendingAction: (messageId) => {
    const session = get().currentSession;
    if (!session) return;
    const messages = session.messages.map(m =>
      m.id === messageId ? { ...m, pendingAction: undefined } : m
    );
    const updated = { ...session, messages, updatedAt: now() };
    set(s => ({
      currentSession: updated,
      sessions: s.sessions.map(sess => sess.id === updated.id ? updated : sess),
    }));
  },
}));
