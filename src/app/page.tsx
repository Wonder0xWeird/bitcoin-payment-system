'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ApiResponse, PaymentRequest, PaymentRequestPayload, PaymentStatus, WalletInfo } from '@/lib/types';
import { Header, Footer, Loading, PaymentInfo, PaymentMonitor, PaymentForm, ErrorInfo } from '@/components';

export type AppState = 'loading' | 'form' | 'qr' | 'monitoring' | 'error';

export default function Home() {
  const [state, setState] = useState<AppState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
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
      const data: ApiResponse<WalletInfo> = await response.json();

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
      setError(error instanceof Error ? error.message : 'Failed to generate wallet');
      setState('error');
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

      const data: ApiResponse<PaymentRequestPayload> = await response.json();

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
      setError(error instanceof Error ? error.message : 'Failed to create payment request');
      setState('error');
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
    <div className="app-container">
      <Header state={state} wallet={wallet} handleNewWallet={handleNewWallet} />

      {/* Main Content */}
      <main className="app-content">
        {state === 'loading' && <Loading />}

        {state === 'form' && wallet && <PaymentForm onSubmit={handlePaymentSubmit} isLoading={isCreatingPayment} />}

        {state === 'qr' && paymentRequest && (
          <PaymentInfo
            paymentRequest={paymentRequest}
            paymentUri={paymentUri}
            handleBackToForm={handleBackToForm}
            handleStartMonitoring={handleStartMonitoring}
          />
        )}

        {state === 'monitoring' && paymentRequest && (
          <PaymentMonitor
            setState={setState}
            paymentRequest={paymentRequest}
            paymentUri={paymentUri}
            handleBackToForm={handleBackToForm}
            handlePaymentReceived={handlePaymentReceived}
          />
        )}

        {state === 'error' && <ErrorInfo error={error || 'An unknown error occurred'} />}
      </main>

      <Footer />
    </div>
  );
}
