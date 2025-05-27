import { ArrowLeft } from "lucide-react";
import { QRDisplay } from "./QRDisplay";
import { PaymentRequest } from "@/lib/types";

export function PaymentInfo({
  paymentRequest,
  paymentUri,
  handleBackToForm,
  handleStartMonitoring
}: {
  paymentRequest: PaymentRequest,
  paymentUri: string,
  handleBackToForm: () => void,
  handleStartMonitoring: () => void
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={handleBackToForm}
          className="btn-secondary p-2"
          title="Back to form"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Payment Request
        </h2>
      </div>

      <QRDisplay
        paymentRequest={paymentRequest}
        paymentUri={paymentUri}
      />

      <div className="text-center">
        <button
          onClick={handleStartMonitoring}
          className="btn-primary"
        >
          Start Payment Monitoring
        </button>
      </div>
    </div>
  );
}