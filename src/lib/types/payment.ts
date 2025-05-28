export interface PaymentRequest {
  address: string;
  amount: number; // in BTC
  paymentUri: string;
  label?: string;
  message?: string;
  createdAt: Date;
}

export interface PaymentReceipt {
  amount: number;
  transactionId: string;
  confirmations: number;
  timestamp: number;
  confirmed: boolean;
}