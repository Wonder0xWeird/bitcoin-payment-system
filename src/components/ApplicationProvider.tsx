'use client';

import React, { createContext, useContext, useState } from 'react';
import { PublicWalletInfo, PaymentRequest } from '@/lib/types';

export type AppState = 'loading' | 'form' | 'monitoring' | 'error';

interface IApplicationContext {
  state: AppState;
  setState: (state: AppState) => void;
  wallet: PublicWalletInfo | null;
  setWallet: (wallet: PublicWalletInfo | null) => void;
  paymentRequest: PaymentRequest | null;
  setPaymentRequest: (paymentRequest: PaymentRequest | null) => void;
  appError: string | null;
  setAppError: (error: string | null) => void;
}

const ApplicationContext = createContext<IApplicationContext>({} as IApplicationContext);

export function ApplicationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>('loading');
  const [wallet, setWallet] = useState<PublicWalletInfo | null>(null);
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [appError, setAppError] = useState<string | null>(null);

  const context = {
    state,
    setState,
    wallet,
    setWallet,
    paymentRequest,
    setPaymentRequest,
    appError,
    setAppError
  };

  return (
    <ApplicationContext.Provider value={context}>
      {children}
    </ApplicationContext.Provider>
  );
}

export function useApp() {
  return useContext(ApplicationContext);
}


