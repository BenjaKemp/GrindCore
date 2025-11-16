import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { cryptoRewards, cryptoWallets } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { CryptoCard } from '@/components/crypto-card';

export default async function CryptoPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
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

  // UAE resident detection
  const isUAE = true;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-3xl font-bold">Crypto Staking</h1>
          <span className="rounded bg-gradient-to-r from-purple-600 to-pink-600 px-2 py-1 text-xs font-bold text-white">
            PRO
          </span>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400">
          Track staking rewards from Ethereum, Solana, Cardano, and Binance Smart Chain.
        </p>
      </div>

      {/* Crypto Card */}
      <CryptoCard
        rewards={cryptoSummary}
        totalGBP={totalCryptoGBP}
        isUAE={isUAE}
        lastScanned={lastCryptoScan}
      />

      {/* Supported Protocols */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-xl font-semibold mb-4">Supported Protocols</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <h3 className="font-semibold mb-1">Ethereum</h3>
            <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
              <li>• Lido (stETH)</li>
              <li>• Rocket Pool (rETH)</li>
            </ul>
          </div>
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <h3 className="font-semibold mb-1">Solana</h3>
            <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
              <li>• Marinade (mSOL)</li>
              <li>• Jito</li>
              <li>• Native staking</li>
            </ul>
          </div>
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <h3 className="font-semibold mb-1">Cardano</h3>
            <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
              <li>• All stake pools</li>
              <li>• Via Blockfrost</li>
            </ul>
          </div>
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <h3 className="font-semibold mb-1">Binance SC</h3>
            <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
              <li>• PancakeSwap</li>
              <li>• CAKE staking</li>
            </ul>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/20">
              1
            </div>
            <div>
              <h3 className="font-medium">Connect Your Wallet</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Enter your wallet address (read-only). We never ask for private keys.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/20">
              2
            </div>
            <div>
              <h3 className="font-medium">Auto-Scan Rewards</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                We scan your wallet every 6 hours for staking rewards across all supported protocols.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/20">
              3
            </div>
            <div>
              <h3 className="font-medium">Track & Compound</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                See your total rewards in GBP and get reminders to restake for compound earnings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

