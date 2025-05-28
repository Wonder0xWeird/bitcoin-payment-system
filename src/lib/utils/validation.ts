import { isValidBtcAmount, isValidBitcoinAddress } from './bitcoin';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
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

export function validatePaymentAmount(amount: string | number | null): ValidationResult {
  try {
    if (!amount) return { isValid: false, error: 'Amount is required' };

    let parsedAmount
    if (typeof amount === 'string') parsedAmount = parseFloat(amount);
    else if (typeof amount === 'number') parsedAmount = amount;
    else return { isValid: false, error: 'Invalid amount' };

    if (isNaN(parsedAmount)) return { isValid: false, error: 'Amount must be a number' };
    if (parsedAmount <= 0) return { isValid: false, error: 'Amount must be greater than 0' };
    if (parsedAmount > 21000000) return { isValid: false, error: 'Amount cannot exceed 21,000,000 BTC' };

    const decimalPlaces = (parsedAmount.toString().split('.')[1] || '').length;
    if (decimalPlaces > 8) return { isValid: false, error: 'Bitcoin supports maximum 8 decimal places' };

    if (!isValidBtcAmount(parsedAmount)) return { isValid: false, error: 'Invalid Bitcoin amount' };
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Invalid amount' };
  }
}

export function validateBitcoinAddress(address: string | null): ValidationResult {
  try {
    if (!address) return { isValid: false, error: 'Address is required' };
    if (typeof address !== 'string') return { isValid: false, error: 'Address must be a string' };
    if (address.trim().length === 0) return { isValid: false, error: 'Address is required' };
    if (!isValidBitcoinAddress(address.trim())) return { isValid: false, error: 'Invalid Bitcoin address format' };
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Invalid address' };
  }
}

export function validateDate(date: string | null): ValidationResult {
  try {
    if (!date || date.trim().length === 0) return { isValid: false, error: 'Date is required' };
    if (typeof date !== 'string') return { isValid: false, error: 'Date must be a string' };
    if (isNaN(new Date(date).getTime())) return { isValid: false, error: 'Invalid date format' };
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Invalid date' };
  }
}
