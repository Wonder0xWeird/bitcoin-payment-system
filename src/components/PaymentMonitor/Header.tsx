import { RefreshCw } from "lucide-react";

type HeaderProps = {
  isPolling: boolean;
}

export function Header({ isPolling }: HeaderProps) {
  return (<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
    <div className="min-w-0 flex-1">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
        Payment Monitor
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
  </div>)
}

