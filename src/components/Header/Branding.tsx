import Image from 'next/image';

export function Branding() {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg">
        <Image
          src="/blockchain-com-logo.svg"
          alt="Blockchain.com Logo"
          width={200}
          height={200}
          priority
        />
      </div>
      <div>
        <h2 className="text-md font-semibold text-gray-900 dark:text-white whitespace-nowrap">
          <span className="hidden sm:inline">BTC Pay App</span>
          <span className="sm:hidden">BTC Pay</span>
        </h2>
        <p className="text-xs text-gray-600 dark:text-gray-300">
          <span className="hidden sm:inline">Bitcoin Testnet4</span>
          <span className="sm:hidden">Testnet4</span>
        </p>
      </div>
    </div>
  );
}
