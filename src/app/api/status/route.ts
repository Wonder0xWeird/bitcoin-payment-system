import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/services/PaymentService';
import { ApiErrorResponse, ApiResponse, PaymentStatus } from '@/lib/types';
import { MempoolApiError } from '@/lib/services/BlockchainService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const amount = searchParams.get('amount');
    const createdAt = searchParams.get('createdAt');

    // Validate required parameters
    if (!address) {
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: 'Address parameter is required'
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    if (!amount) {
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: 'Amount parameter is required'
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    if (!createdAt) {
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: 'CreatedAt parameter is required'
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const paymentService = PaymentService.getInstance();

    // Validate and parse the amount
    const validatedAmount = paymentService.validateAndParseAmount(amount);

    // Create a payment request object for status checking
    const paymentRequest = {
      address,
      amount: validatedAmount,
      createdAt: new Date(createdAt),
      label: 'Status Check'
    };

    // Check payment status
    const paymentStatus = await paymentService.checkPaymentStatus(paymentRequest);

    const response: ApiResponse<PaymentStatus> = {
      success: true,
      data: paymentStatus
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error checking payment status:', error);

    // Handle rate limiting specifically
    if (error instanceof MempoolApiError) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: error.message,
        apiError: error.apiError
      };
      return NextResponse.json(errorResponse, { status: 429 });
    }

    const errorResponse: ApiErrorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check payment status'
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, sinceTimestamp } = body;

    // Validate required fields
    if (!address) {
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: 'Address is required'
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const paymentService = PaymentService.getInstance();

    // Use current timestamp if not provided
    const timestamp = sinceTimestamp || Math.floor(Date.now() / 1000);

    // Monitor address for any payments
    const monitorResult = await paymentService.monitorAddress(address, timestamp);

    const response: ApiResponse<typeof monitorResult> = {
      success: true,
      data: monitorResult
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error monitoring address:', error);

    const errorResponse: ApiResponse<never> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to monitor address'
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
} 