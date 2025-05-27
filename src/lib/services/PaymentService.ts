import { PaymentRequest, PaymentStatus } from '@/lib/types';
import { BlockchainService } from './BlockchainService';
import { validateBitcoinAddress, validatePaymentAmount } from '@/lib/utils/validation';
import { createPaymentUri, generatePaymentLabel } from '@/lib/utils/bitcoin';

export class PaymentService {
  private static instance: PaymentService;
  private blockchainService: BlockchainService;

  private constructor() {
    this.blockchainService = BlockchainService.getInstance();
  }

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  /**
   * Create a payment request
   * @param address - Bitcoin address
   * @param amount - Amount in BTC
   * @param label - Optional label for the payment
   * @param message - Optional message for the payment
   * @returns PaymentRequest object
   */
  public createPaymentRequest(
    address: string,
    amount: number,
    label?: string,
    message?: string
  ): PaymentRequest {
    // Validate address
    const addressValidation = validateBitcoinAddress(address);
    if (!addressValidation.isValid) {
      throw new Error(addressValidation.error || 'Invalid Bitcoin address');
    }

    // Validate amount
    const amountValidation = validatePaymentAmount(amount);
    if (!amountValidation.isValid) {
      throw new Error(amountValidation.error || 'Invalid payment amount');
    }

    return {
      address,
      amount,
      label: label || generatePaymentLabel(),
      message,
      createdAt: new Date()
    };
  }

  /**
   * Generate payment URI (BIP21 format)
   * @param paymentRequest - Payment request object
   * @returns BIP21 payment URI
   */
  public generatePaymentUri(paymentRequest: PaymentRequest): string {
    return createPaymentUri(
      paymentRequest.address,
      paymentRequest.amount,
      paymentRequest.label,
      paymentRequest.message
    );
  }

  /**
   * Check payment status for a specific request
   * @param paymentRequest - Payment request to check
   * @returns PaymentStatus object
   */
  public async checkPaymentStatus(paymentRequest: PaymentRequest): Promise<PaymentStatus> {
    try {
      const sinceTimestamp = Math.floor(paymentRequest.createdAt.getTime() / 1000);

      const paymentCheck = await this.blockchainService.checkForPayments(
        paymentRequest.address,
        sinceTimestamp,
        paymentRequest.amount
      );

      if (paymentCheck.found) {
        return {
          address: paymentRequest.address,
          amount: paymentRequest.amount,
          status: 'confirmed',
          transactionId: paymentCheck.transactionId,
          confirmations: paymentCheck.confirmations,
          receivedAmount: paymentCheck.amount,
          receivedAt: paymentCheck.timestamp ? new Date(paymentCheck.timestamp * 1000) : undefined
        };
      }

      return {
        address: paymentRequest.address,
        amount: paymentRequest.amount,
        status: 'pending'
      };
    } catch (error) {
      console.error('Error checking payment status:', error);
      return {
        address: paymentRequest.address,
        amount: paymentRequest.amount,
        status: 'failed'
      };
    }
  }

  /**
   * Monitor address for any payments (not specific to a request)
   * @param address - Bitcoin address to monitor
   * @param sinceTimestamp - Unix timestamp to check from
   * @returns Payment information if found
   */
  public async monitorAddress(
    address: string,
    sinceTimestamp: number
  ): Promise<{
    hasPayments: boolean;
    totalReceived: number;
    payments: Array<{
      amount: number;
      transactionId: string;
      confirmations: number;
      timestamp: number;
    }>;
  }> {
    try {
      const transactions = await this.blockchainService.getAddressTransactions(address);
      const payments: Array<{
        amount: number;
        transactionId: string;
        confirmations: number;
        timestamp: number;
      }> = [];

      let totalReceived = 0;

      for (const tx of transactions) {
        if (!tx.status.confirmed || !tx.status.block_time) {
          continue;
        }

        if (tx.status.block_time < sinceTimestamp) {
          continue;
        }

        for (const vout of tx.vout) {
          if (vout.scriptpubkey_address === address) {
            const amount = vout.value / 100000000; // Convert satoshi to BTC
            const confirmations = await this.getConfirmationCount(tx.status.block_height!);

            payments.push({
              amount,
              transactionId: tx.txid,
              confirmations,
              timestamp: tx.status.block_time
            });

            totalReceived += amount;
          }
        }
      }

      return {
        hasPayments: payments.length > 0,
        totalReceived,
        payments
      };
    } catch (error) {
      console.error('Error monitoring address:', error);
      throw new Error('Failed to monitor address for payments');
    }
  }

  /**
   * Get address balance
   * @param address - Bitcoin address
   * @returns Balance in BTC
   */
  public async getAddressBalance(address: string): Promise<number> {
    try {
      return await this.blockchainService.getAddressBalance(address);
    } catch (error) {
      console.error('Error getting address balance:', error);
      throw new Error('Failed to get address balance');
    }
  }

  /**
   * Validate payment amount in different formats
   * @param amount - Amount as string or number
   * @returns Validated amount as number or throws error
   */
  public validateAndParseAmount(amount: string | number): number {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    const validation = validatePaymentAmount(numAmount);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid payment amount');
    }

    return numAmount;
  }

  /**
   * Get confirmation count for a transaction block height
   * @param blockHeight - Block height of the transaction
   * @returns Number of confirmations
   */
  private async getConfirmationCount(blockHeight: number): Promise<number> {
    try {
      const currentHeight = await this.blockchainService.getCurrentBlockHeight();
      return Math.max(0, currentHeight - blockHeight + 1);
    } catch (error) {
      console.error('Error calculating confirmation count:', error);
      return 0;
    }
  }

  /**
   * Health check for payment services
   * @returns boolean indicating if services are operational
   */
  public async healthCheck(): Promise<boolean> {
    try {
      return await this.blockchainService.healthCheck();
    } catch (error) {
      console.error('Payment service health check failed:', error);
      return false;
    }
  }
} 