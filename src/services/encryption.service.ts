import { ENCRYPTION } from '@/lib/constants';

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function fromHex(hex: string): Uint8Array<ArrayBuffer> {
  const bytes = hex.match(/.{1,2}/g) ?? [];
  return new Uint8Array(bytes.map(b => parseInt(b, 16))) as Uint8Array<ArrayBuffer>;
}

function textToBytes(text: string): Uint8Array<ArrayBuffer> {
  return new TextEncoder().encode(text) as Uint8Array<ArrayBuffer>;
}

function bytesToText(bytes: ArrayBuffer): string {
  return new TextDecoder().decode(bytes);
}

async function deriveKey(password: string, saltHex: string): Promise<CryptoKey> {
  const salt = fromHex(saltHex);
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    textToBytes(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ENCRYPTION.PBKDF2_ITERATIONS, hash: ENCRYPTION.HASH },
    keyMaterial,
    { name: ENCRYPTION.ALGORITHM, length: ENCRYPTION.KEY_LENGTH },
    false,
    ['encrypt', 'decrypt'],
  );
}

async function aesEncrypt(plaintext: string, key: CryptoKey, iv: Uint8Array<ArrayBuffer>): Promise<string> {
  const ciphertext = await crypto.subtle.encrypt(
    { name: ENCRYPTION.ALGORITHM, iv },
    key,
    textToBytes(plaintext),
  );
  return toHex(ciphertext);
}

async function aesDecrypt(ciphertextHex: string, ivHex: string, key: CryptoKey): Promise<string> {
  const ciphertext = fromHex(ciphertextHex);
  const iv = fromHex(ivHex);
  const plaintext = await crypto.subtle.decrypt(
    { name: ENCRYPTION.ALGORITHM, iv },
    key,
    ciphertext,
  );
  return bytesToText(plaintext);
}

/**
 * Wrap a tcx-wasm keystore JSON with an outer AES-GCM layer for IndexedDB storage.
 */
export async function wrapKeystore(
  keystoreJson: string,
  password: string,
): Promise<{ encryptedKeystore: string; iv: string; salt: string }> {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const saltHex = toHex(salt.buffer as ArrayBuffer);

  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);
  const ivHex = toHex(iv.buffer as ArrayBuffer);

  const key = await deriveKey(password, saltHex);
  const encryptedKeystore = await aesEncrypt(keystoreJson, key, iv as Uint8Array<ArrayBuffer>);

  return { encryptedKeystore, iv: ivHex, salt: saltHex };
}

/**
 * Unwrap the outer AES-GCM layer and return the tcx-wasm keystore JSON.
 */
export async function unwrapKeystore(
  encryptedKeystore: string,
  ivHex: string,
  saltHex: string,
  password: string,
): Promise<string> {
  const key = await deriveKey(password, saltHex);
  return aesDecrypt(encryptedKeystore, ivHex, key);
}

// Legacy functions for private-key wallets.

export async function encrypt(
  plaintext: string,
  password: string,
  existingSalt?: string,
  existingIv?: string,
): Promise<{ ciphertext: string; iv: string; salt: string }> {
  let saltHex: string;
  if (existingSalt) {
    saltHex = existingSalt;
  } else {
    const salt = new Uint8Array(16);
    crypto.getRandomValues(salt);
    saltHex = toHex(salt.buffer as ArrayBuffer);
  }
  const key = await deriveKey(password, saltHex);
  let iv: Uint8Array<ArrayBuffer>;
  if (existingIv) {
    iv = fromHex(existingIv);
  } else {
    const ivRaw = new Uint8Array(12);
    crypto.getRandomValues(ivRaw);
    iv = ivRaw as Uint8Array<ArrayBuffer>;
  }

  const ciphertext = await aesEncrypt(plaintext, key, iv);
  return { ciphertext, iv: toHex(iv.buffer as ArrayBuffer), salt: saltHex };
}

export async function decrypt(
  ciphertextHex: string,
  ivHex: string,
  saltHex: string,
  password: string,
): Promise<string> {
  const key = await deriveKey(password, saltHex);
  return aesDecrypt(ciphertextHex, ivHex, key);
}

export function generateSalt(): string {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  return toHex(salt.buffer as ArrayBuffer);
}
