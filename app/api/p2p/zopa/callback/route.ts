import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getP2PClient } from '@/lib/p2p';
import { db } from '@/lib/db';
import { p2pAccounts, p2pInterest } from '@/db/schema';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state'); // Contains userId

  if (error) {
    return NextResponse.redirect(
      new URL(`/dashboard/p2p?error=${error}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
  }

  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || (state && state !== userId)) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  try {
    const zopaClient = getP2PClient('zopa');

    // 1. Exchange code for access token
    const tokenData = await zopaClient.exchangeCode(code);

    // 2. Save P2P account to database
    const tokenExpiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    const [account] = await db
      .insert(p2pAccounts)
      .values({
        userId,
        provider: 'zopa',
        email: user?.emailAddresses[0]?.emailAddress || '',
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpiresAt,
      })
      .returning();

    // 3. Fetch initial interest payments (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const interestPayments = await zopaClient.getInterestPayments(
      tokenData.access_token,
      sixMonthsAgo.toISOString().split('T')[0]
    );

    // 4. Save interest payments to database
    for (const payment of interestPayments) {
      await db
        .insert(p2pInterest)
        .values({
          accountId: account.id,
          userId,
          amount: payment.amount,
          rate: payment.rate,
          interestDate: new Date(payment.date),
          description: payment.description,
        })
        .onConflictDoNothing();
    }

    // 5. Update last synced
    await db
      .update(p2pAccounts)
      .set({ lastSynced: new Date() })
      .where((acc) => acc.id === account.id);

    console.log(`Successfully connected Zopa for user ${userId}`);

    return NextResponse.redirect(new URL('/dashboard/p2p?connected=true', request.url));
  } catch (error) {
    console.error('Error in Zopa callback:', error);
    return NextResponse.redirect(
      new URL('/dashboard/p2p?error=connection_failed', request.url)
    );
  }
}

