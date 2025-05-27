export interface HDWallet {
  mnemonic: string;
  address: string;
  privateKey: string;
  publicKey: string;
}

export interface PaymentRequest {
  address: string;
  amount: number; // in BTC
  label?: string;
  message?: string;
  createdAt: Date;
}

export interface PaymentStatus {
  address: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'failed';
  transactionId?: string;
  confirmations?: number;
  receivedAmount?: number;
  receivedAt?: Date;
}

export interface UTXO {
  txid: string;
  vout: number;
  value: number; // in satoshis
  status: {
    confirmed: boolean;
    block_height?: number;
    block_hash?: string;
    block_time?: number;
  };
}

export interface TransactionInfo {
  txid: string;
  status: {
    confirmed: boolean;
    block_height?: number;
    block_hash?: string;
    block_time?: number;
  };
  vout: Array<{
    scriptpubkey: string;
    scriptpubkey_asm: string;
    scriptpubkey_type: string;
    scriptpubkey_address?: string;
    value: number;
  }>;
  vin: Array<{
    txid: string;
    vout: number;
    prevout: {
      scriptpubkey: string;
      scriptpubkey_asm: string;
      scriptpubkey_type: string;
      scriptpubkey_address?: string;
      value: number;
    };
  }>;
}

// Mempool.space Address API Response
export interface MempoolAddressInfo {
  address: string;
  chain_stats: {
    funded_txo_count: number;
    funded_txo_sum: number;
    spent_txo_count: number;
    spent_txo_sum: number;
    tx_count: number;
  };
  mempool_stats: {
    funded_txo_count: number;
    funded_txo_sum: number;
    spent_txo_count: number;
    spent_txo_sum: number;
    tx_count: number;
  };
}

// AddressInfo interface - now directly compatible with mempool.space
export interface AddressInfo {
  address: string;
  chain_stats: {
    funded_txo_count: number;
    funded_txo_sum: number;
    spent_txo_count: number;
    spent_txo_sum: number;
    tx_count: number;
  };
  mempool_stats: {
    funded_txo_count: number;
    funded_txo_sum: number;
    spent_txo_count: number;
    spent_txo_sum: number;
    tx_count: number;
  };
}

// Mempool.space Transaction Response
export interface MempoolTransaction {
  txid: string;
  version: number;
  locktime: number;
  vin: MempoolTXInput[];
  vout: MempoolTXOutput[];
  size: number;
  weight: number;
  sigops?: number;
  fee: number;
  status: {
    confirmed: boolean;
    block_height?: number;
    block_hash?: string;
    block_time?: number;
  };
}

// Mempool.space Transaction Input
export interface MempoolTXInput {
  txid: string;
  vout: number;
  prevout: {
    scriptpubkey: string;
    scriptpubkey_asm: string;
    scriptpubkey_type: string;
    scriptpubkey_address?: string;
    value: number;
  };
  scriptsig: string;
  scriptsig_asm: string;
  is_coinbase: boolean;
  sequence: number;
}

// Mempool.space Transaction Output  
export interface MempoolTXOutput {
  scriptpubkey: string;
  scriptpubkey_asm: string;
  scriptpubkey_type: string;
  scriptpubkey_address?: string;
  value: number;
}

// Mempool.space UTXO
export interface MempoolUTXO {
  txid: string;
  vout: number;
  status: {
    confirmed: boolean;
    block_height?: number;
    block_hash?: string;
    block_time?: number;
  };
  value: number;
}

// API Error Information
export interface ApiError {
  isRateLimit: boolean;
  retryAfter?: number; // seconds to wait
  message?: string;
  statusCode?: number;
}


export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
}

export type ApiErrorResponse = {
  success: false;
  error: string;
  apiError?: ApiError;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse; 