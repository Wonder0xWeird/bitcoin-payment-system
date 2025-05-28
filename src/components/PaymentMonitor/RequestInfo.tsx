'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { PaymentRequest } from '@/lib/types';
import { formatBtc } from '@/lib/utils/bitcoin';

interface QRDisplayProps {
  paymentRequest: PaymentRequest;
}

export function RequestInfo({ paymentRequest }: QRDisplayProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const openInWallet = () => {
    // Open payment URI in default Bitcoin wallet
    window.open(paymentRequest.paymentUri, '_blank');
  };

  return (
    <div className="card mb-6">
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Payment Request Created
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
          Scan the QR code or share the payment details
        </p>
      </div>

      {/* QR Code */}
      <div className="flex justify-center mb-4 sm:mb-6">
        <div className="qr-container">
          <QRCodeSVG
            value={paymentRequest.paymentUri}
            size={160}
            className="sm:w-[200px] sm:h-[200px]"
            bgColor="#FFFFFF"
            fgColor="#000000"
            level="M"
          />
        </div>
      </div>

      {/* Payment Details */}
      <div className="space-y-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Amount:</span>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formatBtc(paymentRequest.amount)} BTC
              </p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Label:</span>
              <p className="font-semibold text-gray-900 dark:text-white">
                {paymentRequest.label || 'Payment Request'}
              </p>
            </div>
            {paymentRequest.message && (
              <div className="sm:col-span-2">
                <span className="text-gray-500 dark:text-gray-400">Message:</span>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {paymentRequest.message}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Address Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Bitcoin Address
        </label>
        <div className="flex sm:flex-row items-stretch gap-2">
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={paymentRequest.address}
              readOnly
              className="form-input font-mono text-xs sm:text-sm"
            />
          </div>
          <button
            onClick={() => copyToClipboard(paymentRequest.address, 'address')}
            className="btn-secondary p-3 flex-shrink-0 self-stretch sm:self-auto"
            title="Copy address"
          >
            {copied === 'address' ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Payment URI Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Payment URI (BIP21)
        </label>
        <div className="flex sm:flex-row items-stretch gap-2">
          <div className="flex-1 min-w-0">
            <input
              value={paymentRequest.paymentUri}
              readOnly
              className="form-input font-mono text-xs sm:text-sm resize-none sm:rows-3"
            />
          </div>
          <button
            onClick={() => copyToClipboard(paymentRequest.paymentUri, 'uri')}
            className="btn-secondary p-3 flex-shrink-0 self-stretch sm:self-auto"
            title="Copy payment URI"
          >
            {copied === 'uri' ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={openInWallet}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          Open in Wallet
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <h3 className="text-sm font-medium text-yellow-900 dark:text-yellow-300 mb-2">
          Payment Instructions
        </h3>
        <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
          <li>• Scan the QR code with any Bitcoin wallet app</li>
          <li>• Or copy the address/URI to send manually</li>
          <li>• Send exactly {formatBtc(paymentRequest.amount)} BTC to complete the payment</li>
          <li>• You&apos;ll be notified when the payment is received</li>
        </ul>
      </div>
    </div>
  );
} 