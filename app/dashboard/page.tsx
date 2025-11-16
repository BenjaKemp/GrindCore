import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { incomeStreams } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { formatCurrency, calculateMonthlyRecurring } from '@/lib/utils';
import { Plus, TrendingUp, Wallet, Calendar } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Fetch income streams for the user
  const streams = await db
    .select()
    .from(incomeStreams)
    .where(eq(incomeStreams.userId, userId))
    .orderBy(incomeStreams.createdAt);

  // Calculate totals
  const totalMonthlyIncome = streams.reduce((acc, stream) => {
    if (stream.status === 'active') {
      return acc + calculateMonthlyRecurring(stream.amount, stream.frequency);
    }
    return acc;
  }, 0);

  const totalStreams = streams.length;
  const activeStreams = streams.filter(s => s.status === 'active').length;

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
            <Link href="/dashboard/streams" className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Income Streams
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Monthly Income</p>
                <p className="mt-2 text-3xl font-bold">{formatCurrency(totalMonthlyIncome)}</p>
              </div>
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Active Streams</p>
                <p className="mt-2 text-3xl font-bold">{activeStreams}</p>
              </div>
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
                <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Streams</p>
                <p className="mt-2 text-3xl font-bold">{totalStreams}</p>
              </div>
              <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/20">
                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Income Streams Table */}
        <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-200 p-6 dark:border-zinc-800">
            <h2 className="text-xl font-semibold">Income Streams</h2>
            <Link
              href="/dashboard/streams/new"
              className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <Plus className="h-4 w-4" />
              Add Stream
            </Link>
          </div>

          {streams.length === 0 ? (
            <div className="p-12 text-center">
              <p className="mb-4 text-lg text-zinc-600 dark:text-zinc-400">
                No income streams yet. Add your first one to get started!
              </p>
              <Link
                href="/dashboard/streams/new"
                className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                <Plus className="h-4 w-4" />
                Add Your First Stream
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      Frequency
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      Monthly
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {streams.map((stream) => (
                    <tr
                      key={stream.id}
                      className="border-b border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                    >
                      <td className="px-6 py-4 text-sm font-medium">{stream.name}</td>
                      <td className="px-6 py-4 text-sm capitalize">{stream.category}</td>
                      <td className="px-6 py-4 text-sm">{formatCurrency(stream.amount)}</td>
                      <td className="px-6 py-4 text-sm capitalize">{stream.frequency}</td>
                      <td className="px-6 py-4 text-sm">
                        {formatCurrency(calculateMonthlyRecurring(stream.amount, stream.frequency))}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            stream.status === 'active'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                          }`}
                        >
                          {stream.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
