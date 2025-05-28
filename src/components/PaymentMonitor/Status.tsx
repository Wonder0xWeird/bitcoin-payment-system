import { PaymentReceipt } from "@/lib/types";
import { formatBtc } from "@/lib/utils/bitcoin";
import { CheckCircle, Clock, ExternalLink } from "lucide-react";

type StatusProps = {
  receipt: PaymentReceipt | null;
  isPolling: boolean;
  attempts: number;
  maxAttempts: number;
  currentInterval: number;
  isRateLimited: boolean;
  nextAttemptIn: number | undefined;
}

export function Status({ receipt, isPolling, attempts, currentInterval, isRateLimited, nextAttemptIn, maxAttempts }: StatusProps) {
  const getConfirmationIcon = () => {
    if (!receipt || !receipt.confirmed) return <Clock className="w-5 h-5 text-yellow-500 self-start mt-1" />;
    return <CheckCircle className="w-5 h-5 text-green-500 self-start mt-1" />;
  };

  const getConfirmationText = () => {
    if (!receipt || !receipt.confirmed) return 'Payment pending...';
    return 'Payment confirmed!';
  };

  const getConfirmationColor = () => {
    if (!receipt || !receipt.confirmed) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
  };

  const openTransaction = () => {
    if (receipt?.transactionId) window.open(`https://mempool.space/testnet4/tx/${receipt.transactionId}`, '_blank');
  };

  if (!receipt && !isPolling) return null;

  return (<div className={`rounded-lg border-2 p-4 sm:p-6 mb-6 ${getConfirmationColor()}`}>
    <div className="flex items-center gap-3">
      {getConfirmationIcon()}
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
          {getConfirmationText()}
        </h3>

        {isPolling && (
          <>
            {isRateLimited ? (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                {nextAttemptIn
                  ? `Rate limited. Next check in ${nextAttemptIn}s...`
                  : `Rate limited. Waiting to resume...`
                }
              </p>
            ) : (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Checking every {currentInterval / 1000}s...
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  (Attempt {attempts} of {maxAttempts})
                </p>
              </>
            )}
          </>
        )}

        {receipt && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Status:</span>
                <p className={`font-semibold ${receipt.confirmed ? 'text-green-700 dark:text-green-300' : 'text-orange-500 dark:text-orange-300'}`}>
                  {receipt.confirmed ? 'Confirmed' : 'Unconfirmed'}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                <p className={`font-semibold ${receipt.confirmed ? 'text-green-700 dark:text-green-300' : 'text-orange-500 dark:text-orange-300'}`}>
                  {formatBtc(receipt.amount)} BTC
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Confirmations:</span>
                <p className={`font-semibold ${receipt.confirmed ? 'text-green-700 dark:text-green-300' : 'text-orange-500 dark:text-orange-300'}`}>
                  {receipt.confirmations || 0}
                </p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-gray-500 dark:text-gray-400">{receipt.confirmed ? 'Received:' : 'Checked:'}</span>
                <p className={`font-semibold ${receipt.confirmed ? 'text-green-700 dark:text-green-300' : 'text-orange-500 dark:text-orange-300'}`}>
                  {new Date(receipt.timestamp * 1000).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={openTransaction}
                className="btn-secondary flex items-center gap-2 text-sm w-full justify-center"
              >
                <ExternalLink className="w-4 h-4" />
                View Transaction
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>)
}

