import * as bip39 from 'bip39';
import { ethers } from 'ethers';
import { encrypt, decrypt } from './encryption.service';
import { saveWallet, getAllWallets, getWallet, deleteWallet } from '@/db/indexdb';
import { generateId, now } from '@/lib/utils';
import type { StoredWallet, DerivedAddress, ChainType, NetworkType } from '@/types/wallet';
import { DEFAULT_CHAIN } from '@/lib/constants';

export async function createWallet(password: string, name: string): Promise<StoredWallet> {
  const mnemonic = bip39.generateMnemonic(256);
  return importWalletFromMnemonic(mnemonic, password, name);
}

export async function importWalletFromMnemonic(mnemonic: string, password: string, name: string): Promise<StoredWallet> {
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error('无效的助记词');
  }

  const hdNode = ethers.HDNodeWallet.fromPhrase(mnemonic);
  const privateKey = hdNode.privateKey;

  const { ciphertext: encryptedMnemonic, iv: iv, salt } = await encrypt(mnemonic, password);
  const { ciphertext: encryptedPrivateKey } = await encrypt(privateKey, password, salt, iv);

  const addresses: DerivedAddress[] = [
    { chain: 'bsc', network: 'mainnet', path: "m/44'/60'/0'/0/0", address: deriveAddressFromPK(privateKey, 56) },
    { chain: 'ethereum', network: 'mainnet', path: "m/44'/60'/0'/0/0", address: deriveAddressFromPK(privateKey, 1) },
    { chain: 'polygon', network: 'mainnet', path: "m/44'/60'/0'/0/0", address: deriveAddressFromPK(privateKey, 137) },
  ];

  const wallet: StoredWallet = {
    id: generateId(),
    name,
    encryptedMnemonic,
    encryptedPrivateKey,
    iv,
    salt,
    addresses,
    createdAt: now(),
  };

  await saveWallet(wallet);
  return wallet;
}

export async function importWalletFromPrivateKey(privateKey: string, password: string, name: string): Promise<StoredWallet> {
  const cleanKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
  if (!/^[0-9a-fA-F]{64}$/.test(cleanKey)) {
    throw new Error('无效的私钥格式');
  }

  const wallet = new ethers.Wallet(cleanKey);
  const { ciphertext: encryptedMnemonic, iv, salt } = await encrypt('', password);
  const { ciphertext: encryptedPrivateKey } = await encrypt(cleanKey, password, salt, iv);

  const addresses: DerivedAddress[] = [
    { chain: 'bsc', network: 'mainnet', path: '', address: deriveAddressFromPK(cleanKey, 56) },
    { chain: 'ethereum', network: 'mainnet', path: '', address: deriveAddressFromPK(cleanKey, 1) },
    { chain: 'polygon', network: 'mainnet', path: '', address: deriveAddressFromPK(cleanKey, 137) },
  ];

  const stored: StoredWallet = {
    id: generateId(),
    name,
    encryptedMnemonic,
    encryptedPrivateKey,
    iv,
    salt,
    addresses,
    createdAt: now(),
  };

  await saveWallet(stored);
  return stored;
}

export async function unlockWallet(id: string, password: string): Promise<{ wallet: StoredWallet; privateKey: string; mnemonic: string }> {
  const stored = await getWallet(id);
  if (!stored) throw new Error('钱包不存在');

  const privateKey = await decrypt(stored.encryptedPrivateKey, stored.iv, stored.salt, password);
  let mnemonic = '';
  if (stored.encryptedMnemonic) {
    try { mnemonic = await decrypt(stored.encryptedMnemonic, stored.iv, stored.salt, password); } catch { /* no mnemonic */ }
  }

  return { wallet: stored, privateKey, mnemonic };
}

export async function exportPrivateKey(id: string, password: string): Promise<string> {
  const { privateKey } = await unlockWallet(id, password);
  return privateKey;
}

export async function exportMnemonic(id: string, password: string): Promise<string> {
  const { mnemonic } = await unlockWallet(id, password);
  if (!mnemonic) throw new Error('该钱包没有助记词（由私钥导入）');
  return mnemonic;
}

export async function listWallets(): Promise<StoredWallet[]> {
  return getAllWallets();
}

export async function removeWallet(id: string): Promise<void> {
  await deleteWallet(id);
}

export function getSigner(privateKey: string, rpcUrl: string): ethers.Wallet {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  return new ethers.Wallet(privateKey, provider);
}

function deriveAddressFromPK(privateKey: string, chainId: number): string {
  return new ethers.Wallet(privateKey).address;
}

export async function getWalletForChain(id: string, chain: ChainType, network: NetworkType): Promise<{ address: string; privateKey: string }> {
  const stored = await getWallet(id);
  if (!stored) throw new Error('钱包不存在');

  const addr = stored.addresses.find(a => a.chain === chain && a.network === network);
  // EVM chains share the same address, so use the first one
  const anyAddr = stored.addresses[0];
  return { address: anyAddr?.address ?? '', privateKey: '' };
}
