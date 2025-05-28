import axios, { AxiosResponse, isAxiosError } from "axios";
import { AddressInfo, MempoolAddressInfo, MempoolTransaction, MempoolTXOutput, MempoolUTXO, UTXO } from "../types";
import { HTTP_STATUS_TOO_MANY_REQUESTS, HttpInternalServerError, HttpRateLimitError } from "../utils/http";

export class MempoolRateLimitError extends HttpRateLimitError {
  public retryAfter: number | undefined;

  constructor(retryAfter?: number) {
    super('Rate limited by mempool.space API');
    this.name = 'MempoolRateLimitError';
    this.retryAfter = retryAfter;
  }
}

const MEMPOOL_API_BASE = 'https://mempool.space/testnet4/api';

export class MempoolHttpService {
  public static async getAddressInfo(address: string): Promise<AddressInfo> {
    try {
      const response: AxiosResponse<MempoolAddressInfo> = await axios.get(`${MEMPOOL_API_BASE}/address/${address}`);
      return response.data;
    } catch (error) {
      console.error(`[MempoolHttpClient] Error fetching address info for ${address}:`, error);
      throw new HttpInternalServerError('Failed to fetch address information');
    }
  }

  public static async getAddressUTXOs(address: string): Promise<UTXO[]> {
    try {
      const response: AxiosResponse<MempoolUTXO[]> = await axios.get(`${MEMPOOL_API_BASE}/address/${address}/utxo`);
      return response.data;
    } catch (error) {
      console.error(`[MempoolHttpClient] Error fetching UTXOs for ${address}:`, error);
      throw new HttpInternalServerError('Failed to fetch address UTXOs');
    }
  }

  public static async getAddressTransactions(address: string): Promise<MempoolTransaction[]> {
    try {
      const response: AxiosResponse<MempoolTransaction[]> = await axios.get(`${MEMPOOL_API_BASE}/address/${address}/txs`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching transactions for ${address}:`, error);
      if (isAxiosError(error)) {
        if (error.response?.status === HTTP_STATUS_TOO_MANY_REQUESTS) {
          const retryAfterHeader = error.response?.headers['retry-after'];
          let retryAfter: number | undefined;
          if (retryAfterHeader) {
            const parsed = parseInt(retryAfterHeader, 10);
            if (!isNaN(parsed)) retryAfter = parsed;
            else {
              const retryDate = new Date(retryAfterHeader);
              if (!isNaN(retryDate.getTime())) retryAfter = Math.max(0, Math.ceil((retryDate.getTime() - Date.now()) / 1000));
            }
          }
          throw new MempoolRateLimitError(retryAfter);
        }
      }
      throw new HttpInternalServerError('Failed to fetch address transactions');
    }
  }

  public static async getTransaction(txid: string): Promise<MempoolTransaction> {
    try {
      const response: AxiosResponse<MempoolTransaction> = await axios.get(`${MEMPOOL_API_BASE}/tx/${txid}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching transaction ${txid}:`, error);
      throw new HttpInternalServerError('Failed to fetch transaction');
    }
  }

  public static async getCurrentBlockHeight(): Promise<number> {
    try {
      const response: AxiosResponse<number> = await axios.get(`${MEMPOOL_API_BASE}/blocks/tip/height`);
      return response.data || 0;
    } catch (error) {
      console.error('Error fetching current block height:', error);
      throw new HttpInternalServerError('Failed to fetch current block height');
    }
  };
}

