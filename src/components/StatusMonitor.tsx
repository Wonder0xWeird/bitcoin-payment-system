'use client';

// useEffect import removed as it's not used
import { CheckCircle, Clock, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { PaymentRequest, PaymentStatus } from '@/lib/types';
import { usePaymentPolling } from '@/hooks/usePaymentPolling';
import { formatBtc } from '@/lib/utils/bitcoin';
import toast from 'react-hot-toast';
import { QRDisplay } from './QRDisplay';

interface StatusMonitorProps {
  paymentRequest: PaymentRequest;
  paymentUri: string;
  onPaymentReceived?: (status: PaymentStatus) => void;
}

export function StatusMonitor({ paymentRequest, paymentUri, onPaymentReceived }: StatusMonitorProps) {
  const {
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
  } = usePaymentPolling(paymentRequest, {
    enabled: true,
    interval: 10000, // 10 seconds
    maxAttempts: 360, // 1 hour
    onPaymentReceived: (status) => {
      toast.success('Payment received!', {
        duration: 5000,
        icon: '₿',
      });
      onPaymentReceived?.(status);
    },
    onError: (error) => {
      toast.error(`Payment monitoring error: ${error}`, {
        duration: 4000,
      });
    },
    onRateLimit: (rateLimitInfo) => {
      toast.error(`Rate limited by API. ${rateLimitInfo.retryAfter ? `Waiting ${rateLimitInfo.retryAfter}s` : 'Slowing down requests'}`, {
        duration: 6000,
        icon: '⏰',
      });
    }
  });

  const getStatusIcon = () => {
    if (!status) {
      return <Clock className="w-5 h-5 text-yellow-500" />;
    }

    switch (status.status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    if (!status) {
      return 'Waiting for payment...';
    }

    switch (status.status) {
      case 'confirmed':
        return 'Payment confirmed!';
      case 'pending':
        return 'Waiting for payment...';
      case 'failed':
        return 'Payment failed or timed out';
      default:
        return 'Unknown status';
    }
  };

  const getStatusColor = () => {
    if (!status) {
      return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    }

    switch (status.status) {
      case 'confirmed':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'pending':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'failed':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  const openTransaction = () => {
    if (status?.transactionId) {
      const url = `https://live.blockcypher.com/btc-testnet/tx/${status.transactionId}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            Payment Status
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Monitoring for incoming payments
          </p>
        </div>
        {isPolling && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
            <span className="text-sm text-blue-500 sm:hidden">Monitoring...</span>
          </div>
        )}
      </div>

      {/* Status Card */}
      <div className={`rounded-lg border-2 p-6 mb-6 ${getStatusColor()}`}>
        <div className="flex items-center gap-3 mb-4">
          {getStatusIcon()}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {getStatusText()}
            </h3>
            {isPolling && (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {isRateLimited ? (
                  nextAttemptIn ? (
                    `Rate limited. Next check in ${nextAttemptIn}s...`
                  ) : (
                    `Rate limited. Waiting to resume...`
                  )
                ) : (
                  `Checking every ${currentInterval / 1000}s... (Attempt ${attempts}/360)`
                )}
              </p>
            )}
          </div>
        </div>

        {status && status.status === 'confirmed' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Amount Received:</span>
                <p className="font-semibold text-green-700 dark:text-green-300">
                  {formatBtc(status.receivedAmount || status.amount)} BTC
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Confirmations:</span>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {status.confirmations || 0}
                </p>
              </div>
              {status.receivedAt && (
                <div className="sm:col-span-2">
                  <span className="text-gray-500 dark:text-gray-400">Received at:</span>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {status.receivedAt instanceof Date
                      ? status.receivedAt.toLocaleString()
                      : new Date(status.receivedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {status.transactionId && (
              <div className="mt-4">
                <button
                  onClick={openTransaction}
                  className="btn-secondary flex items-center gap-2 text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Transaction
                </button>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}
      </div>

      {/* QR Code Display */}
      <div className="mb-6">
        <QRDisplay
          paymentRequest={paymentRequest}
          paymentUri={paymentUri}
        />
      </div>

      {/* Payment Details Summary */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
          Payment Details
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Expected Amount:</span>
            <p className="font-semibold text-gray-900 dark:text-white">
              {formatBtc(paymentRequest.amount)} BTC
            </p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Created:</span>
            <p className="font-semibold text-gray-900 dark:text-white">
              {paymentRequest.createdAt instanceof Date
                ? paymentRequest.createdAt.toLocaleString()
                : new Date(paymentRequest.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="sm:col-span-2">
            <span className="text-gray-500 dark:text-gray-400">Address:</span>
            <p className="font-mono text-xs text-gray-900 dark:text-white break-all">
              {paymentRequest.address}
            </p>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {isPolling ? (
          <button
            onClick={stopPolling}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <AlertCircle className="w-4 h-4" />
            Stop Monitoring
          </button>
        ) : (
          <button
            onClick={startPolling}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Resume Monitoring
          </button>
        )}

        <button
          onClick={resetPolling}
          className="btn-secondary flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reset Status
        </button>
      </div>

      {/* Rate Limit Warning */}
      {isRateLimited && (
        <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <h3 className="text-sm font-medium text-orange-900 dark:text-orange-300 mb-2">
            ⚠️ Rate Limit Active
          </h3>
          <p className="text-sm text-orange-800 dark:text-orange-300">
            API requests are being limited. Monitoring will continue automatically with longer intervals between checks.
            {nextAttemptIn && ` Next check in ${nextAttemptIn} seconds.`}
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
          How Payment Detection Works
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• We check the Bitcoin testnet every {currentInterval / 1000} seconds</li>
          <li>• Only confirmed transactions are accepted</li>
          <li>• Payments must match the exact amount requested</li>
          <li>• You&apos;ll be notified instantly when payment arrives</li>
          {isRateLimited && <li>• Intervals increase automatically when rate limited</li>}
        </ul>
      </div>
    </div>
  );
} 