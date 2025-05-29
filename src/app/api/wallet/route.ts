import { NextResponse } from 'next/server';
import { WalletService } from '@/lib/services/WalletService';
import { ApiErrorResponse, ApiSuccessResponse, PublicWalletInfo } from '@/lib/types';
import { HTTP_STATUS_INTERNAL_SERVER_ERROR, HttpError } from '@/lib/utils/http';

export async function POST() {
  try {
    const wallet = WalletService.generateHDWallet();

    // Note: In production, HD wallet info including mnemonic and private key 
    // could be encrypted and persisted securely in a database for the user to use later

    const response: ApiSuccessResponse<PublicWalletInfo> = {
      success: true,
      data: {
        address: wallet.address,
        publicKey: wallet.publicKey,
      }
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    console.error('Error generating wallet:', error);

    const errorResponse: ApiErrorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate wallet'
    };

    return NextResponse.json(errorResponse, { status: error instanceof HttpError ? error.status : HTTP_STATUS_INTERNAL_SERVER_ERROR });
  }
}

export async function GET() {
  // For demo purposes, we'll also allow GET to generate a wallet
  // In production, this request would instead return an authenticated user's persisted wallet info
  return POST();
} 