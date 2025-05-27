'use client';

import { useState, useEffect } from 'react';
import { PaymentForm } from '@/components/PaymentForm';
import { QRDisplay } from '@/components/QRDisplay';
import { StatusMonitor } from '@/components/StatusMonitor';
import { ApiResponse, HDWallet, PaymentRequest, PaymentStatus } from '@/lib/types';
import { Wallet, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

type AppState = 'loading' | 'form' | 'qr' | 'monitoring';

export default function Home() {
  const [state, setState] = useState<AppState>('loading');
  const [wallet, setWallet] = useState<HDWallet | null>(null);
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [paymentUri, setPaymentUri] = useState<string>('');
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);

  // Generate wallet on component mount
  useEffect(() => {
    generateWallet();
  }, []);

  const generateWallet = async () => {
    try {
      setState('loading');
      const response = await fetch('/api/wallet', { method: 'POST' });
      const data: ApiResponse<HDWallet> = await response.json();

      if (data.success) {
        setWallet(data.data);
        setState('form');
        toast.success('New wallet generated!', {
          icon: '🔑',
          duration: 3000,
        });
      } else {
        throw new Error(data.error || 'Failed to generate wallet');
      }
    } catch (error) {
      console.error('Error generating wallet:', error);
      toast.error('Failed to generate wallet. Please try again.');
      setState('form');
    }
  };

  const handlePaymentSubmit = async (amount: number) => {
    if (!wallet) {
      toast.error('No wallet available. Please generate a new wallet.');
      return;
    }

    try {
      setIsCreatingPayment(true);

      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: wallet.address,
          amount,
          label: 'Bitcoin Payment Request',
          message: 'Payment request created via Bitcoin Payment System'
        }),
      });

      const data: ApiResponse<{
        paymentRequest: PaymentRequest;
        paymentUri: string;
      }> = await response.json();

      if (data.success) {
        setPaymentRequest(data.data.paymentRequest);
        setPaymentUri(data.data.paymentUri);
        setState('monitoring'); // Auto-start monitoring instead of showing QR first
        toast.success('Payment request created! Monitoring for payments...', {
          icon: '📱',
          duration: 3000,
        });
      } else {
        throw new Error(data.error || 'Failed to create payment request');
      }
    } catch (error) {
      console.error('Error creating payment request:', error);
      toast.error('Failed to create payment request. Please try again.');
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const handleStartMonitoring = () => {
    setState('monitoring');
  };

  const handlePaymentReceived = (status: PaymentStatus) => {
    // Payment completed successfully
    toast.success(`Payment of ${status.receivedAmount} BTC received!`, {
      icon: '✅',
      duration: 6000,
    });
  };

  const handleBackToForm = () => {
    setPaymentRequest(null);
    setPaymentUri('');
    setState('form');
  };

  const handleNewWallet = () => {
    setWallet(null);
    setPaymentRequest(null);
    setPaymentUri('');
    generateWallet();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Wallet className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Bitcoin Payment System
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Testnet • Real-time Monitoring
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {wallet && (
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Current Address:</p>
                  <p className="text-xs font-mono text-gray-900 dark:text-white truncate max-w-xs">
                    {wallet.address}
                  </p>
                </div>
              )}
              <button
                onClick={handleNewWallet}
                className="btn-secondary text-xs sm:text-sm py-2 px-2 sm:px-3"
                disabled={state === 'loading'}
              >
                New Wallet
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {state === 'loading' && (
          <div className="card text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Generating Wallet...
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Creating a new HD wallet for Bitcoin testnet
            </p>
          </div>
        )}

        {state === 'form' && wallet && (
          <PaymentForm
            onSubmit={handlePaymentSubmit}
            isLoading={isCreatingPayment}
          />
        )}

        {state === 'qr' && paymentRequest && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToForm}
                className="btn-secondary p-2"
                title="Back to form"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Payment Request
              </h2>
            </div>

            <QRDisplay
              paymentRequest={paymentRequest}
              paymentUri={paymentUri}
            />

            <div className="text-center">
              <button
                onClick={handleStartMonitoring}
                className="btn-primary"
              >
                Start Payment Monitoring
              </button>
            </div>
          </div>
        )}

        {state === 'monitoring' && paymentRequest && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setState('qr')}
                className="btn-secondary p-2"
                title="Back to QR code"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Payment Monitoring
              </h2>
            </div>

            <StatusMonitor
              paymentRequest={paymentRequest}
              paymentUri={paymentUri}
              onPaymentReceived={handlePaymentReceived}
            />

            <div className="text-center">
              <button
                onClick={handleBackToForm}
                className="btn-secondary"
              >
                Create New Payment Request
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600 dark:text-gray-300">
            <p>
              Bitcoin Payment System • Testnet Only • Built with Next.js & BlockCypher API
            </p>
            <p className="mt-1">
              ⚠️ This is for testing purposes only. Do not use with real Bitcoin.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
