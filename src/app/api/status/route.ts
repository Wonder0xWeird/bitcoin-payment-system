import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/services/PaymentService';
import { ApiErrorResponse, ApiResponse, PaymentReceipt } from '@/lib/types';
import { validatePaymentAmount, validateDate, validateBitcoinAddress } from '@/lib/utils/validation';
import { HTTP_STATUS_OK, HTTP_STATUS_INTERNAL_SERVER_ERROR, HttpBadRequestError, HttpError } from '@/lib/utils/http';
import { MempoolRateLimitError } from '@/lib/services/MempoolHttpService';

export async function GET(request: NextRequest) {
  try {
    // Note: In production, payment status info would be persisted in a database
    // so users could check the confirmation status of their requests at a later time
    // without having to pass the payment request info in the query params
    // and confirmed payments would be returned immediately from the database
    // without requesting the payment status from an external provider

    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address')!;
    const amount = searchParams.get('amount')!;
    const createdAt = searchParams.get('createdAt')!;

    if (!validatePaymentAmount(amount).isValid) throw new HttpBadRequestError('Invalid amount');
    if (!validateBitcoinAddress(address).isValid) throw new HttpBadRequestError('Invalid address');
    if (!validateDate(createdAt).isValid) throw new HttpBadRequestError('Invalid createdAt');

    const parsedAmount = PaymentService.parseAmount(amount);
    const paymentRequest = {
      address,
      amount: parsedAmount,
      paymentUri: PaymentService.createPaymentUri(address, parsedAmount),
      createdAt: new Date(createdAt),
      label: 'Status Check'
    };

    const paymentReceipt = await PaymentService.checkPaymentStatus(paymentRequest);

    const response: ApiResponse<PaymentReceipt | undefined> = {
      success: true,
      data: paymentReceipt
    };

    return NextResponse.json(response, { status: HTTP_STATUS_OK });
  } catch (error: unknown) {
    console.error('Error checking payment status:', error);

    const errorResponse: ApiErrorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check payment status',
      retryAfter: error instanceof MempoolRateLimitError ? error.retryAfter : undefined
    };

    return NextResponse.json(errorResponse, { status: error instanceof HttpError ? error.status : HTTP_STATUS_INTERNAL_SERVER_ERROR });
  }
}