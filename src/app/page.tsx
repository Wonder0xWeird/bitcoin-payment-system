'use client';

import { Header, Footer, Loading, PaymentForm, ErrorInfo, useApp, PaymentMonitor } from '@/components';

export default function Home() {
  const { state } = useApp();

  return (
    <div className="app-container">
      <Header />
      <main className="app-content">
        {state === 'loading' && <Loading />}
        {state === 'form' && <PaymentForm />}
        {state === 'monitoring' && <PaymentMonitor />}
        {state === 'error' && <ErrorInfo />}
      </main>
      <Footer />
    </div>
  );
}
