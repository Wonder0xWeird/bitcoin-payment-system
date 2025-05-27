import * as bitcoin from 'bitcoinjs-lib';
import * as bip39 from 'bip39';
import BIP32Factory from 'bip32';
import * as ecc from 'tiny-secp256k1';
import { BIP32Interface } from 'bip32';
import { HDWallet } from '@/lib/types';
import { TESTNET, TESTNET_DERIVATION_PATH } from '@/lib/utils/bitcoin';

// Initialize BIP32 with elliptic curve implementation
const bip32 = BIP32Factory(ecc);

export class WalletService {
  private static instance: WalletService;

  public static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  /**
   * Generate a new HD wallet with mnemonic
   * @returns HDWallet object with mnemonic, address, and keys
   */
  public generateHDWallet(): HDWallet {
    try {
      // Generate 128-bit entropy for 12-word mnemonic
      const mnemonic = bip39.generateMnemonic(128);

      // Generate seed from mnemonic
      const seed = bip39.mnemonicToSeedSync(mnemonic);

      // Create master key from seed
      const masterKey = bip32.fromSeed(seed);

      // Derive key using BIP44 path for Bitcoin testnet
      const derivedKey = this.deriveKeyFromPath(masterKey, TESTNET_DERIVATION_PATH);

      // Generate address from derived key
      const address = this.generateAddressFromKey(derivedKey);

      return {
        mnemonic,
        address,
        privateKey: derivedKey.toWIF(),
        publicKey: Buffer.from(derivedKey.publicKey).toString('hex')
      };
    } catch (error) {
      console.error('Error generating HD wallet:', error);
      throw new Error('Failed to generate HD wallet');
    }
  }

  /**
   * Restore wallet from mnemonic
   * @param mnemonic - BIP39 mnemonic phrase
   * @returns HDWallet object
   */
  public restoreFromMnemonic(mnemonic: string): HDWallet {
    try {
      // Validate mnemonic
      if (!bip39.validateMnemonic(mnemonic)) {
        throw new Error('Invalid mnemonic phrase');
      }

      // Generate seed from mnemonic
      const seed = bip39.mnemonicToSeedSync(mnemonic);

      // Create master key from seed
      const masterKey = bip32.fromSeed(seed);

      // Derive key using BIP44 path
      const derivedKey = this.deriveKeyFromPath(masterKey, TESTNET_DERIVATION_PATH);

      // Generate address from derived key
      const address = this.generateAddressFromKey(derivedKey);

      return {
        mnemonic,
        address,
        privateKey: derivedKey.toWIF(),
        publicKey: Buffer.from(derivedKey.publicKey).toString('hex')
      };
    } catch (error) {
      console.error('Error restoring wallet from mnemonic:', error);
      throw new Error('Failed to restore wallet from mnemonic');
    }
  }

  /**
   * Derive key from BIP44 path
   * @param masterKey - Master key from seed
   * @param path - Derivation path (e.g., "m/44'/1'/0'/0/0")
   * @returns Derived BIP32 key
   */
  private deriveKeyFromPath(masterKey: BIP32Interface, path: string): BIP32Interface {
    try {
      return masterKey.derivePath(path);
    } catch (error) {
      console.error('Error deriving key from path:', error);
      throw new Error('Failed to derive key from path');
    }
  }

  /**
   * Generate Bitcoin address from key
   * Using P2WPKH (native SegWit, bech32) format for efficiency
   * @param key - BIP32 key
   * @returns Bitcoin address
   */
  private generateAddressFromKey(key: BIP32Interface): string {
    try {
      // Create P2WPKH (native SegWit) address
      const { address } = bitcoin.payments.p2wpkh({
        pubkey: Buffer.from(key.publicKey),
        network: TESTNET
      });

      if (!address) {
        throw new Error('Failed to generate address from key');
      }

      return address;
    } catch (error) {
      console.error('Error generating address from key:', error);
      throw new Error('Failed to generate address from key');
    }
  }

  /**
   * Validate a mnemonic phrase
   * @param mnemonic - BIP39 mnemonic phrase
   * @returns boolean indicating validity
   */
  public validateMnemonic(mnemonic: string): boolean {
    return bip39.validateMnemonic(mnemonic);
  }

  /**
   * Generate multiple addresses from the same wallet
   * @param mnemonic - BIP39 mnemonic phrase
   * @param count - Number of addresses to generate
   * @param startIndex - Starting index for address derivation
   * @returns Array of addresses
   */
  public generateMultipleAddresses(mnemonic: string, count: number = 5, startIndex: number = 0): string[] {
    try {
      const seed = bip39.mnemonicToSeedSync(mnemonic);
      const masterKey = bip32.fromSeed(seed);
      const addresses: string[] = [];

      for (let i = startIndex; i < startIndex + count; i++) {
        const path = `m/44'/1'/0'/0/${i}`;
        const derivedKey = this.deriveKeyFromPath(masterKey, path);
        const address = this.generateAddressFromKey(derivedKey);
        addresses.push(address);
      }

      return addresses;
    } catch (error) {
      console.error('Error generating multiple addresses:', error);
      throw new Error('Failed to generate multiple addresses');
    }
  }
} 