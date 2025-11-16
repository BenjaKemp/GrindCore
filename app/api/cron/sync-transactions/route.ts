import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { connections, bankAccounts, transactions } from '@/db/schema';
import { getTrueLayerClient, categorizeTransaction } from '@/lib/truelayer';
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

    console.log(`Transaction sync completed: ${synced} synced, ${errors} errors`);

    return NextResponse.json({
      success: true,
      message: 'Transaction sync completed',
      synced,
      errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in transaction sync:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
