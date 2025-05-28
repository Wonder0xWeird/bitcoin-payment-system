import { Bitcoin } from "lucide-react";

export function Title() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
      <Bitcoin className="w-10 h-10 text-orange-600 dark:text-orange-400" />
      <div className="min-w-0 flex-1">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          Create Payment Request
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
          Enter the amount of Testnet4 Bitcoin you want to receive
        </p>
      </div>
    </div>
  );
}
