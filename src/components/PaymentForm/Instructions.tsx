export function Instructions() {
  return (
    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
      <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
        How it works
      </h3>
      <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
        <li>• Enter the amount of Bitcoin you want to receive</li>
        <li>• A QR code will be generated for easy sharing</li>
        <li>• The system will monitor for incoming payments</li>
        <li>• You&apos;ll be notified when payment is received</li>
        <li>• For more info on setup and testing see the <a href="https://github.com/Wonder0xWeird/bitcoin-payment-system" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600 dark:hover:text-blue-200">README</a></li>
      </ul>
    </div>
  );
}

