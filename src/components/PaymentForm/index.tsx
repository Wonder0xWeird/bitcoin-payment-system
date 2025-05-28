'use client';

import { Title } from './Title';
import { Form } from './Form';
import { Instructions } from './Instructions';

export function PaymentForm() {
  return (
    <div className="card">
      <Title />
      <Form />
      <Instructions />
    </div>
  );
} 