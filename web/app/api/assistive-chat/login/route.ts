import { loginWithEmail } from '@/lib/auth/user';
import { createSession, getSessionUserId } from '@/lib/auth/session';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Chat login — validates against real Majuu email/password auth.
 * Sets httpOnly session cookies. Never logs or returns the password.
 */
export async function POST(request: Request) {
  let username = '';
  let password = '';
  try {
    const body = (await request.json()) as {
      username?: string;
      password?: string;
    };
    username = String(body.username || '').trim();
    password = String(body.password || '');
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  if (!username || !password) {
    return NextResponse.json(
      { ok: false, error: 'Username and password are required.' },
      { status: 400 },
    );
  }

  // Treat username as email for Majuu portal password login
  const email = username.includes('@') ? username : username;

  try {
    const tokens = await loginWithEmail(email, password);
    await createSession(tokens);
    const userId = await getSessionUserId();
    return NextResponse.json({
      ok: true,
      userId,
      username: email,
      message: 'Signed in successfully.',
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error:
          'Invalid email or password. Use the email and password for your Majuu account, or sign in via /login (phone OTP / eCitizen).',
      },
      { status: 401 },
    );
  }
}

export async function GET() {
  const userId = await getSessionUserId();
  return NextResponse.json({
    authenticated: Boolean(userId),
    userId: userId || null,
  });
}
