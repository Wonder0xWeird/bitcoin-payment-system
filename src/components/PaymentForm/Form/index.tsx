import { useState } from "react";
import { useApp } from "@/components/ApplicationProvider";
import { sanitizeAmountInput, validatePaymentAmount } from "@/lib/utils/validation";
import { ApiResponse, PaymentRequest } from "@/lib/types";
import toast from "react-hot-toast";
import { Header } from "./Header";
import { PresetAmounts } from "./PresetAmounts";
import { SubmitButton } from "./SubmitButton";

export function Form() {
  const { wallet, setState, setAppError, setPaymentRequest } = useApp();

  if (!wallet) {
    setAppError('No wallet available. Please generate a new wallet.');
    setState('error');
    return;
  }

  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [amount, setAmount] = useState('');
  const [formError, setFormError] = useState<string | null>(null);


  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = sanitizeAmountInput(e.target.value);
    setAmount(sanitizedValue);
    if (formError) setFormError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount.trim()) {
      setFormError('Please enter an amount');
      return;
    }

    const validation = validatePaymentAmount(amount);
    if (!validation.isValid) {
      setFormError(validation.error || 'Invalid amount');
      return;
    }

    submitPaymentRequest(parseFloat(amount));
  };

  const submitPaymentRequest = async (amount: number) => {
    try {
      setIsCreatingPayment(true);

      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({
          address: wallet.address,
          amount,
          label: 'Bitcoin Payment Request',
          message: 'Payment request created via BTC Pay App'
        }),
      });
      const data: ApiResponse<PaymentRequest> = await response.json();

      if (data.success) {
        setPaymentRequest(data.data);
        setState('monitoring');
        toast.success('Payment request created! Monitoring payments...', {
          icon: '📱',
          duration: 5000,
        });
      } else {
        throw new Error(data.error || 'Failed to create payment request');
      }
    } catch (error: any) {
      console.error('Error creating payment request:', error);
      toast.error('Failed to create payment request. Please try again.');
      setFormError(error.message || 'Failed to create payment request');
      setAppError(error.message || 'Failed to create payment request');
      setState('error');
    } finally {
      setIsCreatingPayment(false);
      setAmount('');
      setFormError(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Header amount={amount} handleAmountChange={handleAmountChange} formError={formError} isCreatingPayment={isCreatingPayment} />
      <PresetAmounts isCreatingPayment={isCreatingPayment} setAmount={setAmount} setFormError={setFormError} />
      <SubmitButton isCreatingPayment={isCreatingPayment} amount={amount} />
    </form>
  );
}

