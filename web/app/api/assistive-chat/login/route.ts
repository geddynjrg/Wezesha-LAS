import { requestLoginOtp, verifyLoginOtp } from '@/lib/auth/otp';
import { loginWithEmail } from '@/lib/auth/user';
import { createSession, getSessionUserId } from '@/lib/auth/session';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Chat login — email/password, mobile OTP, or eCitizen redirect hint.
 * Never logs passwords or OTP codes.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const method = String(body.method || 'password').toLowerCase();

  if (method === 'phone_send' || method === 'otp_send') {
    const phone = String(body.phone || body.username || '').trim();
    if (!phone) {
      return NextResponse.json(
        { ok: false, error: 'Enter a Kenyan mobile number (e.g. 07… or +254…).' },
        { status: 400 },
      );
    }
    try {
      const result = await requestLoginOtp(phone);
      return NextResponse.json({
        ok: true,
        method: 'phone',
        requestId: result.request_id,
        message:
          'OTP sent by SMS. Enter the 6-digit code here. First-time numbers create an account automatically.',
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not send OTP';
      return NextResponse.json({ ok: false, error: msg }, { status: 400 });
    }
  }

  if (method === 'phone_verify' || method === 'otp_verify') {
    const requestId = String(body.requestId || body.request_id || '').trim();
    const otpCode = String(body.otp || body.otp_code || body.code || '').trim();
    if (!requestId || !otpCode) {
      return NextResponse.json(
        { ok: false, error: 'OTP code and request id are required.' },
        { status: 400 },
      );
    }
    try {
      const tokens = await verifyLoginOtp(requestId, otpCode);
      await createSession(tokens);
      const userId = await getSessionUserId();
      return NextResponse.json({
        ok: true,
        method: 'phone',
        userId,
        message: 'Signed in with mobile OTP.',
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Invalid or expired OTP';
      return NextResponse.json({ ok: false, error: msg }, { status: 401 });
    }
  }

  if (method === 'ecitizen') {
    const callbackUrl = String(body.callbackUrl || '/').trim() || '/';
    const redirect = `/api/auth/ecitizen/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;
    return NextResponse.json({
      ok: true,
      method: 'ecitizen',
      redirect,
      message:
        'eCitizen opens in the browser (OAuth via loans-admin). After you finish, return here and reopen Help — you will already be signed in. Password/OTP for eCitizen cannot be completed inside this chat widget.',
    });
  }

  // Default: email / password
  const username = String(body.username || '').trim();
  const password = String(body.password || '');
  if (!username || !password) {
    return NextResponse.json(
      { ok: false, error: 'Username and password are required.' },
      { status: 400 },
    );
  }

  const email = username.includes('@') ? username : username;
  try {
    const tokens = await loginWithEmail(email, password);
    await createSession(tokens);
    const userId = await getSessionUserId();
    return NextResponse.json({
      ok: true,
      method: 'password',
      userId,
      username: email,
      message: 'Signed in successfully.',
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error:
          'Invalid email or password. Try Mobile OTP or eCitizen from the sign-in options.',
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
