import { AlertCircle, Plus, RefreshCw } from "lucide-react";
import { useApp } from "@/components";

type ControllButtonsProps = {
  isPolling: boolean;
  stopPolling: () => void;
  startPolling: () => void;
  resetPolling: () => void;
}

export function ControllButtons({ isPolling, stopPolling, startPolling, resetPolling }: ControllButtonsProps) {
  const { setState, setPaymentRequest } = useApp();

  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
      {isPolling ? (
        <button
          onClick={stopPolling}
          className="btn-secondary flex items-center justify-center gap-2"
        >
          <AlertCircle className="w-4 h-4" />
          Stop
        </button>
      ) : (
        <button
          onClick={startPolling}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Resume
        </button>
      )}

      <button
        onClick={resetPolling}
        className="btn-secondary flex items-center justify-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        Reset
      </button>

      <button
        onClick={() => {
          setState('form');
          setPaymentRequest(null);
        }}
        className="btn-secondary flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Request
      </button>
    </div>
  )
}
