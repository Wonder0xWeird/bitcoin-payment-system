import * as bitcoin from 'bitcoinjs-lib';

// Bitcoin testnet network configuration
export const TESTNET = bitcoin.networks.testnet;

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

// Format BTC amount for display
export function formatBtc(amount: number, decimals: number = 8): string {
  return amount.toFixed(decimals).replace(/\.?0+$/, '');
}

// Create BIP21 payment URI
export function createPaymentUri(address: string, amount?: number, label?: string, message?: string): string {
  let uri = `bitcoin:${address}`;
  const params = new URLSearchParams();

  if (amount !== undefined && amount > 0) {
    params.set('amount', formatBtc(amount));
  }

  if (label) {
    params.set('label', label);
  }

  if (message) {
    params.set('message', message);
  }

  const queryString = params.toString();
  if (queryString) {
    uri += `?${queryString}`;
  }

  return uri;
}

// Validate Bitcoin address (basic validation)
export function isValidBitcoinAddress(address: string, network = TESTNET): boolean {
  try {
    bitcoin.address.toOutputScript(address, network);
    return true;
  } catch {
    return false;
  }
}

// Validate BTC amount
export function isValidBtcAmount(amount: number): boolean {
  return amount > 0 && amount <= 21000000 && Number.isFinite(amount);
}

// Generate a random label for payments
export function generatePaymentLabel(): string {
  const adjectives = ['Quick', 'Secure', 'Fast', 'Simple', 'Easy'];
  const nouns = ['Payment', 'Transfer', 'Transaction', 'Send'];
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${randomAdjective} ${randomNoun}`;
} 