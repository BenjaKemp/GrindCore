import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { p2pAccounts, p2pInterest } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { P2PCard } from '@/components/p2p-card';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default async function P2PLendingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Fetch P2P accounts
  const accounts = await db
    .select()
    .from(p2pAccounts)
    .where(eq(p2pAccounts.userId, userId));

  const hasAccount = accounts.length > 0;

  // Fetch interest payments
  const interestPayments = await db
    .select()
    .from(p2pInterest)
    .where(eq(p2pInterest.userId, userId));

  const totalInterest = interestPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const averageRate = interestPayments.length > 0
    ? interestPayments.reduce((sum, p) => sum + (p.rate || 0), 0) / interestPayments.length
    : 0;

  const lastSynced = accounts.length > 0 ? accounts[0].lastSynced : null;
  const provider = accounts.length > 0 ? accounts[0].provider : 'zopa';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">P2P Lending</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            Track interest from Zopa, RateSetter, and other P2P platforms.
          </p>
        </div>
        {hasAccount && (
          <Link
            href="/api/p2p/zopa/connect"
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            Add Account
          </Link>
        )}
      </div>

      {/* Connection Status */}
      {!hasAccount && (
        <div className="rounded-lg border-2 border-dashed border-zinc-300 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <h2 className="text-xl font-semibold mb-2">Connect Your P2P Account</h2>
          <p className="mb-6 text-zinc-600 dark:text-zinc-400">
            Link your Zopa or other P2P lending account to automatically track your interest payments.
          </p>
          <a
            href="/api/p2p/zopa/connect"
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-medium text-white hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            Connect Zopa Account
          </a>
          <p className="mt-4 text-xs text-zinc-500">
            FSCS protected up to £85k • FCA regulated
          </p>
        </div>
      )}

      {/* P2P Card */}
      {hasAccount && (
        <P2PCard
          totalInterest={totalInterest}
          averageRate={averageRate}
          provider={provider}
          lastSynced={lastSynced}
        />
      )}

      {/* Why P2P Lending */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-xl font-semibold mb-4">Why P2P Lending?</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <h3 className="font-semibold mb-1">Higher Returns</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Earn 4-6% vs 0.5-2% in traditional savings accounts.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">FSCS Protected</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Up to £85,000 protected by Financial Services Compensation Scheme.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Diversified Risk</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Your money is spread across hundreds of borrowers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

