'use client';

import { ExternalLink } from 'lucide-react';

interface P2PCardProps {
  totalInterest: number;
  averageRate: number;
  provider: string;
  lastSynced?: Date | null;
}

export function P2PCard({ totalInterest, averageRate, provider, lastSynced }: P2PCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const PSA_BASIC = 1000; // £1,000 Personal Savings Allowance
  const taxableAmount = Math.max(0, totalInterest - PSA_BASIC);
  const estimatedTax = taxableAmount * 0.2;

  return (
    <div className="space-y-4">
      {/* Main Card */}
      <div className="rounded-lg border bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950 p-6">
        <h3 className="text-lg font-semibold mb-4">🏦 P2P Lending Income</h3>
        
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">Total Interest (6 months)</p>
          <p className="text-4xl font-bold">{formatCurrency(totalInterest)}</p>
          {lastSynced && (
            <p className="text-xs text-muted-foreground mt-1">
              Last synced: {new Date(lastSynced).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-white/50 dark:bg-zinc-900/50 p-4">
            <p className="text-sm text-muted-foreground">Average Rate</p>
            <p className="text-2xl font-bold">{averageRate.toFixed(2)}%</p>
          </div>
          <div className="rounded-lg border bg-white/50 dark:bg-zinc-900/50 p-4">
            <p className="text-sm text-muted-foreground">Provider</p>
            <p className="text-2xl font-bold capitalize">{provider}</p>
          </div>
        </div>

        {/* Tax Info */}
        <div className="mt-4 rounded-lg border bg-white/50 dark:bg-zinc-900/50 p-4">
          <h4 className="font-semibold mb-2">Tax Estimate</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>PSA used:</span>
              <span>{formatCurrency(Math.min(totalInterest, PSA_BASIC))} / {formatCurrency(PSA_BASIC)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-semibold">Estimated tax:</span>
              <span className="font-semibold">{formatCurrency(estimatedTax)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Zopa Affiliate CTA */}
      <div className="rounded-lg border bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950 p-6">
        <h3 className="text-lg font-semibold mb-2">💡 Earn More with P2P Lending</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          Add £1,000 to Zopa and earn approximately <strong>{formatCurrency(52)}/year</strong> at 5.2% APY.
        </p>
        <a
          href="https://www.zopa.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          Add Funds to Zopa <ExternalLink className="h-4 w-4" />
        </a>
        <p className="mt-3 text-xs text-zinc-500">
          Affiliate link. Capital at risk. FSCS protected up to £85k.
        </p>
      </div>
    </div>
  );
}

