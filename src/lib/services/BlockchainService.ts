import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import {
  UTXO,
  TransactionInfo,
  AddressInfo,
  BlockCypherAddressInfo,
  BlockCypherTransaction,
  BlockCypherTXRef,
  BlockCypherTXInput,
  BlockCypherTXOutput,
  RateLimitError
} from '@/lib/types';
import { satoshiToBtc } from '@/lib/utils/bitcoin';

interface RateLimitInfo {
  remaining: number;
  retryAfter?: number;
  isRateLimited: boolean;
}

export class BlockCypherRateLimitError extends Error {
  public rateLimitInfo: RateLimitError;

  constructor(message: string, rateLimitInfo: RateLimitError) {
    super(message);
    this.name = 'BlockCypherRateLimitError';
    this.rateLimitInfo = rateLimitInfo;
  }
}

export class BlockchainService {
  private static instance: BlockchainService;
  private blockcypherClient: AxiosInstance;
  private apiToken: string | null;
  private rateLimitInfo: RateLimitInfo = { remaining: Infinity, isRateLimited: false };
  private consecutiveFailures = 0;
  private circuitBreakerOpen = false;
  private lastCircuitBreakerReset = Date.now();

  // Using BlockCypher API for better reliability (99.99% uptime)
  private readonly BLOCKCYPHER_API_BASE = 'api.blockcypher.com/v1/bcy/test';
  private readonly MAX_RETRIES = 3;
  private readonly BASE_DELAY = 1000; // 1 second base delay for exponential backoff
  private readonly CIRCUIT_BREAKER_TIMEOUT = 60000; // 1 minute circuit breaker timeout

  private constructor() {
    // Get API token from environment variables
    this.apiToken = process.env.BLOCKCYPHER_TOKEN || process.env.NEXT_PUBLIC_BLOCKCYPHER_TOKEN || null;

    if (!this.apiToken) {
      console.warn('⚠️ No BlockCypher API token found. Using free tier limits (3 req/sec, 100 req/hour)');
      console.warn('💡 Get a free token at: https://accounts.blockcypher.com/register');
    } else {
      console.log('✅ BlockCypher API token found. Using enhanced limits (500 req/sec, 500k req/hour)');
    }

    this.blockcypherClient = axios.create({
      baseURL: this.BLOCKCYPHER_API_BASE,
      timeout: 30000, // Increased timeout for better reliability
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include token and handle circuit breaker
    this.blockcypherClient.interceptors.request.use(
      (config) => {
        // Check circuit breaker
        if (this.circuitBreakerOpen) {
          const timeSinceReset = Date.now() - this.lastCircuitBreakerReset;
          if (timeSinceReset < this.CIRCUIT_BREAKER_TIMEOUT) {
            throw new Error('Service temporarily unavailable due to rate limiting. Please try again later.');
          } else {
            // Reset circuit breaker
            this.circuitBreakerOpen = false;
            this.consecutiveFailures = 0;
            console.log('🔄 Circuit breaker reset, resuming requests');
          }
        }

        // Add API token if available
        if (this.apiToken) {
          config.params = { ...config.params, token: this.apiToken };
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for rate limit and error handling
    this.blockcypherClient.interceptors.response.use(
      (response) => {
        // Reset failure count on successful response
        this.consecutiveFailures = 0;

        // Update rate limit info from headers
        this.updateRateLimitInfo(response);

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
      const response: AxiosResponse<BlockCypherAddressInfo> = await this.blockcypherClient.get(
        `/addrs/${address}`
      );

      const data = response.data;

      // Transform BlockCypher response to match legacy format
      return {
        address: data.address,
        chain_stats: {
          funded_txo_count: data.n_tx || 0,
          funded_txo_sum: data.total_received || 0,
          spent_txo_count: Math.max(0, (data.n_tx || 0) - (data.unconfirmed_n_tx || 0)),
          spent_txo_sum: data.total_sent || 0,
          tx_count: data.n_tx || 0
        },
        mempool_stats: {
          funded_txo_count: data.unconfirmed_n_tx || 0,
          funded_txo_sum: data.unconfirmed_balance || 0,
          spent_txo_count: 0,
          spent_txo_sum: 0,
          tx_count: data.unconfirmed_n_tx || 0
        }
      };
    } catch (error) {
      console.error(`Error fetching address info for ${address}:`, error);

      // Handle rate limiting with proper error information
      if (error instanceof AxiosError && error.response?.status === 429) {
        const retryAfter = error.response.headers['retry-after'];
        const remaining = error.response.headers['x-ratelimit-remaining'];

        throw new BlockCypherRateLimitError('Rate limited by BlockCypher API', {
          isRateLimit: true,
          retryAfter: retryAfter ? parseInt(retryAfter, 10) : undefined,
          remaining: remaining ? parseInt(remaining, 10) : undefined,
          resetTime: retryAfter ? Date.now() + (parseInt(retryAfter, 10) * 1000) : undefined
        });
      }

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
      const response: AxiosResponse<BlockCypherAddressInfo> = await this.blockcypherClient.get(
        `/addrs/${address}?unspentOnly=true&includeScript=true`
      );

      // Transform BlockCypher UTXO format to match expected format
      return (response.data.txrefs || []).map((utxo: BlockCypherTXRef) => ({
        txid: utxo.tx_hash,
        vout: utxo.tx_output_n,
        status: {
          confirmed: utxo.confirmations > 0,
          block_height: utxo.block_height || undefined,
          block_hash: undefined,
          block_time: undefined
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
      let url = `/addrs/${address}/full`;
      if (lastSeenTxId) {
        url += `?before=${lastSeenTxId}`;
      }

      const response: AxiosResponse<{ txs: BlockCypherTransaction[] }> = await this.blockcypherClient.get(url);

      // Transform BlockCypher transaction format to match expected format
      return (response.data.txs || []).map((tx: BlockCypherTransaction) => ({
        txid: tx.hash,
        vin: tx.inputs?.map((input: BlockCypherTXInput) => ({
          txid: input.prev_hash || '',
          vout: input.output_index || 0,
          prevout: {
            scriptpubkey: input.script || '',
            scriptpubkey_asm: '',
            scriptpubkey_type: input.script_type || '',
            scriptpubkey_address: input.addresses?.[0],
            value: input.output_value || 0
          }
        })) || [],
        vout: tx.outputs?.map((output: BlockCypherTXOutput) => ({
          scriptpubkey: output.script || '',
          scriptpubkey_asm: '',
          scriptpubkey_type: output.script_type || '',
          scriptpubkey_address: output.addresses?.[0],
          value: output.value || 0
        })) || [],
        status: {
          confirmed: tx.confirmations > 0,
          block_height: tx.block_height > 0 ? tx.block_height : undefined,
          block_hash: tx.block_hash,
          block_time: tx.confirmed ? Math.floor(new Date(tx.confirmed).getTime() / 1000) : undefined
        }
      }));
    } catch (error) {
      console.error(`Error fetching transactions for ${address}:`, error);

      // Handle rate limiting
      if (error instanceof AxiosError && error.response?.status === 429) {
        const retryAfter = error.response.headers['retry-after'];
        const remaining = error.response.headers['x-ratelimit-remaining'];

        throw new BlockCypherRateLimitError('Rate limited by BlockCypher API', {
          isRateLimit: true,
          retryAfter: retryAfter ? parseInt(retryAfter, 10) : undefined,
          remaining: remaining ? parseInt(remaining, 10) : undefined,
          resetTime: retryAfter ? Date.now() + (parseInt(retryAfter, 10) * 1000) : undefined
        });
      }

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
      const response: AxiosResponse<BlockCypherTransaction> = await this.blockcypherClient.get(
        `/txs/${txid}`
      );

      const tx = response.data;

      // Transform BlockCypher transaction format to match expected format
      return {
        txid: tx.hash,
        vin: tx.inputs?.map((input: BlockCypherTXInput) => ({
          txid: input.prev_hash || '',
          vout: input.output_index || 0,
          prevout: {
            scriptpubkey: input.script || '',
            scriptpubkey_asm: '',
            scriptpubkey_type: input.script_type || '',
            scriptpubkey_address: input.addresses?.[0],
            value: input.output_value || 0
          }
        })) || [],
        vout: tx.outputs?.map((output: BlockCypherTXOutput) => ({
          scriptpubkey: output.script || '',
          scriptpubkey_asm: '',
          scriptpubkey_type: output.script_type || '',
          scriptpubkey_address: output.addresses?.[0],
          value: output.value || 0
        })) || [],
        status: {
          confirmed: tx.confirmations > 0,
          block_height: tx.block_height > 0 ? tx.block_height : undefined,
          block_hash: tx.block_hash,
          block_time: tx.confirmed ? Math.floor(new Date(tx.confirmed).getTime() / 1000) : undefined
        }
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
        const response: AxiosResponse<{ height: number }> = await this.blockcypherClient.get('');
        return response.data.height || 0;
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
      console.error('Blockchain API health check failed:', error);
      return false;
    }
  }

  /**
   * Update rate limit information from API response headers
   * @param response - Axios response object
   */
  private updateRateLimitInfo(response: AxiosResponse): void {
    const headers = response.headers;

    // BlockCypher rate limit headers
    const remaining = headers['x-ratelimit-remaining'];
    const retryAfter = headers['retry-after'];

    if (remaining !== undefined) {
      this.rateLimitInfo.remaining = parseInt(remaining, 10);
      this.rateLimitInfo.isRateLimited = this.rateLimitInfo.remaining <= 5; // Consider rate limited if very few remaining

      if (this.rateLimitInfo.remaining <= 0) {
        console.warn('⚠️ Rate limit approaching: 0 requests remaining');
      } else if (this.rateLimitInfo.remaining <= 10) {
        console.warn(`⚠️ Rate limit approaching: ${this.rateLimitInfo.remaining} requests remaining`);
      }
    }

    if (retryAfter !== undefined) {
      this.rateLimitInfo.retryAfter = parseInt(retryAfter, 10) * 1000; // Convert to milliseconds
    }
  }

  /**
   * Handle API errors with proper rate limit detection and circuit breaker logic
   * @param error - Axios error object
   */
  private handleApiError(error: AxiosError): void {
    const status = error.response?.status;

    if (status === 429) {
      // Rate limit error
      this.consecutiveFailures++;
      this.rateLimitInfo.isRateLimited = true;

      const retryAfter = error.response?.headers['retry-after'];
      if (retryAfter) {
        this.rateLimitInfo.retryAfter = parseInt(retryAfter, 10) * 1000;
      }

      console.error('🚫 Rate limited by BlockCypher API:', {
        status,
        retryAfter: this.rateLimitInfo.retryAfter,
        consecutiveFailures: this.consecutiveFailures
      });

      // Open circuit breaker if too many consecutive failures
      if (this.consecutiveFailures >= 3) {
        this.circuitBreakerOpen = true;
        this.lastCircuitBreakerReset = Date.now();
        console.error('🚫 Circuit breaker opened due to consecutive rate limit failures');
      }

      throw new Error(`Rate limited. ${this.rateLimitInfo.retryAfter ? `Retry after ${this.rateLimitInfo.retryAfter / 1000}s` : 'Please try again later'}`);
    } else {
      // Other errors
      console.error('BlockCypher API error:', {
        status,
        message: error.message,
        data: error.response?.data
      });

      throw new Error(`Blockchain API error: ${error.message}`);
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

      // Check if it's a rate limit error
      const isRateLimit = error instanceof Error && error.message.includes('Rate limited');
      const isCircuitBreakerOpen = error instanceof Error && error.message.includes('Service temporarily unavailable');

      if (isRateLimit || isCircuitBreakerOpen) {
        // Use retry-after header if available, otherwise exponential backoff
        const delay = this.rateLimitInfo.retryAfter ||
          (this.BASE_DELAY * Math.pow(2, this.MAX_RETRIES - retries));

        console.log(`⏳ Retrying in ${delay / 1000}s... (${retries} retries left)`);

        await new Promise(resolve => setTimeout(resolve, delay));
        return this.executeWithRetry(requestFn, retries - 1);
      }

      // For non-rate-limit errors, throw immediately
      throw error;
    }
  }

  /**
   * Get rate limit status
   * @returns Current rate limit information
   */
  public getRateLimitInfo(): RateLimitInfo {
    return { ...this.rateLimitInfo };
  }
} 