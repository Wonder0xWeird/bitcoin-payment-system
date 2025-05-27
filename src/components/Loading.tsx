import { Loader2 } from "lucide-react";

export function Loading() {
  return (
    <div className="card text-center">
      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-500" />
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Generating Wallet...
      </h2>
      <p className="text-gray-600 dark:text-gray-300">
        Creating a new HD wallet for Bitcoin testnet
      </p>
    </div>
  );
}