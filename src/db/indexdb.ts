import { openDB, type IDBPDatabase } from 'idb';
import type { StoredWallet } from '@/types/wallet';
import type { Contact } from '@/types/contact';
import type { ChatSession } from '@/types/chat';

const DB_NAME = 'ai-wallet';
const DB_VERSION = 1;

interface AiWalletDB {
  wallets: StoredWallet;
  contacts: Contact;
  settings: { key: string; value: unknown };
  chatSessions: ChatSession;
}

let dbInstance: IDBPDatabase<AiWalletDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<AiWalletDB>> {
  if (dbInstance) return dbInstance;
  dbInstance = await openDB<AiWalletDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('wallets')) {
        db.createObjectStore('wallets', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('contacts')) {
        db.createObjectStore('contacts', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('chatSessions')) {
        db.createObjectStore('chatSessions', { keyPath: 'id' });
      }
    },
  });
  return dbInstance;
}

// Wallet helpers
export async function getAllWallets(): Promise<StoredWallet[]> {
  const db = await getDB();
  return db.getAll('wallets');
}

export async function getWallet(id: string): Promise<StoredWallet | undefined> {
  const db = await getDB();
  return db.get('wallets', id);
}

export async function saveWallet(wallet: StoredWallet): Promise<void> {
  const db = await getDB();
  await db.put('wallets', wallet);
}

export async function deleteWallet(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('wallets', id);
}

// Contact helpers
export async function getAllContacts(): Promise<Contact[]> {
  const db = await getDB();
  return db.getAll('contacts');
}

export async function saveContact(contact: Contact): Promise<void> {
  const db = await getDB();
  await db.put('contacts', contact);
}

export async function deleteContact(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('contacts', id);
}

// Settings helpers
export async function getSetting<T>(key: string): Promise<T | undefined> {
  const db = await getDB();
  const record = await db.get('settings', key);
  return record?.value as T | undefined;
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  const db = await getDB();
  await db.put('settings', { key, value });
}

// Chat session helpers
export async function getAllChatSessions(): Promise<ChatSession[]> {
  const db = await getDB();
  return db.getAll('chatSessions');
}

export async function getChatSession(id: string): Promise<ChatSession | undefined> {
  const db = await getDB();
  return db.get('chatSessions', id);
}

export async function saveChatSession(session: ChatSession): Promise<void> {
  const db = await getDB();
  await db.put('chatSessions', session);
}

export async function deleteChatSession(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('chatSessions', id);
}
