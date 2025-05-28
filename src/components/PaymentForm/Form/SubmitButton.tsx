import { Loader2, Bitcoin } from "lucide-react";

type SubmitButtonProps = {
  isCreatingPayment: boolean,
  amount: string,
}

export function SubmitButton({ isCreatingPayment, amount }: SubmitButtonProps) {
  return (
    <div className="pt-4">
      <button
        type="submit"
        disabled={isCreatingPayment || !amount.trim()}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {isCreatingPayment ? loadingButtonText() : createButtonText()}
      </button>
    </div>
  );
}

function loadingButtonText() { return <><Loader2 className="w-4 h-4 animate-spin" /> Creating Payment Request... </> }
function createButtonText() { return <><Bitcoin className="w-4 h-4" /> Create Payment Request  </> }


