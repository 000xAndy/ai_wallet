import { ENCRYPTION } from '@/lib/constants';

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf as ArrayBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function fromHex(hex: string): Uint8Array {
  const bytes = hex.match(/.{1,2}/g) ?? [];
  return new Uint8Array(bytes.map(b => parseInt(b, 16)));
}

function textToBytes(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

function bytesToText(bytes: ArrayBuffer): string {
  return new TextDecoder().decode(bytes);
}

export async function deriveKey(password: string, saltHex: string): Promise<CryptoKey> {
  const salt = fromHex(saltHex);
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    textToBytes(password) as BufferSource,
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: ENCRYPTION.PBKDF2_ITERATIONS, hash: ENCRYPTION.HASH },
    keyMaterial,
    { name: ENCRYPTION.ALGORITHM, length: ENCRYPTION.KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encrypt(plaintext: string, password: string, existingSalt?: string, existingIv?: string): Promise<{ ciphertext: string; iv: string; salt: string }> {
  let saltHex: string;
  if (existingSalt) {
    saltHex = existingSalt;
  } else {
    const salt = new Uint8Array(16);
    crypto.getRandomValues(salt);
    saltHex = toHex(salt.buffer as ArrayBuffer);
  }
  const key = await deriveKey(password, saltHex);
  let iv: Uint8Array;
  if (existingIv) {
    iv = fromHex(existingIv);
  } else {
    iv = new Uint8Array(12);
    crypto.getRandomValues(iv);
  }

  const ciphertext = await crypto.subtle.encrypt(
    { name: ENCRYPTION.ALGORITHM, iv: iv as BufferSource },
    key,
    textToBytes(plaintext) as BufferSource
  );

  return { ciphertext: toHex(ciphertext), iv: toHex(iv.buffer as ArrayBuffer), salt: saltHex };
}

export async function decrypt(ciphertextHex: string, ivHex: string, saltHex: string, password: string): Promise<string> {
  const key = await deriveKey(password, saltHex);
  const ciphertext = fromHex(ciphertextHex);
  const iv = fromHex(ivHex);

  const plaintext = await crypto.subtle.decrypt(
    { name: ENCRYPTION.ALGORITHM, iv: iv as BufferSource },
    key,
    ciphertext as BufferSource
  );

  return bytesToText(plaintext);
}

export function generateSalt(): string {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  return toHex(salt.buffer as ArrayBuffer);
}
