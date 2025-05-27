import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import {
  UTXO,
  TransactionInfo,
  AddressInfo,
  MempoolAddressInfo,
  MempoolTransaction,
  MempoolTXInput,
  MempoolTXOutput,
  MempoolUTXO,
  ApiError
} from '@/lib/types';
import { satoshiToBtc } from '@/lib/utils/bitcoin';

export class MempoolApiError extends Error {
  public apiError: ApiError;

  constructor(message: string, apiError: ApiError) {
    super(message);
    this.name = 'MempoolApiError';
    this.apiError = apiError;
  }
}

export class BlockchainService {
  private static instance: BlockchainService;
  private mempoolClient: AxiosInstance;
  private consecutiveFailures = 0;
  private lastFailureTime = 0;

  // Using mempool.space for testnet4 Bitcoin support
  private readonly MEMPOOL_API_BASE = 'https://mempool.space/testnet4/api';
  private readonly MAX_RETRIES = 3;
  private readonly BASE_DELAY = 1000; // 1 second base delay for exponential backoff
  private readonly FAILURE_THRESHOLD = 5; // Consider service unhealthy after 5 failures

  private constructor() {
    console.log('✅ Using mempool.space testnet4 API for blockchain data');

    this.mempoolClient = axios.create({
      baseURL: this.MEMPOOL_API_BASE,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'BTC-Payment-App/1.0'
      },
    });

    // Add response interceptor for error handling
    this.mempoolClient.interceptors.response.use(
      (response) => {
        // Reset failure count on successful response
        this.consecutiveFailures = 0;
        this.lastFailureTime = 0;
        return response;
      },
      (error) => {
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  public static getInstance(): BlockchainService {
    if (!BlockchainService.instance) {
      BlockchainService.instance = new BlockchainService();
    }
    return BlockchainService.instance;
  }

  /**
   * Get address information including balance and transaction count
   * @param address - Bitcoin address
   * @returns Address information
   */
  public async getAddressInfo(address: string): Promise<AddressInfo> {
    try {
      const response: AxiosResponse<MempoolAddressInfo> = await this.mempoolClient.get(
        `/address/${address}`
      );

      // mempool.space response is already in the correct format
      return response.data;
    } catch (error) {
      console.error(`Error fetching address info for ${address}:`, error);
      throw new Error('Failed to fetch address information');
    }
  }

  /**
   * Get UTXOs for a specific address
   * @param address - Bitcoin address
   * @returns Array of UTXOs
   */
  public async getAddressUTXOs(address: string): Promise<UTXO[]> {
    try {
      const response: AxiosResponse<MempoolUTXO[]> = await this.mempoolClient.get(
        `/address/${address}/utxo`
      );

      // Transform mempool.space UTXO format to match expected format
      return response.data.map((utxo: MempoolUTXO) => ({
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
    } catch (error) {
      console.error(`Error fetching UTXOs for ${address}:`, error);
      throw new Error('Failed to fetch address UTXOs');
    }
  }

  /**
   * Get transactions for a specific address
   * @param address - Bitcoin address
   * @param lastSeenTxId - Optional: last seen transaction ID for pagination
   * @returns Array of transactions
   */
  public async getAddressTransactions(
    address: string,
    lastSeenTxId?: string
  ): Promise<TransactionInfo[]> {
    try {
      // Get transactions for address
      const response: AxiosResponse<MempoolTransaction[]> = await this.mempoolClient.get(
        `/address/${address}/txs`
      );

      // Transform mempool.space transaction format to match expected format
      return response.data.map((tx: MempoolTransaction) => ({
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
    } catch (error) {
      console.error(`Error fetching transactions for ${address}:`, error);
      throw new Error('Failed to fetch address transactions');
    }
  }

  /**
   * Get specific transaction information
   * @param txid - Transaction ID
   * @returns Transaction information
   */
  public async getTransaction(txid: string): Promise<TransactionInfo> {
    try {
      const response: AxiosResponse<MempoolTransaction> = await this.mempoolClient.get(
        `/tx/${txid}`
      );

      const tx = response.data;

      // Transform mempool.space transaction format to match expected format
      return {
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
      };
    } catch (error) {
      console.error(`Error fetching transaction ${txid}:`, error);
      throw new Error('Failed to fetch transaction');
    }
  }

  /**
   * Calculate total balance for an address in BTC
   * @param address - Bitcoin address
   * @returns Balance in BTC
   */
  public async getAddressBalance(address: string): Promise<number> {
    try {
      const addressInfo = await this.getAddressInfo(address);
      const totalSatoshi = addressInfo.chain_stats.funded_txo_sum - addressInfo.chain_stats.spent_txo_sum;
      return satoshiToBtc(totalSatoshi);
    } catch (error) {
      console.error(`Error calculating balance for ${address}:`, error);
      throw new Error('Failed to calculate address balance');
    }
  }

  /**
   * Check for payments to an address since a specific timestamp
   * @param address - Bitcoin address to monitor
   * @param sinceTimestamp - Unix timestamp to check from
   * @param expectedAmount - Expected payment amount in BTC (optional)
   * @returns Payment information if found
   */
  public async checkForPayments(
    address: string,
    sinceTimestamp: number,
    expectedAmount?: number
  ): Promise<{
    found: boolean;
    amount?: number;
    transactionId?: string;
    confirmations?: number;
    timestamp?: number;
  }> {
    try {
      const transactions = await this.getAddressTransactions(address);

      console.log('🔍 Transactions:', JSON.stringify(transactions, null, 2));

      for (const tx of transactions) {
        // Skip unconfirmed transactions for reliability
        if (!tx.status.confirmed || !tx.status.block_time) {
          continue;
        }

        // Check if transaction is after our timestamp
        if (tx.status.block_time < sinceTimestamp) {
          continue;
        }

        // Check outputs for payments to our address
        for (const vout of tx.vout) {
          if (vout.scriptpubkey_address === address) {
            const receivedAmount = satoshiToBtc(vout.value);

            // If expected amount is specified, check if it matches (with small tolerance)
            if (expectedAmount) {
              const tolerance = 0.00001; // 1000 satoshi tolerance
              if (Math.abs(receivedAmount - expectedAmount) > tolerance) {
                continue;
              }
            }

            return {
              found: true,
              amount: receivedAmount,
              transactionId: tx.txid,
              confirmations: await this.getConfirmationCount(tx.status.block_height!),
              timestamp: tx.status.block_time
            };
          }
        }
      }

      return { found: false };
    } catch (error) {
      console.error(`Error checking for payments to ${address}:`, error);
      throw new Error('Failed to check for payments');
    }
  }

  /**
   * Get current block height to calculate confirmations
   * @returns Current block height
   */
  public async getCurrentBlockHeight(): Promise<number> {
    return this.executeWithRetry(async () => {
      try {
        const response: AxiosResponse<number> = await this.mempoolClient.get('/blocks/tip/height');
        return response.data || 0;
      } catch (error) {
        console.error('Error fetching current block height:', error);
        throw new Error('Failed to fetch current block height');
      }
    });
  }

  /**
   * Calculate confirmation count for a transaction
   * @param blockHeight - Block height of the transaction
   * @returns Number of confirmations
   */
  private async getConfirmationCount(blockHeight: number): Promise<number> {
    try {
      const currentHeight = await this.getCurrentBlockHeight();
      return Math.max(0, currentHeight - blockHeight + 1);
    } catch (error) {
      console.error('Error calculating confirmation count:', error);
      return 0;
    }
  }

  /**
   * Health check for the API
   * @returns boolean indicating if API is accessible
   */
  public async healthCheck(): Promise<boolean> {
    try {
      await this.getCurrentBlockHeight();
      return true;
    } catch (error) {
      console.error('mempool.space API health check failed:', error);
      return false;
    }
  }

  /**
   * Handle API errors with proper error classification
   * @param error - Axios error object
   */
  private handleApiError(error: AxiosError): void {
    const status = error.response?.status;
    this.consecutiveFailures++;
    this.lastFailureTime = Date.now();

    if (status === 429) {
      // Rate limit error
      const retryAfter = error.response?.headers['retry-after'];

      console.error('🚫 Rate limited by mempool.space API:', {
        status,
        retryAfter,
        consecutiveFailures: this.consecutiveFailures
      });

      throw new MempoolApiError('Rate limited by mempool.space API', {
        isRateLimit: true,
        retryAfter: retryAfter ? parseInt(retryAfter, 10) : undefined,
        statusCode: status,
        message: `Rate limited. ${retryAfter ? `Retry after ${retryAfter}s` : 'Please try again later'}`
      });
    } else if (status && status >= 500) {
      // Server error
      console.error('mempool.space server error:', {
        status,
        message: error.message,
        consecutiveFailures: this.consecutiveFailures
      });

      throw new Error(`mempool.space server error: ${error.message}`);
    } else {
      // Other errors (4xx, network errors, etc.)
      console.error('mempool.space API error:', {
        status,
        message: error.message,
        consecutiveFailures: this.consecutiveFailures
      });

      throw new Error(`mempool.space API error: ${error.message}`);
    }
  }

  /**
   * Execute request with exponential backoff retry logic
   * @param requestFn - Function that makes the API request
   * @param retries - Number of retries remaining
   * @returns Promise resolving to the API response
   */
  private async executeWithRetry<T>(
    requestFn: () => Promise<T>,
    retries: number = this.MAX_RETRIES
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      if (retries <= 0) {
        throw error;
      }

      // Check if it's a rate limit error or server error
      const isRetryable = error instanceof Error && (
        error.message.includes('Rate limited') ||
        error.message.includes('server error') ||
        error.message.includes('ECONNRESET') ||
        error.message.includes('timeout')
      );

      if (isRetryable) {
        // Exponential backoff
        const delay = this.BASE_DELAY * Math.pow(2, this.MAX_RETRIES - retries);

        console.log(`⏳ Retrying in ${delay / 1000}s... (${retries} retries left)`);

        await new Promise(resolve => setTimeout(resolve, delay));
        return this.executeWithRetry(requestFn, retries - 1);
      }

      // For non-retryable errors, throw immediately
      throw error;
    }
  }

  /**
   * Get service health status
   * @returns Service health information
   */
  public getServiceHealth(): {
    healthy: boolean;
    consecutiveFailures: number;
    lastFailureTime: number;
  } {
    const timeSinceLastFailure = Date.now() - this.lastFailureTime;
    const isHealthy = this.consecutiveFailures < this.FAILURE_THRESHOLD &&
      (this.lastFailureTime === 0 || timeSinceLastFailure > 60000); // 1 minute recovery time

    return {
      healthy: isHealthy,
      consecutiveFailures: this.consecutiveFailures,
      lastFailureTime: this.lastFailureTime
    };
  }
} 