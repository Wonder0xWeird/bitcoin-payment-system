import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/services/PaymentService';
import { ApiErrorResponse, ApiResponse, PaymentRequest } from '@/lib/types';
import { HttpBadRequestError, HTTP_STATUS_INTERNAL_SERVER_ERROR } from '@/lib/utils/http';
import { validateBitcoinAddress, validatePaymentAmount } from '@/lib/utils/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, amount, label, message } = body;

    if (!validatePaymentAmount(amount).isValid) throw new HttpBadRequestError('Invalid amount');
    if (!validateBitcoinAddress(address).isValid) throw new HttpBadRequestError('Invalid address');

    const paymentRequest = PaymentService.createPaymentRequest(address, amount, label, message);

    // Note: In production, payment request info would be persisted in a database
    // so users could check the confirmation status of their requests at a later time

    const response: ApiResponse<PaymentRequest> = {
      success: true,
      data: paymentRequest
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('Error creating payment request:', error);

    const errorResponse: ApiErrorResponse = {
      success: false,
      error: error.message || 'Failed to create payment request'
    };

    return NextResponse.json(errorResponse, { status: error.status || HTTP_STATUS_INTERNAL_SERVER_ERROR });
  }
} 