'use client';

import { formatDistanceToNow } from 'date-fns';

interface Transaction {
  id: number;
  amount: number;
  description: string;
  category: string | null;
  transactionDate: Date;
}

interface IncomeSummaryProps {
  transactions: Transaction[];
  lastSynced?: Date | null;
}

export function IncomeSummary({ transactions, lastSynced }: IncomeSummaryProps) {
  // Calculate totals by category
  const dividendIncome = transactions
    .filter((tx) => tx.category === 'dividend')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const interestIncome = transactions
    .filter((tx) => tx.category === 'interest')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const rentalIncome = transactions
    .filter((tx) => tx.category === 'rental')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const otherIncome = transactions
    .filter((tx) => tx.category === 'other' || !tx.category)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalIncome = dividendIncome + interestIncome + rentalIncome + otherIncome;

  // UK Tax calculations (2025/26 tax year)
  const DIVIDEND_ALLOWANCE = 2000; // £2,000 dividend allowance
  const PSA_BASIC = 1000; // £1,000 Personal Savings Allowance (basic rate)
  const ISA_LIMIT = 20000; // £20,000 ISA limit

  const taxableDividends = Math.max(0, dividendIncome - DIVIDEND_ALLOWANCE);
  const taxableInterest = Math.max(0, interestIncome - PSA_BASIC);

  // Basic rate: 7.5% on dividends, 20% on interest
  const estimatedDividendTax = taxableDividends * 0.075;
  const estimatedInterestTax = taxableInterest * 0.2;
  const totalEstimatedTax = estimatedDividendTax + estimatedInterestTax;

  // ISA room remaining
  const isaRoomUsed = 0; // This would come from a separate calculation
  const isaRoomLeft = ISA_LIMIT - isaRoomUsed;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Total Income Card */}
      <div className="rounded-lg border bg-card p-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Total Passive Income (90 days)</p>
          <p className="text-4xl font-bold">{formatCurrency(totalIncome)}</p>
          {lastSynced && (
            <p className="text-xs text-muted-foreground">
              Last synced {formatDistanceToNow(new Date(lastSynced), { addSuffix: true })}
            </p>
          )}
        </div>
      </div>

      {/* Income Breakdown */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm font-medium text-muted-foreground">Dividends</p>
          <p className="mt-2 text-2xl font-bold">{formatCurrency(dividendIncome)}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm font-medium text-muted-foreground">Interest</p>
          <p className="mt-2 text-2xl font-bold">{formatCurrency(interestIncome)}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm font-medium text-muted-foreground">Rental</p>
          <p className="mt-2 text-2xl font-bold">{formatCurrency(rentalIncome)}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm font-medium text-muted-foreground">Other</p>
          <p className="mt-2 text-2xl font-bold">{formatCurrency(otherIncome)}</p>
        </div>
      </div>

      {/* Tax Estimate */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Estimated Tax (2025/26)</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Dividend allowance used:</span>
            <span className="text-sm font-medium">
              {formatCurrency(Math.min(dividendIncome, DIVIDEND_ALLOWANCE))} / {formatCurrency(DIVIDEND_ALLOWANCE)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Taxable dividends @ 7.5%:</span>
            <span className="text-sm font-medium">{formatCurrency(estimatedDividendTax)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">PSA used:</span>
            <span className="text-sm font-medium">
              {formatCurrency(Math.min(interestIncome, PSA_BASIC))} / {formatCurrency(PSA_BASIC)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Taxable interest @ 20%:</span>
            <span className="text-sm font-medium">{formatCurrency(estimatedInterestTax)}</span>
          </div>
          <div className="border-t pt-3 flex justify-between">
            <span className="font-semibold">Estimated tax to pay:</span>
            <span className="font-semibold text-lg">{formatCurrency(totalEstimatedTax)}</span>
          </div>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          * Assumes basic rate taxpayer. This is an estimate only. Consult a tax advisor for accuracy.
        </p>
      </div>

      {/* ISA CTA */}
      {isaRoomLeft > 0 && totalIncome > 0 && (
        <div className="rounded-lg border bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-6">
          <h3 className="text-lg font-semibold mb-2">💡 Tax-Free Opportunity</h3>
          <p className="text-sm text-muted-foreground mb-4">
            You have <strong>{formatCurrency(isaRoomLeft)}</strong> of ISA allowance remaining this tax year.
            Investing in an ISA means your dividends and interest are 100% tax-free.
          </p>
          <a
            href="https://refer.nutmeg.com/reward"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Top up ISA with Nutmeg →
          </a>
          <p className="mt-3 text-xs text-muted-foreground">
            Affiliate link. Nutmeg is a regulated investment platform with low fees and easy ISA management.
          </p>
        </div>
      )}

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Income Transactions</h3>
          <div className="space-y-3">
            {transactions.slice(0, 10).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-medium">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(tx.transactionDate).toLocaleDateString('en-GB')} • {tx.category || 'Other'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                    +{formatCurrency(tx.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

