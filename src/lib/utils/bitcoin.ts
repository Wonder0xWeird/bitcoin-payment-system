import * as bitcoin from 'bitcoinjs-lib';

// Bitcoin mainnet network configuration
export const MAINNET = bitcoin.networks.bitcoin;

// Bitcoin testnet network configuration
export const TESTNET = bitcoin.networks.testnet;

// BIP44 derivation path for Bitcoin mainnet
export const MAINNET_DERIVATION_PATH = "m/44'/0'/0'/0/0";

// BIP44 derivation path for Bitcoin testnet
export const TESTNET_DERIVATION_PATH = "m/44'/1'/0'/0/0";

// Satoshi conversion utilities
export const BTC_TO_SATOSHI = 100000000;

export function btcToSatoshi(btc: number): number {
  return Math.round(btc * BTC_TO_SATOSHI);
}

export function satoshiToBtc(satoshi: number): number {
  return satoshi / BTC_TO_SATOSHI;
}

export function formatBtc(amount: number, decimals: number = 8): string {
  return amount.toFixed(decimals).replace(/\.?0+$/, '');
}

export function isValidBitcoinAddress(address: string, network = TESTNET): boolean {
  try {
    bitcoin.address.toOutputScript(address, network);
    return true;
  } catch {
    return false;
  }
}

export function isValidBtcAmount(amount: number): boolean {
  return amount > 0 && amount <= 21000000 && Number.isFinite(amount);
}

// Generate a random label for payments for fun
export function generatePaymentLabel(): string {
  const adjectives = ['Quick', 'Secure', 'Fast', 'Simple', 'Easy'];
  const nouns = ['Payment', 'Transfer', 'Transaction', 'Send'];
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${randomAdjective} ${randomNoun}`;
} 