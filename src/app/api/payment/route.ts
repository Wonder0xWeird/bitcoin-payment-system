import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/services/PaymentService';
import { ApiResponse, PaymentRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, amount, label, message } = body;

    // Validate required fields
    if (!address) {
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: 'Address is required'
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    if (!amount) {
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: 'Amount is required'
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const paymentService = PaymentService.getInstance();

    // Validate and parse the amount
    const validatedAmount = paymentService.validateAndParseAmount(amount);

    // Create payment request
    const paymentRequest = paymentService.createPaymentRequest(
      address,
      validatedAmount,
      label,
      message
    );

    // Generate payment URI for QR code
    const paymentUri = paymentService.generatePaymentUri(paymentRequest);

    const response: ApiResponse<{
      paymentRequest: PaymentRequest;
      paymentUri: string;
    }> = {
      success: true,
      data: {
        paymentRequest,
        paymentUri
      }
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error creating payment request:', error);

    const errorResponse: ApiResponse<never> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment request'
    };

    return NextResponse.json(errorResponse, { status: 400 });
  }
} 