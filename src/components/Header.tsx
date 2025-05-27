import { AppState } from "@/app/page";
import { WalletInfo } from "@/lib/types";

export function Header({ state, wallet, handleNewWallet }: { state: AppState, wallet: WalletInfo | null, handleNewWallet: () => void }) {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg">
              <img
                src="/blockchain-com-logo.svg"
                alt="Blockchain.com Logo"
                width={150}
                height={150}
              />
            </div>
            <div>
              <h2 className="text-md font-semibold text-gray-900 dark:text-white">
                $BTC Pay
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Testnet
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {wallet && (
              <div className="text-right hidden sm:block">
                <p className="text-xs text-gray-500 dark:text-gray-400">Current Address:</p>
                <p className="text-xs font-mono text-gray-900 dark:text-white truncate max-w-xs">
                  {wallet.address}
                </p>
              </div>
            )}
            <button
              onClick={handleNewWallet}
              className="btn-secondary text-xs sm:text-sm py-2 px-2 sm:px-3"
              disabled={state === 'loading'}
            >
              New Wallet
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}