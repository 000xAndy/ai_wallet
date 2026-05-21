import { validateMnemonic as bip39Validate } from 'bip39';
import { ethers } from 'ethers';
import {
  create_keystore,
  derive_accounts,
  export_mnemonic,
  cache_keystore,
  clear_cached_keystore,
} from '@consenlabs/tcx-wasm';
import { ensureTcxInit } from './tcx-init.service';
import { wrapKeystore, unwrapKeystore, encrypt, decrypt } from './encryption.service';
import { saveWallet, getAllWallets, getWallet, deleteWallet } from '@/db/indexdb';
import { generateId, now } from '@/lib/utils';
import { TCX_DERIVATION_PATH } from '@/lib/constants';
import type { StoredWallet, DerivedAddress, ChainType, NetworkType } from '@/types/wallet';

export async function createWallet(password: string, name: string, mnemonic: string): Promise<StoredWallet> {
  console.log('[createWallet] Starting keystore creation...');
  await ensureTcxInit();
  console.log('[createWallet] WASM initialized');

  let keystoreJson: string;
  try {
    keystoreJson = create_keystore(JSON.stringify({
      password,
      mnemonic,
      network: 'MAINNET',
    }));
    console.log('[createWallet] Keystore created, length:', keystoreJson.length);
  } catch (e: any) {
    console.error('[createWallet] create_keystore failed:', e);
    throw new Error(String(e?.message ?? e ?? 'Keystore creation failed'));
  }

  const { encryptedKeystore, iv, salt } = await wrapKeystore(keystoreJson, password);
  console.log('[createWallet] Keystore wrapped');

  let addresses: DerivedAddress[];
  try {
    addresses = deriveEvmAddresses(keystoreJson, password);
    console.log('[createWallet] Addresses derived:', addresses);
  } catch (e: any) {
    console.error('[createWallet] derive_accounts failed:', e);
    throw new Error(String(e?.message ?? e ?? 'Address derivation failed'));
  }

  const wallet: StoredWallet = {
    id: generateId(),
    name,
    walletType: 'keystore',
    encryptedKeystore,
    iv,
    salt,
    addresses,
    createdAt: now(),
  };

  await saveWallet(wallet);
  console.log('[createWallet] Wallet saved to IndexedDB:', wallet.id);
  return wallet;
}

export async function importWalletFromMnemonic(mnemonic: string, password: string, name: string): Promise<StoredWallet> {
  if (!bip39Validate(mnemonic)) {
    throw new Error('无效的助记词');
  }

  await ensureTcxInit();

  const keystoreJson = create_keystore(JSON.stringify({
    password,
    mnemonic,
    network: 'MAINNET',
  }));

  const { encryptedKeystore, iv, salt } = await wrapKeystore(keystoreJson, password);

  const addresses = deriveEvmAddresses(keystoreJson, password);

  const wallet: StoredWallet = {
    id: generateId(),
    name,
    walletType: 'keystore',
    encryptedKeystore,
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
  const { ciphertext: encryptedPrivateKey, iv, salt } = await encrypt(cleanKey, password);

  const address = wallet.address;
  const addresses: DerivedAddress[] = [
    { chain: 'bsc', network: 'mainnet', path: '', address },
    { chain: 'ethereum', network: 'mainnet', path: '', address },
    { chain: 'polygon', network: 'mainnet', path: '', address },
  ];

  const stored: StoredWallet = {
    id: generateId(),
    name,
    walletType: 'privateKey',
    encryptedPrivateKey,
    iv,
    salt,
    addresses,
    createdAt: now(),
  };

  await saveWallet(stored);
  return stored;
}

export async function unlockKeystore(
  id: string,
  password: string,
): Promise<{ wallet: StoredWallet; keystoreJson: string }> {
  const stored = await getWallet(id);
  if (!stored) throw new Error('钱包不存在');
  if (stored.walletType !== 'keystore' || !stored.encryptedKeystore) {
    throw new Error('该钱包不是 keystore 类型');
  }

  const keystoreJson = await unwrapKeystore(stored.encryptedKeystore, stored.iv, stored.salt, password);
  cache_keystore(keystoreJson);

  return { wallet: stored, keystoreJson };
}

export async function unlockPrivateKey(
  id: string,
  password: string,
): Promise<{ wallet: StoredWallet; privateKey: string }> {
  const stored = await getWallet(id);
  if (!stored) throw new Error('钱包不存在');
  if (stored.walletType !== 'privateKey' || !stored.encryptedPrivateKey) {
    throw new Error('该钱包不是私钥类型');
  }

  const privateKey = await decrypt(stored.encryptedPrivateKey, stored.iv, stored.salt, password);
  return { wallet: stored, privateKey };
}

export async function exportMnemonic(id: string, password: string): Promise<string> {
  await ensureTcxInit();

  const stored = await getWallet(id);
  if (!stored) throw new Error('钱包不存在');

  if (stored.walletType === 'keystore' && stored.encryptedKeystore) {
    const keystoreJson = await unwrapKeystore(stored.encryptedKeystore, stored.iv, stored.salt, password);
    const result = export_mnemonic(JSON.stringify({ keystoreJson, key: password }));
    const parsed = JSON.parse(result);
    return parsed.mnemonic;
  }

  throw new Error('该钱包没有助记词（由私钥导入）');
}

export async function exportPrivateKey(id: string, password: string): Promise<string> {
  const stored = await getWallet(id);
  if (!stored) throw new Error('钱包不存在');

  if (stored.walletType === 'privateKey' && stored.encryptedPrivateKey) {
    return decrypt(stored.encryptedPrivateKey, stored.iv, stored.salt, password);
  }

  throw new Error('Keystore 钱包不支持导出私钥，请导出助记词');
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

export async function getWalletForChain(id: string, _chain: ChainType, _network: NetworkType): Promise<{ address: string; privateKey: string }> {
  const stored = await getWallet(id);
  if (!stored) throw new Error('钱包不存在');

  const anyAddr = stored.addresses[0];
  return { address: anyAddr?.address ?? '', privateKey: '' };
}

function deriveEvmAddresses(keystoreJson: string, key: string): DerivedAddress[] {
  const result = derive_accounts(JSON.stringify({
    keystoreJson,
    key,
    derivations: [
      { chain: 'ETHEREUM', derivationPath: TCX_DERIVATION_PATH, chainId: '1', network: 'MAINNET' },
    ],
  }));
  const accounts: Array<{ chain: string; address: string | null }> = JSON.parse(result);
  const address = accounts[0]?.address ?? '';

  return [
    { chain: 'bsc', network: 'mainnet', path: TCX_DERIVATION_PATH, address },
    { chain: 'ethereum', network: 'mainnet', path: TCX_DERIVATION_PATH, address },
    { chain: 'polygon', network: 'mainnet', path: TCX_DERIVATION_PATH, address },
  ];
}
