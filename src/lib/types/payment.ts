export interface PaymentRequest {
  address: string;
  amount: number; // in BTC
  label?: string;
  message?: string;
  createdAt: Date;
}

export interface PaymentRequestPayload {
  paymentRequest: PaymentRequest;
  paymentUri: string;
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