'use client';

type HeaderProps = {
  amount: string,
  handleAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  formError: string | null,
  isCreatingPayment: boolean
}

export function Header({ amount, handleAmountChange, formError, isCreatingPayment }: HeaderProps) {
  return (
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
          className={`form-input pr-16 ${formError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
          disabled={isCreatingPayment}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">BTC</span>
        </div>
      </div>
      {formError && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formError}</p>
      )}
    </div>
  );
}
