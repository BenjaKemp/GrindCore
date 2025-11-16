import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { transactions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export default async function TaxPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Fetch user's transactions for tax calculation
  const userTransactions = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId));

  // Calculate income by category
  const dividendIncome = userTransactions
    .filter((tx) => tx.category === 'dividend')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const interestIncome = userTransactions
    .filter((tx) => tx.category === 'interest')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const rentalIncome = userTransactions
    .filter((tx) => tx.category === 'rental')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // UK Tax calculations (2025/26)
  const DIVIDEND_ALLOWANCE = 2000;
  const PSA_BASIC = 1000;
  const ISA_LIMIT = 20000;

  const taxableDividends = Math.max(0, dividendIncome - DIVIDEND_ALLOWANCE);
  const taxableInterest = Math.max(0, interestIncome - PSA_BASIC);

  const estimatedDividendTax = taxableDividends * 0.075;
  const estimatedInterestTax = taxableInterest * 0.2;
  const totalEstimatedTax = estimatedDividendTax + estimatedInterestTax;

  const isaRoomLeft = ISA_LIMIT;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  // UAE resident detection
  const isUAE = true; // Hardcoded for @therealBenKemp

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Tax & ISA</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">
          UK tax calculations and ISA recommendations.
        </p>
      </div>

      {/* UAE Tax-Free Banner */}
      {isUAE && (
        <div className="rounded-lg border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-6 dark:border-green-800 dark:from-green-950 dark:to-emerald-950">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🇦🇪</span>
            <div>
              <h2 className="text-xl font-bold text-green-900 dark:text-green-100">
                UAE Tax-Free Zone
              </h2>
              <p className="text-sm text-green-700 dark:text-green-300">
                As a UAE resident, your passive income is 100% tax-free!
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg bg-white/50 p-3 dark:bg-zinc-900/50">
              <p className="text-xs text-green-700 dark:text-green-400">No Income Tax</p>
              <p className="text-lg font-bold text-green-900 dark:text-green-100">0%</p>
            </div>
            <div className="rounded-lg bg-white/50 p-3 dark:bg-zinc-900/50">
              <p className="text-xs text-green-700 dark:text-green-400">No Capital Gains</p>
              <p className="text-lg font-bold text-green-900 dark:text-green-100">0%</p>
            </div>
            <div className="rounded-lg bg-white/50 p-3 dark:bg-zinc-900/50">
              <p className="text-xs text-green-700 dark:text-green-400">Dividend Tax</p>
              <p className="text-lg font-bold text-green-900 dark:text-green-100">0%</p>
            </div>
          </div>
        </div>
      )}

      {/* UK Tax Estimate (for reference) */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-xl font-semibold mb-4">
          UK Tax Estimate (2025/26)
          {isUAE && (
            <span className="ml-2 text-sm font-normal text-zinc-500">For Reference Only</span>
          )}
        </h2>

        <div className="space-y-4">
          {/* Dividends */}
          <div>
            <h3 className="text-lg font-medium mb-2">Dividend Income</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">Total dividends:</span>
                <span className="font-medium">{formatCurrency(dividendIncome)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">Dividend allowance:</span>
                <span className="font-medium">-{formatCurrency(DIVIDEND_ALLOWANCE)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-zinc-200 pt-2 dark:border-zinc-800">
                <span className="text-zinc-600 dark:text-zinc-400">Taxable @ 7.5%:</span>
                <span className="font-semibold text-orange-600">{formatCurrency(estimatedDividendTax)}</span>
              </div>
            </div>
          </div>

          {/* Interest */}
          <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <h3 className="text-lg font-medium mb-2">Interest Income</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">Total interest:</span>
                <span className="font-medium">{formatCurrency(interestIncome)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">PSA (Basic rate):</span>
                <span className="font-medium">-{formatCurrency(PSA_BASIC)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-zinc-200 pt-2 dark:border-zinc-800">
                <span className="text-zinc-600 dark:text-zinc-400">Taxable @ 20%:</span>
                <span className="font-semibold text-orange-600">{formatCurrency(estimatedInterestTax)}</span>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="border-t-2 border-zinc-300 pt-4 dark:border-zinc-700">
            <div className="flex justify-between">
              <span className="text-lg font-semibold">Total UK Tax Estimate:</span>
              <span className="text-2xl font-bold text-orange-600">
                {formatCurrency(totalEstimatedTax)}
              </span>
            </div>
            {isUAE && (
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                ✓ You pay £0 as a UAE resident
              </p>
            )}
          </div>
        </div>

        <p className="mt-4 text-xs text-zinc-500">
          * Assumes basic rate taxpayer. This is an estimate only. Consult a tax advisor.
        </p>
      </div>

      {/* ISA Recommendations */}
      {isaRoomLeft > 0 && (
        <div className="rounded-lg border border-zinc-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 dark:border-zinc-800 dark:from-blue-950 dark:to-indigo-950">
          <h2 className="text-xl font-semibold mb-2">💡 ISA Allowance</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            You have <strong>{formatCurrency(isaRoomLeft)}</strong> of ISA allowance remaining (2025/26).
            ISA investments are 100% tax-free on dividends and capital gains.
          </p>
          <a
            href="https://refer.nutmeg.com/reward"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Open ISA with Nutmeg →
          </a>
          <p className="mt-3 text-xs text-zinc-500">
            Affiliate link. Nutmeg is FCA-regulated with low fees.
          </p>
        </div>
      )}

      {/* Rental Income */}
      {rentalIncome > 0 && (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-xl font-semibold mb-2">Rental Income</h2>
          <p className="text-3xl font-bold">{formatCurrency(rentalIncome)}</p>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Rental income is subject to income tax. Deduct allowable expenses.
          </p>
        </div>
      )}
    </div>
  );
}

