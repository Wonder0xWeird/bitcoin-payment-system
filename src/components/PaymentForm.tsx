'use client';

import { useState } from 'react';
import { Loader2, Bitcoin } from 'lucide-react';
import { sanitizeAmountInput, validatePaymentAmount } from '@/lib/utils/validation';

interface PaymentFormProps {
  onSubmit: (amount: number) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function PaymentForm({ onSubmit, isLoading = false, disabled = false }: PaymentFormProps) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = sanitizeAmountInput(e.target.value);
    setAmount(sanitizedValue);

    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount.trim()) {
      setError('Please enter an amount');
      return;
    }

    const validation = validatePaymentAmount(amount);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid amount');
      return;
    }

    const numAmount = parseFloat(amount);
    onSubmit(numAmount);
  };

  // Preset amount buttons for convenience
  const presetAmounts = [0.0001, 0.001, 0.01, 0.1, 1];

  const handlePresetClick = (presetAmount: number) => {
    setAmount(presetAmount.toString());
    setError(null);
  };

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg self-start sm:self-auto">
          <Bitcoin className="w-6 h-6 text-orange-600 dark:text-orange-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            Create Payment Request
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Enter the amount of Bitcoin you want to receive
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Amount (BTC)
          </label>
          <div className="relative">
            <input
              id="amount"
              type="text"
              value={amount}
              onChange={handleAmountChange}
              placeholder="0.00000000"
              className={`form-input pr-16 ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
              disabled={disabled || isLoading}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">BTC</span>
            </div>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>

        {/* Preset Amount Buttons */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Quick amounts
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {presetAmounts.map((presetAmount) => (
              <button
                key={presetAmount}
                type="button"
                onClick={() => handlePresetClick(presetAmount)}
                className="btn-secondary text-xs sm:text-sm py-2 px-2 sm:px-3"
                disabled={disabled || isLoading}
              >
                {presetAmount} BTC
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={disabled || isLoading || !amount.trim()}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Payment Request...
              </>
            ) : (
              <>
                <Bitcoin className="w-4 h-4" />
                Create Payment Request
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
          How it works
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• Enter the amount of Bitcoin you want to receive</li>
          <li>• A QR code will be generated for easy sharing</li>
          <li>• The system will monitor for incoming payments</li>
          <li>• You&apos;ll be notified when payment is received</li>
        </ul>
      </div>
    </div>
  );
} 