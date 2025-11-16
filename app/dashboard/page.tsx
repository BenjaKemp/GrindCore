import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { connections, bankAccounts, transactions, cryptoRewards, cryptoWallets } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { TrendingUp, Wallet, Rocket, Receipt } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Fetch bank connections
  const userConnections = await db
    .select()
    .from(connections)
    .where(eq(connections.userId, userId))
    .limit(1);

  const hasConnection = userConnections.length > 0;

  // Fetch transaction stats
  const userTransactions = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId));

  const totalBankIncome = userTransactions.reduce((sum, tx) => sum + tx.amount, 0);

  // Fetch crypto stats
  const userCryptoRewards = await db
    .select()
    .from(cryptoRewards)
    .where(eq(cryptoRewards.userId, userId));

  const totalCryptoGBP = userCryptoRewards.reduce((sum, r) => sum + (r.amountGBP || 0), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const stats = [
    {
      name: 'Total Bank Income',
      value: formatCurrency(totalBankIncome),
      icon: Wallet,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      href: '/dashboard/income',
    },
    {
      name: 'Crypto Staking',
      value: formatCurrency(totalCryptoGBP),
      icon: Rocket,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      href: '/dashboard/crypto',
    },
    {
      name: 'Total Passive Income',
      value: formatCurrency(totalBankIncome + totalCryptoGBP),
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      href: '/dashboard',
    },
    {
      name: 'Estimated Tax',
      value: 'View Details',
      icon: Receipt,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      href: '/dashboard/tax',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">
          Welcome back! Here's your passive income overview.
        </p>
      </div>

      {/* Connection Banner */}
      {!hasConnection && (
        <div className="rounded-lg border-2 border-dashed border-zinc-300 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold mb-2">Connect Your Bank Account</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            Link your bank account via Open Banking to automatically track your passive income streams.
          </p>
          <a
            href="/api/truelayer/connect"
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Connect Bank Account →
          </a>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              href={stat.href}
              className="group rounded-lg border border-zinc-200 bg-white p-6 transition-all hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`rounded-full p-3 ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{stat.name}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              href="/dashboard/income"
              className="block rounded-lg border border-zinc-200 p-3 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
            >
              <span className="font-medium">View Income Streams</span>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Track dividends, interest, and rental income
              </p>
            </Link>
            <Link
              href="/dashboard/crypto"
              className="block rounded-lg border border-zinc-200 p-3 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
            >
              <span className="font-medium">Connect Crypto Wallet</span>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Track staking rewards from ETH, SOL, ADA, BNB
              </p>
            </Link>
            <Link
              href="/dashboard/tax"
              className="block rounded-lg border border-zinc-200 p-3 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
            >
              <span className="font-medium">Calculate Tax</span>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                UK dividend allowance, PSA, ISA recommendations
              </p>
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          {userTransactions.length > 0 ? (
            <div className="space-y-3">
              {userTransactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between border-b border-zinc-100 pb-2 dark:border-zinc-800">
                  <div>
                    <p className="text-sm font-medium">{tx.description}</p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      {new Date(tx.transactionDate).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-green-600">
                    +{formatCurrency(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No transactions yet. Connect your bank to get started.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
