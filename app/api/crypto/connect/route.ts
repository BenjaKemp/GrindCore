import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { cryptoWallets } from '@/db/schema';
import { detectChain } from '@/lib/crypto';

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { address, label } = await request.json();

    if (!address) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    // Detect chain from address
    const chain = detectChain(address);

    if (!chain) {
      return NextResponse.json(
        { error: 'Unable to detect blockchain. Please specify the chain.' },
        { status: 400 }
      );
    }

    // Check if wallet already exists
    const existing = await db
      .select()
      .from(cryptoWallets)
      .where((wallets) => wallets.address === address)
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Wallet already connected' },
        { status: 400 }
      );
    }

    // Save wallet to database
    const [wallet] = await db
      .insert(cryptoWallets)
      .values({
        userId,
        address,
        chain,
        label: label || `${chain} wallet`,
      })
      .returning();

    return NextResponse.json({
      success: true,
      wallet,
      message: 'Crypto wallet connected successfully',
    });
  } catch (error) {
    console.error('Error connecting crypto wallet:', error);
    return NextResponse.json(
      { error: 'Failed to connect wallet' },
      { status: 500 }
    );
  }
}

// Get user's connected wallets
export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const wallets = await db
      .select()
      .from(cryptoWallets)
      .where((w) => w.userId === userId);

    return NextResponse.json({ wallets });
  } catch (error) {
    console.error('Error fetching crypto wallets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallets' },
      { status: 500 }
    );
  }
}

