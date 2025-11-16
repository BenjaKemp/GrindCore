import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getTrueLayerClient, categorizeTransaction } from '@/lib/truelayer';
import { db } from '@/lib/db';
import { connections, bankAccounts, transactions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state'); // Contains userId

  if (error) {
    return NextResponse.redirect(
      new URL(`/dashboard?error=${error}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
  }

  const { userId } = await auth();

  if (!userId || (state && state !== userId)) {
    return NextResponse.redirect(
      new URL('/sign-in', request.url)
    );
  }

  try {
    const truelayer = getTrueLayerClient();

    // 1. Exchange code for access token
    const tokenData = await truelayer.exchangeCode(code);

    // 2. Save connection to database
    const tokenExpiresAt = new Date(Date.now() + tokenData.expires_in * 1000);
    
    const [connection] = await db
      .insert(connections)
      .values({
        userId,
        provider: 'truelayer',
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpiresAt,
      })
      .returning();

    // 3. Fetch and store user's bank accounts
    const accounts = await truelayer.getAccounts(tokenData.access_token);

    for (const account of accounts) {
      // Get account balance
      let balance = 0;
      try {
        const balanceData = await truelayer.getBalance(
          tokenData.access_token,
          account.account_id
        );
        balance = Math.round(balanceData.current * 100); // Convert to pence
      } catch (err) {
        console.warn(`Could not fetch balance for account ${account.account_id}`, err);
      }

      // Store account
      await db.insert(bankAccounts).values({
        userId,
        connectionId: connection.id,
        trueLayerId: account.account_id,
        accountName: account.display_name,
        accountNumber: account.account_number?.number,
        sortCode: account.account_number?.sort_code,
        balance,
        currency: account.currency,
        lastSynced: new Date(),
      });

      // Fetch recent transactions (last 90 days)
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 90);
      
      try {
        const accountTransactions = await truelayer.getTransactions(
          tokenData.access_token,
          account.account_id,
          fromDate.toISOString().split('T')[0]
        );

        // Filter and store incoming transactions only (positive amounts = income)
        const incomeTransactions = accountTransactions.filter(
          (tx) => tx.amount > 0 && tx.transaction_type === 'CREDIT'
        );

        for (const tx of incomeTransactions) {
          const category = categorizeTransaction(tx.description);

          await db.insert(transactions).values({
            userId,
            bankAccountId: connection.id,
            trueLayerId: tx.transaction_id,
            amount: tx.amount,
            description: tx.description,
            category,
            transactionDate: new Date(tx.timestamp),
          }).onConflictDoNothing(); // Skip if already exists
        }
      } catch (err) {
        console.warn(`Could not fetch transactions for account ${account.account_id}`, err);
      }
    }

    console.log(`Successfully connected TrueLayer for user ${userId}`);

    return NextResponse.redirect(new URL('/dashboard?connected=true', request.url));
  } catch (error) {
    console.error('Error in TrueLayer callback:', error);
    return NextResponse.redirect(
      new URL('/dashboard?error=connection_failed', request.url)
    );
  }
}
