import { NextResponse } from 'next/server';
import { WalletService } from '@/lib/services/WalletService';
import { ApiErrorResponse, ApiSuccessResponse, WalletInfo } from '@/lib/types';

export async function POST() {
  try {
    const walletService = WalletService.getInstance();

    // Generate a new HD wallet
    const wallet = walletService.generateHDWallet();

    // Note: In production, HD wallet info including mnemonic and private key 
    // would be encrypted and stored securely for the user

    const publicWalletInfo: WalletInfo = {
      address: wallet.address,
      publicKey: wallet.publicKey,
    };

    const response: ApiSuccessResponse<WalletInfo> = {
      success: true,
      data: publicWalletInfo
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error generating wallet:', error);

    const errorResponse: ApiErrorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate wallet'
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function GET() {
  // For demo purposes, we'll also allow GET to generate a wallet
  return POST();
} 