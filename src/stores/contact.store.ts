import { create } from 'zustand';
import type { Contact } from '@/types/contact';
import * as db from '@/db/indexdb';
import { generateId, now } from '@/lib/utils';

interface ContactState {
  contacts: Contact[];
  loading: boolean;

  loadContacts: () => Promise<void>;
  addContact: (name: string, address: string, chain?: string, note?: string) => Promise<Contact>;
  removeContact: (id: string) => Promise<void>;
  updateContact: (id: string, updates: Partial<Pick<Contact, 'name' | 'address' | 'chain' | 'note'>>) => Promise<void>;
  findByName: (name: string) => Contact | undefined;
  findByAddress: (address: string) => Contact | undefined;
}

export const useContactStore = create<ContactState>((set, get) => ({
  contacts: [],
  loading: false,

  loadContacts: async () => {
    set({ loading: true });
    const contacts = await db.getAllContacts();
    set({ contacts, loading: false });
  },

  addContact: async (name, address, chain, note) => {
    const contact: Contact = { id: generateId(), name, address: address.toLowerCase(), chain, note, createdAt: now() };
    await db.saveContact(contact);
    set(s => ({ contacts: [...s.contacts, contact] }));
    return contact;
  },

  removeContact: async (id) => {
    await db.deleteContact(id);
    set(s => ({ contacts: s.contacts.filter(c => c.id !== id) }));
  },

  updateContact: async (id, updates) => {
    const existing = get().contacts.find(c => c.id === id);
    if (!existing) return;
    const updated = { ...existing, ...updates };
    await db.saveContact(updated);
    set(s => ({ contacts: s.contacts.map(c => c.id === id ? updated : c) }));
  },

  findByName: (name) => get().contacts.find(c => c.name === name),

  findByAddress: (address) => get().contacts.find(c => c.address === address.toLowerCase()),
}));
