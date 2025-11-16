import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { incomeStreams } from '@/db/schema';
import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

// GET /api/streams - List all income streams for the authenticated user
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const streams = await db
      .select()
      .from(incomeStreams)
      .where(eq(incomeStreams.userId, userId))
      .orderBy(incomeStreams.createdAt);

    return NextResponse.json(streams);
  } catch (error) {
    console.error('Error fetching streams:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/streams - Create a new income stream
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, category, amount, frequency, description, status } = body;

    // Validate required fields
    if (!name || !category || !amount || !frequency) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await db.insert(incomeStreams).values({
      userId,
      name,
      category,
      amount,
      frequency,
      description: description || null,
      status: status || 'active',
    }).returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating stream:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
