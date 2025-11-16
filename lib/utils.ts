import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amountInPence: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amountInPence / 100);
}

export function calculateMonthlyRecurring(amount: number, frequency: string): number {
  const multipliers: Record<string, number> = {
    'weekly': 4.33,
    'monthly': 1,
    'quarterly': 1 / 3,
    'yearly': 1 / 12,
    'one-time': 0,
  };
  return amount * (multipliers[frequency] || 0);
}
