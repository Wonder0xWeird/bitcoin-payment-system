import { isValidBtcAmount, isValidBitcoinAddress } from './bitcoin';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Validate payment amount input
export function validatePaymentAmount(amount: string | number): ValidationResult {
  // Convert string to number if needed
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  // Check if it's a valid number
  if (isNaN(numAmount)) {
    return {
      isValid: false,
      error: 'Please enter a valid number'
    };
  }

  // Check if it's positive
  if (numAmount <= 0) {
    return {
      isValid: false,
      error: 'Amount must be greater than 0'
    };
  }

  // Check if it's not too large
  if (numAmount > 21000000) {
    return {
      isValid: false,
      error: 'Amount cannot exceed 21,000,000 BTC'
    };
  }

  // Check for too many decimal places (max 8 for Bitcoin)
  const decimalPlaces = (numAmount.toString().split('.')[1] || '').length;
  if (decimalPlaces > 8) {
    return {
      isValid: false,
      error: 'Bitcoin supports maximum 8 decimal places'
    };
  }

  // Use our Bitcoin utility for final validation
  if (!isValidBtcAmount(numAmount)) {
    return {
      isValid: false,
      error: 'Invalid Bitcoin amount'
    };
  }

  return { isValid: true };
}

// Validate Bitcoin address
export function validateBitcoinAddress(address: string): ValidationResult {
  if (!address || address.trim().length === 0) {
    return {
      isValid: false,
      error: 'Address is required'
    };
  }

  const trimmedAddress = address.trim();

  if (!isValidBitcoinAddress(trimmedAddress)) {
    return {
      isValid: false,
      error: 'Invalid Bitcoin address format'
    };
  }

  return { isValid: true };
}

// Validate form inputs for payment request
export interface PaymentFormData {
  amount: string;
}

export function validatePaymentForm(data: PaymentFormData): ValidationResult {
  const amountValidation = validatePaymentAmount(data.amount);

  if (!amountValidation.isValid) {
    return amountValidation;
  }

  return { isValid: true };
}

// Sanitize and format user input
export function sanitizeAmountInput(input: string): string {
  // Remove any non-digit, non-decimal characters
  return input.replace(/[^0-9.]/g, '')
    // Remove multiple decimal points, keep only the first one
    .replace(/\..*\./, match => match.replace(/\./g, '').replace(/^/, '.'))
    // Limit to 8 decimal places
    .replace(/(\.\d{8})\d+/, '$1');
}

// Format error messages for display
export function formatErrorMessage(error: string): string {
  return error.charAt(0).toUpperCase() + error.slice(1);
} 