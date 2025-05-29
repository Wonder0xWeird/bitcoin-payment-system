import { useEffect } from "react";
import { useApp } from "../ApplicationProvider";
import { ApiResponse, PublicWalletInfo } from "@/lib/types";
import { Wallet, Plus } from "lucide-react";
import toast from "react-hot-toast";

export function Profile() {

  const { state, wallet, setWallet, setPaymentRequest, setState, setAppError } = useApp();

  // Generate wallet immediately on component mount for demo purposes
  // In production, we would first authenticate the user and then fetch their wallet info
  useEffect(() => { getWallet() }, []);

  const getWallet = async () => {
    try {
      setWallet(null);
      setPaymentRequest(null);
      setState('loading');
      const response = await fetch('/api/wallet', { method: 'POST' });
      const data: ApiResponse<PublicWalletInfo> = await response.json();

      if (data.success) {
        setWallet(data.data);
        setState('form');
        toast.success('New wallet generated!', { icon: '🔑' });
      } else {
        throw new Error(data.error || 'Failed to generate wallet');
      }
    } catch (error: unknown) {
      console.error('Error generating wallet:', error);
      toast.error('Failed to generate wallet. Please try again.');
      setAppError(error instanceof Error ? error.message : 'Failed to generate wallet');
      setState('error');
    }
  };

  return (
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
        onClick={getWallet}
        className="btn-secondary text-xs sm:text-sm py-2 px-2 sm:px-3 relative"
        disabled={state === 'loading'}
      >
        <Wallet className="w-6 h-6" />
        <Plus className="w-6 h-6 absolute top-0 right-0" />
      </button>
    </div>
  );
}

