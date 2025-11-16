import { NextResponse } from 'next/server';

// Placeholder for TrueLayer OAuth callback
// This would handle the redirect from TrueLayer after user authorizes access
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL(`/dashboard?error=${error}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
  }

  try {
    // TODO: Exchange code for access token
    // 1. Exchange authorization code for access token
    // 2. Fetch user's bank accounts from TrueLayer
    // 3. Store accounts in database
    // 4. Redirect to dashboard

    console.log('TrueLayer callback received with code:', code);

    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Error in TrueLayer callback:', error);
    return NextResponse.redirect(
      new URL('/dashboard?error=connection_failed', request.url)
    );
  }
}
