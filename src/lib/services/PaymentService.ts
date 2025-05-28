import { PaymentRequest, PaymentReceipt } from '@/lib/types';
import { BlockchainService } from './BlockchainService';
import { formatBtc, generatePaymentLabel } from '@/lib/utils/bitcoin';

export class PaymentService {

  /**
   * Parse payment amount in different formats
   * @param amount - Amount as string or number
   * @returns Parsed amount as number
   */
  public static parseAmount(amount: string | number): number {
    return typeof amount === 'string' ? parseFloat(amount) : amount;
  }

  /**
   * Create a payment request
   * @param address - Bitcoin address
   * @param amount - Amount in BTC
   * @param label - Optional label for the payment
   * @param message - Optional message for the payment
   * @returns PaymentRequest object
   */
  public static createPaymentRequest(address: string, amount: string | number, label?: string, message?: string): PaymentRequest {
    const parsedAmount = PaymentService.parseAmount(amount);
    return {
      address,
      amount: parsedAmount,
      paymentUri: PaymentService.createPaymentUri(address, parsedAmount, label, message),
      label: label || generatePaymentLabel(),
      message: message || 'Payment request created via Blockchain.com $BTC Pay',
      createdAt: new Date()
    };
  }

  /**
   * Generate payment URI (BIP21 format)
   * @param address - Bitcoin address
   * @param amount - Amount in BTC
   * @param label - Optional label for the payment
   * @param message - Optional message for the payment
   * @returns BIP21 payment URI
   */
  public static createPaymentUri(address: string, amount: number, label?: string, message?: string): string {
    let uri = `bitcoin:${address}`;
    const params = new URLSearchParams();
    params.set('amount', formatBtc(amount));
    if (label) { params.set('label', label); }
    if (message) { params.set('message', message); }
    return uri += `?${params.toString()}`;
  }

  /**
   * Check payment status for a specific request
   * @param paymentRequest - Payment request to check
   * @returns PaymentReceipt object
   */
  public static async checkPaymentStatus(paymentRequest: PaymentRequest): Promise<PaymentReceipt | undefined> {
    return await BlockchainService.checkForPayments(paymentRequest);
  }
}