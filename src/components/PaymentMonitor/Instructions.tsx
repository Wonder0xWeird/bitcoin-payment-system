type InstructionsProps = {
  currentInterval: number;
  isRateLimited: boolean;
}

export function Instructions({ currentInterval, isRateLimited }: InstructionsProps) {
  return (
    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
      <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
        How Payment Detection Works
      </h3>
      <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
        <li>• Bitcoin Testnet4 is checked every {currentInterval / 1000} seconds</li>
        <li>• Only recent payment transactions are returned</li>
        <li>• Payments must match the exact amount requested</li>
        <li>• You&apos;ll be notified instantly when your payment is confirmed</li>
        {isRateLimited && <li>• Intervals increase automatically when rate limited</li>}
      </ul>
    </div>
  )
}
