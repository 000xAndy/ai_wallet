import { create } from 'zustand';
import type { StoredWallet, WalletBalance } from '@/types/wallet';
import * as walletService from '@/services/wallet.service';
import { getFullBalance } from '@/services/rpc.service';
import { DEFAULT_CHAIN } from '@/lib/constants';
import { getSetting, setSetting } from '@/db/indexdb';

interface WalletState {
  wallets: StoredWallet[];
  selectedWalletId: string | null;
  defaultWalletId: string | null;
  balances: Record<string, WalletBalance>;
  loading: boolean;
  error: string | null;

  loadWallets: () => Promise<void>;
  createWallet: (password: string, name: string, mnemonic: string) => Promise<StoredWallet>;
  importMnemonic: (mnemonic: string, password: string, name: string) => Promise<StoredWallet>;
  importPrivateKey: (pk: string, password: string, name: string) => Promise<StoredWallet>;
  removeWallet: (id: string) => Promise<void>;
  selectWallet: (id: string) => void;
  setDefaultWallet: (id: string) => Promise<void>;
  refreshBalance: (chainKey?: string) => Promise<void>;
  clearError: () => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  wallets: [],
  selectedWalletId: null,
  defaultWalletId: null,
  balances: {},
  loading: false,
  error: null,

  loadWallets: async () => {
    set({ loading: true });
    try {
      const wallets = await walletService.listWallets();
      const persistedDefault = await getSetting<string>('defaultWalletId');
      const defaultId = persistedDefault && wallets.some(w => w.id === persistedDefault)
        ? persistedDefault
        : wallets[0]?.id ?? null;
      const current = get().selectedWalletId;
      const selectedWalletId = current ?? defaultId;
      set({ wallets, selectedWalletId, defaultWalletId: defaultId, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  setDefaultWallet: async (id) => {
    await setSetting('defaultWalletId', id);
    set({ defaultWalletId: id });
  },

  createWallet: async (password, name, mnemonic) => {
    set({ loading: true, error: null });
    try {
      const wallet = await walletService.createWallet(password, name, mnemonic);
      set(s => ({ wallets: [...s.wallets, wallet], selectedWalletId: wallet.id, loading: false }));
      return wallet;
    } catch (e: any) {
      const msg = String(e?.message ?? e ?? 'Unknown error');
      console.error('[wallet.store] createWallet failed:', e);
      set({ error: msg, loading: false });
      throw e;
    }
  },

  importMnemonic: async (mnemonic, password, name) => {
    set({ loading: true, error: null });
    try {
      const wallet = await walletService.importWalletFromMnemonic(mnemonic, password, name);
      set(s => ({ wallets: [...s.wallets, wallet], selectedWalletId: wallet.id, loading: false }));
      return wallet;
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },

  importPrivateKey: async (pk, password, name) => {
    set({ loading: true, error: null });
    try {
      const wallet = await walletService.importWalletFromPrivateKey(pk, password, name);
      set(s => ({ wallets: [...s.wallets, wallet], selectedWalletId: wallet.id, loading: false }));
      return wallet;
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },

  removeWallet: async (id) => {
    await walletService.removeWallet(id);
    set(s => {
      const defaultWalletId = s.defaultWalletId === id ? null : s.defaultWalletId;
      if (s.defaultWalletId === id) setSetting('defaultWalletId', '').catch(() => {});
      return {
        wallets: s.wallets.filter(w => w.id !== id),
        selectedWalletId: s.selectedWalletId === id ? null : s.selectedWalletId,
        defaultWalletId,
      };
    });
  },

  selectWallet: (id) => set({ selectedWalletId: id }),

  refreshBalance: async (chainKey = DEFAULT_CHAIN) => {
    const { wallets, selectedWalletId } = get();
    const wallet = wallets.find(w => w.id === selectedWalletId);
    if (!wallet) return;

    try {
      const addr = wallet.addresses[0];
      if (!addr) return;
      const balance = await getFullBalance(addr.address, chainKey);
      set(s => ({ balances: { ...s.balances, [chainKey]: balance } }));
    } catch { /* RPC may be unavailable */ }
  },

  clearError: () => set({ error: null }),
}));
