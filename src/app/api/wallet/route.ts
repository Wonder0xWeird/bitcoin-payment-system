import { NextResponse } from 'next/server';
import { WalletService } from '@/lib/services/WalletService';
import { ApiResponse } from '@/lib/types';

export async function POST() {
  try {
    const walletService = WalletService.getInstance();

    // Generate a new HD wallet
    const wallet = walletService.generateHDWallet();

    // For security, we only return the public information
    // Private key stays on server-side only
    const publicWalletInfo = {
      address: wallet.address,
      publicKey: wallet.publicKey,
      // Note: mnemonic is included for demo purposes
      // In production, this should be stored securely and not returned
      mnemonic: wallet.mnemonic
    };

    const response: ApiResponse<typeof publicWalletInfo> = {
      success: true,
      data: publicWalletInfo
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error generating wallet:', error);

    const errorResponse: ApiResponse<never> = {
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