
type PresetAmountsProps = {
  isCreatingPayment: boolean
  setAmount: (amount: string) => void,
  setFormError: (error: string | null) => void,
}

export function PresetAmounts({ isCreatingPayment, setAmount, setFormError }: PresetAmountsProps) {
  const presetAmounts = [0.0001, 0.001, 0.01, 0.1, 1, 10, 100, 1000];

  const handlePresetClick = (presetAmount: number) => {
    setAmount(presetAmount.toString());
    setFormError(null);
  };

  return (
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
            disabled={isCreatingPayment}
          >
            {presetAmount} BTC
          </button>
        ))}
      </div>
    </div>
  );
}
