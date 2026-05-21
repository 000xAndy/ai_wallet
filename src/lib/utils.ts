import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function formatBalance(balance: string, decimals: number): string {
  const num = Number(balance) / 10 ** decimals;
  if (num < 0.0001 && num > 0) return '<0.0001';
  if (num > 1_000_000) return num.toFixed(2);
  if (num > 1) return num.toFixed(4);
  return num.toFixed(6);
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function now(): number {
  return Date.now();
}
