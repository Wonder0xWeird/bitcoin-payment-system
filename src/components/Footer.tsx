export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12 bottom-0 w-full">
      <div className="text-center text-sm text-gray-600 dark:text-gray-300 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <p>
          Bitcoin Payment System • Testnet Only • Built with Next.js & Mempool API
        </p>
        <p className="mt-1">
          ⚠️ This is for testing purposes only. Do not use with real Bitcoin. ⚠️
        </p>
      </div>
    </footer>
  );
}