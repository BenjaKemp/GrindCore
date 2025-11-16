import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getP2PClient } from '@/lib/p2p';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const zopaClient = getP2PClient('zopa');
    const authUrl = zopaClient.getAuthUrl(userId);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error creating Zopa auth URL:', error);
    return NextResponse.json({ error: 'Failed to connect to Zopa' }, { status: 500 });
  }
}

