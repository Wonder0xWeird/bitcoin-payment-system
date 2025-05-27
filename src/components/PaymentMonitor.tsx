import { ArrowLeft } from "lucide-react";
import { PaymentRequest, PaymentStatus } from "@/lib/types";
import { StatusMonitor } from "./StatusMonitor";
import { AppState } from "@/app/page";

export function PaymentMonitor({
  setState,
  paymentRequest,
  paymentUri,
  handleBackToForm,
  handlePaymentReceived
}: {
  setState: (state: AppState) => void,
  paymentRequest: PaymentRequest,
  paymentUri: string,
  handleBackToForm: () => void,
  handlePaymentReceived: (status: PaymentStatus) => void
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setState('qr')}
          className="btn-secondary p-2"
          title="Back to QR code"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Payment Monitoring
        </h2>
      </div>

      <StatusMonitor
        paymentRequest={paymentRequest}
        paymentUri={paymentUri}
        onPaymentReceived={handlePaymentReceived}
      />

      <div className="text-center">
        <button
          onClick={handleBackToForm}
          className="btn-secondary"
        >
          Create New Payment Request
        </button>
      </div>
    </div>
  );
}