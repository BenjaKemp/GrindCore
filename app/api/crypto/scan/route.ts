import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { cryptoWallets, cryptoRewards } from '@/db/schema';
import { scanWalletRewards, getCryptoPriceInGBP } from '@/lib/crypto';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get user's crypto wallets
    const wallets = await db
      .select()
      .from(cryptoWallets)
      .where(eq(cryptoWallets.userId, userId));

    if (wallets.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No wallets to scan',
        scanned: 0,
      });
    }

    let totalScanned = 0;
    const results: any[] = [];

    for (const wallet of wallets) {
      try {
        // Scan for staking rewards
        const rewards = await scanWalletRewards(wallet.address, wallet.chain);

        for (const reward of rewards) {
          // Get current price in GBP
          const priceGBP = await getCryptoPriceInGBP(reward.token);
          const amountGBP = reward.amount * priceGBP;

          // Save reward to database
          await db
            .insert(cryptoRewards)
            .values({
              walletId: wallet.id,
              userId,
              token: reward.token,
              amount: reward.amount,
              amountGBP,
              source: reward.source,
              rewardDate: new Date(),
            })
            .onConflictDoNothing();

          totalScanned++;
          results.push({
            wallet: wallet.address,
            chain: wallet.chain,
            token: reward.token,
            amount: reward.amount,
            amountGBP,
            source: reward.source,
          });
        }

        // Update last scanned timestamp
        await db
          .update(cryptoWallets)
          .set({ lastScanned: new Date() })
          .where(eq(cryptoWallets.id, wallet.id));
      } catch (err) {
        console.error(`Error scanning wallet ${wallet.address}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Crypto scan completed',
      scanned: totalScanned,
      results,
    });
  } catch (error) {
    console.error('Error scanning crypto rewards:', error);
    return NextResponse.json(
      { error: 'Failed to scan crypto rewards' },
      { status: 500 }
    );
  }
}

// Get crypto rewards summary
export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rewards = await db
      .select()
      .from(cryptoRewards)
      .where(eq(cryptoRewards.userId, userId));

    // Calculate totals by token
    const totals = rewards.reduce((acc: any, reward) => {
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

    // Convert to array
    const summary = Object.values(totals).map((t: any) => ({
      ...t,
      sources: Array.from(t.sources),
    }));

    return NextResponse.json({
      rewards,
      summary,
      totalGBP: summary.reduce((sum: number, t: any) => sum + t.amountGBP, 0),
    });
  } catch (error) {
    console.error('Error fetching crypto rewards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rewards' },
      { status: 500 }
    );
  }
}

