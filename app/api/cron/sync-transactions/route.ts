import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { connections, bankAccounts, transactions, cryptoWallets, cryptoRewards } from '@/db/schema';
import { getTrueLayerClient, categorizeTransaction } from '@/lib/truelayer';
import { scanWalletRewards, getCryptoPriceInGBP } from '@/lib/crypto';
import { eq, lt } from 'drizzle-orm';

export async function GET(request: Request) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Starting transaction sync cron job...');

    const truelayer = getTrueLayerClient();
    let synced = 0;
    let errors = 0;
    let cryptoScanned = 0;

    // ========== TRUELAYER BANK SYNC ==========
    // Fetch all active connections
    const activeConnections = await db.select().from(connections);

    for (const connection of activeConnections) {
      try {
        let accessToken = connection.accessToken;

        // Check if token needs refresh
        if (connection.tokenExpiresAt && connection.tokenExpiresAt < new Date()) {
          console.log(`Refreshing token for connection ${connection.id}`);
          
          if (!connection.refreshToken) {
            console.warn(`No refresh token for connection ${connection.id}`);
            continue;
          }

          const tokenData = await truelayer.refreshToken(connection.refreshToken);
          accessToken = tokenData.access_token;

          // Update connection with new tokens
          await db
            .update(connections)
            .set({
              accessToken: tokenData.access_token,
              refreshToken: tokenData.refresh_token,
              tokenExpiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
              updatedAt: new Date(),
            })
            .where(eq(connections.id, connection.id));
        }

        // Get all bank accounts for this connection
        const accounts = await db
          .select()
          .from(bankAccounts)
          .where(eq(bankAccounts.connectionId, connection.id));

        for (const account of accounts) {
          try {
            // Sync transactions from last 7 days
            const fromDate = new Date();
            fromDate.setDate(fromDate.getDate() - 7);

            const accountTransactions = await truelayer.getTransactions(
              accessToken,
              account.trueLayerId,
              fromDate.toISOString().split('T')[0]
            );

            // Filter incoming transactions (income)
            const incomeTransactions = accountTransactions.filter(
              (tx) => tx.amount > 0 && tx.transaction_type === 'CREDIT'
            );

            for (const tx of incomeTransactions) {
              const category = categorizeTransaction(tx.description);

              await db.insert(transactions).values({
                userId: connection.userId,
                bankAccountId: account.id,
                trueLayerId: tx.transaction_id,
                amount: tx.amount,
                description: tx.description,
                category,
                transactionDate: new Date(tx.timestamp),
              }).onConflictDoNothing(); // Skip if already exists

              synced++;
            }

            // Update last synced timestamp
            await db
              .update(bankAccounts)
              .set({ lastSynced: new Date() })
              .where(eq(bankAccounts.id, account.id));

          } catch (err) {
            console.error(`Error syncing account ${account.trueLayerId}:`, err);
            errors++;
          }
        }

      } catch (err) {
        console.error(`Error syncing connection ${connection.id}:`, err);
        errors++;
      }
    }

    // ========== CRYPTO WALLET SCAN ==========
    console.log('Starting crypto wallet scan...');

    const allWallets = await db.select().from(cryptoWallets);

    for (const wallet of allWallets) {
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
              userId: wallet.userId,
              token: reward.token,
              amount: reward.amount,
              amountGBP,
              source: reward.source,
              rewardDate: new Date(),
            })
            .onConflictDoNothing();

          cryptoScanned++;
        }

        // Update last scanned timestamp
        await db
          .update(cryptoWallets)
          .set({ lastScanned: new Date() })
          .where(eq(cryptoWallets.id, wallet.id));

      } catch (err) {
        console.error(`Error scanning wallet ${wallet.address}:`, err);
        errors++;
      }
    }

    console.log(`Sync completed: ${synced} bank transactions, ${cryptoScanned} crypto rewards, ${errors} errors`);

    return NextResponse.json({
      success: true,
      message: 'Sync completed',
      bankTransactions: synced,
      cryptoRewards: cryptoScanned,
      errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in sync cron:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
