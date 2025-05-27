import { useState, useEffect, useCallback, useRef } from 'react';
import { PaymentRequest, PaymentStatus, ApiResponse, RateLimitError } from '@/lib/types';

interface PaymentPollingOptions {
  enabled: boolean;
  interval: number; // in milliseconds
  maxAttempts?: number;
  onPaymentReceived?: (status: PaymentStatus) => void;
  onError?: (error: string) => void;
  onRateLimit?: (rateLimitInfo: RateLimitError) => void;
}

interface PaymentPollingResult {
  status: PaymentStatus | null;
  isPolling: boolean;
  error: string | null;
  attempts: number;
  currentInterval: number;
  isRateLimited: boolean;
  nextAttemptIn?: number;
  startPolling: () => void;
  stopPolling: () => void;
  resetPolling: () => void;
}

export function usePaymentPolling(
  paymentRequest: PaymentRequest | null,
  options: PaymentPollingOptions
): PaymentPollingResult {
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [currentInterval, setCurrentInterval] = useState(options.interval);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [nextAttemptIn, setNextAttemptIn] = useState<number | undefined>();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const maxAttempts = options.maxAttempts || 360; // 1 hour at 10-second intervals
  const baseInterval = options.interval;
  const maxInterval = 60000; // Maximum 60 seconds between requests

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
    setStatus(null);
    setError(null);
    setAttempts(0);
    setCurrentInterval(baseInterval);
    setIsRateLimited(false);
    setNextAttemptIn(undefined);
  }, [stopPolling, baseInterval]);

  // Start countdown for next attempt
  const startCountdown = useCallback((delayMs: number) => {
    let remainingSeconds = Math.ceil(delayMs / 1000);
    setNextAttemptIn(remainingSeconds);

    countdownRef.current = setInterval(() => {
      remainingSeconds -= 1;
      setNextAttemptIn(remainingSeconds);

      if (remainingSeconds <= 0) {
        setNextAttemptIn(undefined);
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
      }
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
      const data: ApiResponse<PaymentStatus> = await response.json();

      if (response.status === 429) {
        // Handle rate limiting
        setIsRateLimited(true);
        const rateLimitInfo = (data as { success: false; error: string; rateLimitInfo?: RateLimitError }).rateLimitInfo;

        if (rateLimitInfo) {
          const retryDelay = rateLimitInfo.retryAfter ? rateLimitInfo.retryAfter * 1000 :
            Math.min(currentInterval * 2, maxInterval); // Exponential backoff

          setCurrentInterval(retryDelay);
          startCountdown(retryDelay);

          console.warn(`⚠️ Rate limited. Waiting ${retryDelay / 1000}s before next attempt.`);
          options.onRateLimit?.(rateLimitInfo);

          // Clear the interval and set a new one with the backoff delay
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }

          setTimeout(() => {
            if (isPolling) {
              setIsRateLimited(false);
              intervalRef.current = setInterval(checkPaymentStatus, retryDelay);
            }
          }, retryDelay);

          return; // Don't increment attempts for rate limit
        }
      }

      if (data.success) {
        setStatus(data.data);
        setError(null);
        setIsRateLimited(false);

        // Reset to base interval on successful request
        if (currentInterval !== baseInterval) {
          setCurrentInterval(baseInterval);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = setInterval(checkPaymentStatus, baseInterval);
          }
        }

        // If payment is confirmed, stop polling and notify
        if (data.data.status === 'confirmed') {
          stopPolling();
          options.onPaymentReceived?.(data.data);
        } else if (data.data.status === 'failed') {
          stopPolling();
          setError('Payment failed or timed out');
          options.onError?.('Payment failed or timed out');
        }
      } else {
        throw new Error(data.error || 'Failed to check payment status');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      options.onError?.(errorMessage);

      // If we've reached max attempts, stop polling
      if (attempts >= maxAttempts) {
        stopPolling();
      }
    }

    setAttempts(prev => prev + 1);
  }, [
    paymentRequest,
    attempts,
    maxAttempts,
    options,
    stopPolling,
    currentInterval,
    baseInterval,
    maxInterval,
    isPolling,
    startCountdown
  ]);

  const startPolling = useCallback(() => {
    if (!paymentRequest || isPolling) return;

    setIsPolling(true);
    setError(null);
    setAttempts(0);
    setIsRateLimited(false);
    setCurrentInterval(baseInterval);

    // Check immediately
    checkPaymentStatus();

    // Set up interval for periodic checks
    intervalRef.current = setInterval(checkPaymentStatus, currentInterval);
  }, [paymentRequest, isPolling, checkPaymentStatus, currentInterval, baseInterval]);

  // Auto-start polling when enabled and payment request is available
  useEffect(() => {
    if (options.enabled && paymentRequest && !isPolling) {
      startPolling();
    } else if (!options.enabled && isPolling) {
      stopPolling();
    }
  }, [options.enabled, paymentRequest, isPolling, startPolling, stopPolling]);

  // Stop polling if max attempts reached
  useEffect(() => {
    if (attempts >= maxAttempts && isPolling) {
      stopPolling();
      setError('Maximum polling attempts reached');
      options.onError?.('Payment monitoring timed out');
    }
  }, [attempts, maxAttempts, isPolling, stopPolling, options]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    status,
    isPolling,
    error,
    attempts,
    currentInterval,
    isRateLimited,
    nextAttemptIn,
    startPolling,
    stopPolling,
    resetPolling
  };
} 