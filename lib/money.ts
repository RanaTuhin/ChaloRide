import type { Money } from '@/state/chaloride-store';

export function formatINR(m: Money) {
  const value = m.amountPaise / 100;
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
      value
    );
  } catch {
    return `₹${Math.round(value)}`;
  }
}

