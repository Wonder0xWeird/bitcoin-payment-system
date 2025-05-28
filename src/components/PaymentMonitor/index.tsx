'use client';

import { usePaymentPolling } from '@/hooks/usePaymentPolling';
import { useApp } from '@/components';
import { Status } from './Status';
import { PollError } from './PollError';
import { Header } from './Header';
import { ControllButtons } from './ControllButtons';
import { RateLimitError } from './RateLimitError';
import { Instructions } from './Instructions';
import { RequestInfo } from './RequestInfo';

export function PaymentMonitor() {
  const { paymentRequest, setState, setAppError } = useApp();

  if (!paymentRequest) {
    setAppError('No payment request available, please create a new payment request.');
    setState('error');
    return;
  }

  const {
    receipt,
    isPolling,
    pollError,
    attempts,
    maxAttempts,
    currentInterval,
    isRateLimited,
    nextAttemptIn,
    startPolling,
    stopPolling,
    resetPolling,
  } = usePaymentPolling(paymentRequest);

  return (
    <div className="card">
      <Header isPolling={isPolling} />
      {pollError && <PollError pollError={pollError} />}
      {isRateLimited && <RateLimitError nextAttemptIn={nextAttemptIn} />}
      <Status receipt={receipt} isPolling={isPolling} attempts={attempts} maxAttempts={maxAttempts} currentInterval={currentInterval} isRateLimited={isRateLimited} nextAttemptIn={nextAttemptIn} />
      <ControllButtons isPolling={isPolling} stopPolling={stopPolling} startPolling={startPolling} resetPolling={resetPolling} />
      <RequestInfo paymentRequest={paymentRequest} />
      <Instructions currentInterval={currentInterval} isRateLimited={isRateLimited} />
    </div>
  );
} 