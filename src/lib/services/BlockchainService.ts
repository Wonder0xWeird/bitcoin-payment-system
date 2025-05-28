import {
  UTXO,
  TransactionInfo,
  AddressInfo,
  MempoolTransaction,
  MempoolTXInput,
  MempoolTXOutput,
  MempoolUTXO,
  PaymentRequest,
  PaymentReceipt
} from '@/lib/types';
import { satoshiToBtc } from '@/lib/utils/bitcoin';
import { MempoolHttpService } from './MempoolHttpService';

export class BlockchainService {
  /**
   * Get address information including balance and transaction count
   * @param address - Bitcoin address
   * @returns Address information
   */
  public static async getAddressInfo(address: string): Promise<AddressInfo> {
    return MempoolHttpService.getAddressInfo(address);
  }

  /**
   * Get UTXOs for a specific address
   * @param address - Bitcoin address
   * @returns Array of UTXOs
   */
  public static async getAddressUTXOs(address: string): Promise<UTXO[]> {
    const response = await MempoolHttpService.getAddressUTXOs(address);
    return response.map((utxo: MempoolUTXO) => ({
      txid: utxo.txid,
      vout: utxo.vout,
      status: {
        confirmed: utxo.status.confirmed,
        block_height: utxo.status.block_height,
        block_hash: utxo.status.block_hash,
        block_time: utxo.status.block_time
      },
      value: utxo.value
    }));
  }

  /**
   * Get transactions for a specific address
   * @param address - Bitcoin address
   * @returns Array of transactions
   */
  public static async getAddressTransactions(address: string): Promise<TransactionInfo[]> {
    const response: MempoolTransaction[] = await MempoolHttpService.getAddressTransactions(address);
    return response.map((tx: MempoolTransaction) => ({
      txid: tx.txid,
      vin: tx.vin.map((input: MempoolTXInput) => ({
        txid: input.txid,
        vout: input.vout,
        prevout: {
          scriptpubkey: input.prevout.scriptpubkey,
          scriptpubkey_asm: input.prevout.scriptpubkey_asm,
          scriptpubkey_type: input.prevout.scriptpubkey_type,
          scriptpubkey_address: input.prevout.scriptpubkey_address,
          value: input.prevout.value
        }
      })),
      vout: tx.vout.map((output: MempoolTXOutput) => ({
        scriptpubkey: output.scriptpubkey,
        scriptpubkey_asm: output.scriptpubkey_asm,
        scriptpubkey_type: output.scriptpubkey_type,
        scriptpubkey_address: output.scriptpubkey_address,
        value: output.value
      })),
      status: tx.status
    }));
  }

  /**
   * Get specific transaction information
   * @param txid - Transaction ID
   * @returns Transaction information
   */
  public static async getTransaction(txid: string): Promise<TransactionInfo> {
    const response: MempoolTransaction = await MempoolHttpService.getTransaction(txid);
    return {
      txid: response.txid,
      vin: response.vin.map((input: MempoolTXInput) => ({
        txid: input.txid,
        vout: input.vout,
        prevout: {
          scriptpubkey: input.prevout.scriptpubkey,
          scriptpubkey_asm: input.prevout.scriptpubkey_asm,
          scriptpubkey_type: input.prevout.scriptpubkey_type,
          scriptpubkey_address: input.prevout.scriptpubkey_address,
          value: input.prevout.value
        }
      })),
      vout: response.vout.map((output: MempoolTXOutput) => ({
        scriptpubkey: output.scriptpubkey,
        scriptpubkey_asm: output.scriptpubkey_asm,
        scriptpubkey_type: output.scriptpubkey_type,
        scriptpubkey_address: output.scriptpubkey_address,
        value: output.value
      })),
      status: response.status
    };
  }

  /**
   * Calculate total balance for an address in BTC
   * @param address - Bitcoin address
   * @returns Balance in BTC
   */
  public static async getAddressBalance(address: string): Promise<number> {
    try {
      const addressInfo = await BlockchainService.getAddressInfo(address);
      const totalSatoshi = addressInfo.chain_stats.funded_txo_sum - addressInfo.chain_stats.spent_txo_sum;
      return satoshiToBtc(totalSatoshi);
    } catch (error) {
      console.error(`Error calculating balance for ${address}:`, error);
      throw new Error('Failed to calculate address balance');
    }
  }

  /**
   * Check for payments to an address since a specific timestamp
   * @param paymentRequest - Payment request to check
   * @returns TransactionReceipt if found
   */
  public static async checkForPayments(paymentRequest: PaymentRequest): Promise<PaymentReceipt | undefined> {
    const sinceTimestamp = Math.floor(paymentRequest.createdAt.getTime() / 1000);

    const transactions = await BlockchainService.getAddressTransactions(paymentRequest.address);

    for (const tx of transactions) {
      let timestamp = tx.status.block_time;
      if (!timestamp) timestamp = Math.floor(Date.now() / 1000);

      // Note: Testnet4 or Mempool.space block timestamps appear to be ahead by ~1.75 hours.
      // I have not accounted for this in the timestamp comparison.
      // Most recent test:
      // tx timestamp 2025-05-29T00:17:57.000Z (Mempool.space block timestamp)
      // sinceTimestamp 2025-05-28T22:40:37.000Z (Request timestamp)
      if (timestamp < sinceTimestamp) continue;

      // Check outputs for payments to our address
      for (const vout of tx.vout) {
        if (vout.scriptpubkey_address === paymentRequest.address) {
          const receivedAmount = satoshiToBtc(vout.value);

          // Check if it matches (with small tolerance)
          const tolerance = 0.00001; // 1000 satoshi tolerance
          if (Math.abs(receivedAmount - paymentRequest.amount) > tolerance) continue;

          return {
            amount: receivedAmount,
            transactionId: tx.txid,
            confirmations: await BlockchainService.getConfirmationCount(tx.status.block_height),
            timestamp,
            confirmed: tx.status.confirmed
          };
        }
      }
    }
  }

  /**
   * Calculate confirmation count for a transaction
   * @param blockHeight - Block height of the transaction
   * @returns Number of confirmations
   */
  private static async getConfirmationCount(blockHeight: number | undefined): Promise<number> {
    try {
      if (!blockHeight) return 0;
      const currentHeight = await MempoolHttpService.getCurrentBlockHeight();
      return Math.max(0, currentHeight - blockHeight + 1);
    } catch (error) {
      console.error('Error calculating confirmation count:', error);
      return 0;
    }
  }
}