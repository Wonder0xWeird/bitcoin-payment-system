import * as bitcoin from 'bitcoinjs-lib';
import * as bip39 from 'bip39';
import BIP32Factory, { BIP32API } from 'bip32';
import * as nobleSecp256k1 from '@noble/secp256k1';
import { BIP32Interface } from 'bip32';
import { HDWallet } from '@/lib/types';
import { TESTNET, TESTNET_DERIVATION_PATH } from '@/lib/utils/bitcoin';
import { HttpInternalServerError, HttpBadRequestError } from '@/lib/utils/http';
import { hmac } from '@noble/hashes/hmac';
import { sha256 } from '@noble/hashes/sha256';

// Enable synchronous methods for noble/secp256k1
nobleSecp256k1.etc.hmacSha256Sync = (k: Uint8Array, ...m: Uint8Array[]) =>
  hmac(sha256, k, nobleSecp256k1.etc.concatBytes(...m));

// Create adapter for @noble/secp256k1 to work with bip32
const ecc = {
  isPoint: (p: Uint8Array): boolean => {
    try {
      nobleSecp256k1.ProjectivePoint.fromHex(p);
      return true;
    } catch {
      return false;
    }
  },
  isPrivate: (d: Uint8Array): boolean => {
    try {
      return nobleSecp256k1.utils.isValidPrivateKey(d);
    } catch {
      return false;
    }
  },
  pointFromScalar: (d: Uint8Array, compressed?: boolean): Uint8Array | null => {
    try {
      return nobleSecp256k1.getPublicKey(d, compressed ?? true);
    } catch {
      return null;
    }
  },
  pointAddScalar: (p: Uint8Array, tweak: Uint8Array, compressed?: boolean): Uint8Array | null => {
    try {
      const point = nobleSecp256k1.ProjectivePoint.fromHex(p);
      const tweakPoint = nobleSecp256k1.ProjectivePoint.fromPrivateKey(tweak);
      return point.add(tweakPoint).toRawBytes(compressed ?? true);
    } catch {
      return null;
    }
  },
  privateAdd: (d: Uint8Array, tweak: Uint8Array): Uint8Array | null => {
    try {
      const privateKeyBigInt = nobleSecp256k1.etc.bytesToNumberBE(d);
      const tweakBigInt = nobleSecp256k1.etc.bytesToNumberBE(tweak);
      const result = (privateKeyBigInt + tweakBigInt) % nobleSecp256k1.CURVE.n;

      if (result === BigInt(0)) return null; // Invalid private key

      return nobleSecp256k1.etc.numberToBytesBE(result);
    } catch {
      return null;
    }
  },
  sign: (h: Uint8Array, d: Uint8Array, e?: Uint8Array): Uint8Array => {
    const sig = nobleSecp256k1.sign(h, d, { extraEntropy: e });
    return sig.toCompactRawBytes();
  },
  verify: (h: Uint8Array, Q: Uint8Array, signature: Uint8Array): boolean => {
    try {
      return nobleSecp256k1.verify(signature, h, Q);
    } catch {
      return false;
    }
  },
};

// Initialize BIP32 with elliptic curve implementation
const bip32: BIP32API = BIP32Factory(ecc);

export class WalletService {
  /**
   * Generate a new HD wallet with mnemonic
   * @returns HDWallet object with mnemonic, address, and keys
   */
  public static generateHDWallet(): HDWallet {
    try {
      // Generate 128-bit entropy for 12-word mnemonic
      const mnemonic = bip39.generateMnemonic(128);

      // Generate seed from mnemonic
      const seed = bip39.mnemonicToSeedSync(mnemonic);

      // Create master key from seed
      const masterKey = bip32.fromSeed(seed);

      // Derive key using BIP44 path for Bitcoin testnet
      const derivedKey = WalletService.deriveKeyFromPath(masterKey, TESTNET_DERIVATION_PATH);

      // Generate address from derived key
      const address = WalletService.generateAddressFromKey(derivedKey);

      return {
        mnemonic,
        address,
        privateKey: derivedKey.toWIF(),
        publicKey: Buffer.from(derivedKey.publicKey).toString('hex')
      };
    } catch (error) {
      console.error('Error generating HD wallet:', error);
      throw new HttpInternalServerError('Failed to generate HD wallet');
    }
  }

  /**
   * Restore wallet from mnemonic
   * @param mnemonic - BIP39 mnemonic phrase
   * @returns HDWallet object
   */
  public static restoreFromMnemonic(mnemonic: string): HDWallet {
    try {
      // Validate mnemonic
      if (!bip39.validateMnemonic(mnemonic)) {
        throw new HttpBadRequestError('Invalid mnemonic phrase');
      }

      // Generate seed from mnemonic
      const seed = bip39.mnemonicToSeedSync(mnemonic);

      // Create master key from seed
      const masterKey = bip32.fromSeed(seed);

      // Derive key using BIP44 path
      const derivedKey = WalletService.deriveKeyFromPath(masterKey, TESTNET_DERIVATION_PATH);

      // Generate address from derived key
      const address = WalletService.generateAddressFromKey(derivedKey);

      return {
        mnemonic,
        address,
        privateKey: derivedKey.toWIF(),
        publicKey: Buffer.from(derivedKey.publicKey).toString('hex')
      };
    } catch (error) {
      console.error('Error restoring wallet from mnemonic:', error);
      throw new HttpInternalServerError('Failed to restore wallet from mnemonic');
    }
  }

  /**
   * Derive key from BIP44 path
   * @param masterKey - Master key from seed
   * @param path - Derivation path (e.g., "m/44'/1'/0'/0/0")
   * @returns Derived BIP32 key
   */
  private static deriveKeyFromPath(masterKey: BIP32Interface, path: string): BIP32Interface {
    try {
      return masterKey.derivePath(path);
    } catch (error) {
      console.error('Error deriving key from path:', error);
      throw new HttpInternalServerError('Failed to derive key from path');
    }
  }

  /**
   * Generate Bitcoin address from key
   * Using P2WPKH (native SegWit, bech32) format for efficiency
   * @param key - BIP32 key
   * @returns Bitcoin address
   */
  private static generateAddressFromKey(key: BIP32Interface): string {
    try {
      // Create P2WPKH (native SegWit) address
      const { address } = bitcoin.payments.p2wpkh({
        pubkey: Buffer.from(key.publicKey),
        network: TESTNET
      });

      if (!address) {
        throw new HttpInternalServerError('Failed to generate address from key');
      }

      return address;
    } catch (error) {
      console.error('Error generating address from key:', error);
      throw new HttpInternalServerError('Failed to generate address from key');
    }
  }

  /**
   * Validate a mnemonic phrase
   * @param mnemonic - BIP39 mnemonic phrase
   * @returns boolean indicating validity
   */
  public static validateMnemonic(mnemonic: string): boolean {
    return bip39.validateMnemonic(mnemonic);
  }

  /**
   * Generate multiple addresses from the same wallet
   * @param mnemonic - BIP39 mnemonic phrase
   * @param count - Number of addresses to generate
   * @param startIndex - Starting index for address derivation
   * @returns Array of addresses
   */
  public static generateMultipleAddresses(mnemonic: string, count: number = 5, startIndex: number = 0): string[] {
    try {
      const seed = bip39.mnemonicToSeedSync(mnemonic);
      const masterKey = bip32.fromSeed(seed);
      const addresses: string[] = [];

      for (let i = startIndex; i < startIndex + count; i++) {
        const path = `m/44'/1'/0'/0/${i}`;
        const derivedKey = WalletService.deriveKeyFromPath(masterKey, path);
        const address = WalletService.generateAddressFromKey(derivedKey);
        addresses.push(address);
      }

      return addresses;
    } catch (error) {
      console.error('Error generating multiple addresses:', error);
      throw new HttpInternalServerError('Failed to generate multiple addresses');
    }
  }
}