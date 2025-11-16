import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getTrueLayerClient } from '@/lib/truelayer';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const truelayer = getTrueLayerClient();
    const authUrl = truelayer.getAuthUrl(userId);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error creating TrueLayer auth URL:', error);
    return NextResponse.json({ error: 'Failed to connect to TrueLayer' }, { status: 500 });
  }
}

