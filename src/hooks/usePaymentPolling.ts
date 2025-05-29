import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { PaymentRequest, PaymentReceipt, ApiResponse } from '@/lib/types';

interface PaymentPollingResult {
  receipt: PaymentReceipt | null;
  isPolling: boolean;
  pollError: string | null;
  attempts: number;
  maxAttempts: number;
  currentInterval: number;
  isRateLimited: boolean;
  nextAttemptIn?: number;
  startPolling: () => void;
  stopPolling: () => void;
  resetPolling: () => void;
}

export function usePaymentPolling(paymentRequest: PaymentRequest | null): PaymentPollingResult {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const maxAttempts = 180;
  const baseInterval = 60000;

  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollError, setPollError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [currentInterval, setCurrentInterval] = useState(baseInterval);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [nextAttemptIn, setNextAttemptIn] = useState<number | undefined>();

  // Auto-start polling on mount, cleanup on unmount
  useEffect(() => {
    startPolling();
    return () => resetPolling();
  }, []);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setNextAttemptIn(undefined);
  }, []);

  const resetPolling = useCallback(() => {
    stopPolling();
    setReceipt(null);
    setPollError(null);
    setAttempts(0);
    setCurrentInterval(baseInterval);
    setIsRateLimited(false);
    setNextAttemptIn(undefined);
  }, []);

  const startCountdown = useCallback((delayMs: number) => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }

    const remainingSeconds = Math.ceil(delayMs / 1000);
    setNextAttemptIn(remainingSeconds);

    countdownRef.current = setInterval(() => {
      setNextAttemptIn(prev => {
        const newValue = (prev || 0) - 1;
        if (newValue > 0) return newValue;
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
        return undefined;
      });
    }, 1000);
  }, []);

  const checkPaymentStatus = useCallback(async () => {
    if (!paymentRequest) return;
    try {
      const params = new URLSearchParams({
        address: paymentRequest.address,
        amount: paymentRequest.amount.toString(),
        createdAt: paymentRequest.createdAt instanceof Date
          ? paymentRequest.createdAt.toISOString()
          : new Date(paymentRequest.createdAt).toISOString()
      });

      const response = await fetch(`/api/status?${params}`);
      const data: ApiResponse<PaymentReceipt> = await response.json();

      if (data.success) {
        setReceipt(data.data);
        setPollError(null);
        setIsRateLimited(false);

        if (currentInterval !== baseInterval) {
          setCurrentInterval(baseInterval);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = setInterval(checkPaymentStatus, currentInterval);
          }
        }

        if (data.data?.confirmed) {
          stopPolling();
          toast.success('Payment received!', { icon: '₿' });
        }
      } else {
        if (response.status === 429) {
          // Note: In production, we would likely use a persistent server (i.e. not Next.js/Vercel serverless)
          // to manage rate limiting more effectively but for demo purposes we pass the rate limit
          // info back to the client to handle for polling demo

          setIsRateLimited(true);
          const retryAfter = data.retryAfter ? data.retryAfter * 1000 : currentInterval * 2; // Exponential backoff

          setCurrentInterval(retryAfter);
          startCountdown(retryAfter);

          console.warn(`⚠️ Rate limited. Waiting ${retryAfter / 1000}s before next attempt.`);
          toast.error(`Rate limited. Waiting ${retryAfter / 1000}s before next attempt.`);

          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }

          intervalRef.current = setInterval(checkPaymentStatus, retryAfter);
        } else {
          throw new Error(data.error || 'Failed to check payment status');
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setPollError(errorMessage);
      toast.error(`Payment monitoring error: ${errorMessage}`);
    }

    setAttempts(prev => prev + 1);
  }, [paymentRequest, currentInterval]);

  const startPolling = useCallback(() => {
    if (isPolling || !paymentRequest) return;

    setIsPolling(true);
    setPollError(null);
    setAttempts(0);
    setIsRateLimited(false);
    setCurrentInterval(baseInterval);

    checkPaymentStatus();
    intervalRef.current = setInterval(checkPaymentStatus, baseInterval);
  }, [paymentRequest, checkPaymentStatus]);


  // Stop polling if max attempts reached
  useEffect(() => {
    if (isPolling && attempts >= maxAttempts) {
      stopPolling();
      setPollError('Maximum polling attempts reached');
      toast.error(`Payment monitoring timed out`);
    }
  }, [attempts, isPolling]);

  return {
    receipt,
    isPolling,
    pollError,
    attempts,
    maxAttempts,
    currentInterval,
    isRateLimited,
    nextAttemptIn,
    startPolling,
    stopPolling,
    resetPolling
  };
} 