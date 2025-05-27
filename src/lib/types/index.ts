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

// BlockCypher Address API Response
export interface BlockCypherAddressInfo {
  address: string;
  total_received: number;
  total_sent: number;
  balance: number;
  unconfirmed_balance: number;
  final_balance: number;
  n_tx: number;
  unconfirmed_n_tx: number;
  final_n_tx: number;
  tx_url?: string;
  txrefs?: BlockCypherTXRef[];
  unconfirmed_txrefs?: BlockCypherTXRef[];
  hasMore?: boolean;
}

// Legacy AddressInfo interface - transformed from BlockCypher data
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

// BlockCypher Transaction Reference
export interface BlockCypherTXRef {
  tx_hash: string;
  block_height: number;
  tx_input_n: number;
  tx_output_n: number;
  value: number;
  ref_balance?: number;
  spent: boolean;
  confirmations: number;
  confirmed?: string;
  double_spend: boolean;
  script?: string;
  spent_by?: string;
  received?: string;
  receive_count?: number;
  confidence?: number;
}

// BlockCypher Transaction Response
export interface BlockCypherTransaction {
  hash: string;
  block_height: number;
  block_hash?: string;
  block_index?: number;
  addresses: string[];
  total: number;
  fees: number;
  size: number;
  vsize?: number;
  preference: string;
  relayed_by?: string;
  received: string;
  ver: number;
  lock_time: number;
  double_spend: boolean;
  vin_sz: number;
  vout_sz: number;
  confirmations: number;
  confirmed?: string;
  inputs: BlockCypherTXInput[];
  outputs: BlockCypherTXOutput[];
  opt_in_rbf?: boolean;
  confidence?: number;
  receive_count?: number;
  change_address?: string;
  double_of?: string;
  data_protocol?: string;
  hex?: string;
  next_inputs?: string;
  next_outputs?: string;
}

// BlockCypher Transaction Input
export interface BlockCypherTXInput {
  prev_hash?: string;
  output_index?: number;
  output_value?: number;
  script_type: string;
  script: string;
  addresses: string[];
  sequence: number;
  age?: number;
  wallet_name?: string;
  wallet_token?: string;
}

// BlockCypher Transaction Output  
export interface BlockCypherTXOutput {
  value: number;
  script: string;
  addresses: string[];
  script_type: string;
  spent_by?: string;
  data_hex?: string;
  data_string?: string;
}

// Rate Limit Error Information
export interface RateLimitError {
  isRateLimit: boolean;
  retryAfter?: number; // seconds to wait
  remaining?: number; // requests remaining
  resetTime?: number; // unix timestamp when limit resets
}

export type ApiResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
  rateLimitInfo?: RateLimitError;
}; 