import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { connections, bankAccounts, transactions, cryptoRewards, cryptoWallets } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { IncomeSummary } from '@/components/income-summary';
import { CryptoCard } from '@/components/crypto-card';
import { Wallet, Plus } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
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

  // Fetch crypto rewards
  const userCryptoRewards = await db
    .select()
    .from(cryptoRewards)
    .where(eq(cryptoRewards.userId, userId));

  // Get last scanned date from wallets
  const userWallets = await db
    .select()
    .from(cryptoWallets)
    .where(eq(cryptoWallets.userId, userId))
    .orderBy(desc(cryptoWallets.lastScanned))
    .limit(1);

  const lastCryptoScan = userWallets.length > 0 ? userWallets[0].lastScanned : null;

  // Calculate crypto totals by token
  const cryptoTotals = userCryptoRewards.reduce((acc: any, reward) => {
    if (!acc[reward.token]) {
      acc[reward.token] = {
        token: reward.token,
        amount: 0,
        amountGBP: 0,
        sources: new Set(),
      };
    }
    acc[reward.token].amount += reward.amount;
    acc[reward.token].amountGBP += reward.amountGBP || 0;
    acc[reward.token].sources.add(reward.source);
    return acc;
  }, {});

  const cryptoSummary = Object.values(cryptoTotals).map((t: any) => ({
    ...t,
    sources: Array.from(t.sources),
  }));

  const totalCryptoGBP = cryptoSummary.reduce((sum: number, t: any) => sum + t.amountGBP, 0);

  // Detect if user is UAE resident (in production, would check user profile)
  const isUAE = true; // Hardcoded for @therealBenKemp

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            <span className="text-xl font-bold">UK Side-Hustle Vault</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium">
              Dashboard
            </Link>
            <Link href="/dashboard/streams/new" className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Add Stream
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Connection Status */}
        {!hasConnection && (
          <div className="mb-8 rounded-lg border-2 border-dashed border-zinc-300 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <h2 className="mb-2 text-xl font-semibold">Connect Your Bank Account</h2>
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

        {/* Success Message */}
        {hasConnection && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('connected') === 'true' && (
          <div className="mb-8 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200">
            ✓ Bank account connected successfully! Your transactions are now syncing.
          </div>
        )}

        {/* Crypto Staking Card */}
        <div className="mb-8">
          <CryptoCard
            rewards={cryptoSummary}
            totalGBP={totalCryptoGBP}
            isUAE={isUAE}
            lastScanned={lastCryptoScan}
          />
        </div>

        {/* Income Summary */}
        {hasConnection && (
          <IncomeSummary transactions={userTransactions} lastSynced={lastSyncDate} />
        )}

        {/* No transactions yet */}
        {hasConnection && userTransactions.length === 0 && (
          <div className="rounded-lg border bg-card p-12 text-center">
            <p className="text-lg text-muted-foreground">
              No passive income transactions found yet. Transactions will appear here after your next sync.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Syncs happen automatically every 6 hours.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
