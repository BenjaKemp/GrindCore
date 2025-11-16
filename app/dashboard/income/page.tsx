import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { connections, bankAccounts, transactions } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { IncomeSummary } from '@/components/income-summary';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default async function IncomePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Check if user has connected bank account
  const userConnections = await db
    .select()
    .from(connections)
    .where(eq(connections.userId, userId))
    .limit(1);

  const hasConnection = userConnections.length > 0;

  // Fetch user's transactions
  let userTransactions: any[] = [];
  let lastSyncDate: Date | null = null;

  if (hasConnection) {
    userTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.transactionDate))
      .limit(100);

    // Get last sync date from bank accounts
    const accounts = await db
      .select()
      .from(bankAccounts)
      .where(eq(bankAccounts.userId, userId))
      .orderBy(desc(bankAccounts.lastSynced))
      .limit(1);

    if (accounts.length > 0) {
      lastSyncDate = accounts[0].lastSynced;
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Income Streams</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            Track dividends, interest, rental income, and more.
          </p>
        </div>
        {hasConnection && (
          <Link
            href="/api/truelayer/connect"
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <Plus className="h-4 w-4" />
            Add Account
          </Link>
        )}
      </div>

      {/* Connection Status */}
      {!hasConnection && (
        <div className="rounded-lg border-2 border-dashed border-zinc-300 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <h2 className="text-xl font-semibold mb-2">Connect Your Bank Account</h2>
          <p className="mb-6 text-zinc-600 dark:text-zinc-400">
            Link your bank account via Open Banking to automatically track your passive income streams.
            Your data is secure and read-only.
          </p>
          <a
            href="/api/truelayer/connect"
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <Plus className="h-4 w-4" />
            Connect Bank Account
          </a>
          <p className="mt-4 text-xs text-zinc-500">
            Powered by TrueLayer • FCA Regulated • Bank-level security
          </p>
        </div>
      )}

      {/* Income Summary */}
      {hasConnection && (
        <IncomeSummary transactions={userTransactions} lastSynced={lastSyncDate} />
      )}

      {/* No transactions yet */}
      {hasConnection && userTransactions.length === 0 && (
        <div className="rounded-lg border bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            No passive income transactions found yet. Transactions will appear here after your next sync.
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Syncs happen automatically every 6 hours.
          </p>
        </div>
      )}
    </div>
  );
}

