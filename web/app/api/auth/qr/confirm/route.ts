import {
  confirmQrChallenge,
  getQrChallenge,
  isQrLoginEnabled,
} from '@/lib/auth/qr-login';
import { optionsCors, withCors } from '@/lib/auth/cors-app';
import { verifyLoginOtp } from '@/lib/auth/otp';
import { loginWithEmail } from '@/lib/auth/user';
import {
  getSession,
  getSessionUserId,
  issueTokensForUser,
} from '@/lib/auth/session';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * App confirms a QR challenge after Option B verification.
 */
export async function POST(request: Request) {
  if (!isQrLoginEnabled()) {
    return withCors(
      request,
      NextResponse.json(
        { ok: false, error: 'QR login is disabled.' },
        { status: 403 },
      ),
    );
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return withCors(
      request,
      NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 }),
    );
  }

  const challengeId = String(body.challengeId || '').trim();
  if (!challengeId) {
    return withCors(
      request,
      NextResponse.json(
        { ok: false, error: 'challengeId is required.' },
        { status: 400 },
      ),
    );
  }

  const record = getQrChallenge(challengeId);
  if (!record || record.status === 'expired') {
    return withCors(
      request,
      NextResponse.json(
        { ok: false, error: 'QR challenge expired or not found.' },
        { status: 410 },
      ),
    );
  }
  if (record.status === 'consumed') {
    return withCors(
      request,
      NextResponse.json(
        { ok: false, error: 'QR challenge already used.' },
        { status: 409 },
      ),
    );
  }
  if (record.status === 'confirmed') {
    return withCors(
      request,
      NextResponse.json({
        ok: true,
        status: 'confirmed',
        message: 'Already confirmed. Waiting for the browser to finish login.',
      }),
    );
  }

  const requestOrigin = new URL(request.url).origin.replace(/\/$/, '');
  const configured = (
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    requestOrigin
  ).replace(/\/$/, '');
  if (
    record.origin.replace(/\/$/, '') !== configured &&
    record.origin.replace(/\/$/, '') !== requestOrigin
  ) {
    return withCors(
      request,
      NextResponse.json(
        { ok: false, error: 'Challenge origin mismatch.' },
        { status: 400 },
      ),
    );
  }

  let tokens: { accessToken: string; refreshToken: string } | null = null;
  const method = String(body.method || 'session').toLowerCase();

  try {
    if (method === 'phone_verify' || method === 'otp_verify') {
      const requestId = String(body.requestId || body.request_id || '').trim();
      const otp = String(body.otp || body.otp_code || body.code || '').trim();
      if (!requestId || !otp) {
        return withCors(
          request,
          NextResponse.json(
            { ok: false, error: 'OTP code and request id are required.' },
            { status: 400 },
          ),
        );
      }
      tokens = await verifyLoginOtp(requestId, otp);
    } else if (method === 'password' || method === 'email') {
      const username = String(body.username || body.email || '')
        .trim()
        .toLowerCase();
      const password = String(body.password || '');
      if (!username || !password) {
        return withCors(
          request,
          NextResponse.json(
            { ok: false, error: 'Email and password are required.' },
            { status: 400 },
          ),
        );
      }
      tokens = await loginWithEmail(username, password);
    } else {
      const userId = await getSessionUserId();
      const accessToken = await getSession();
      if (!userId || !accessToken) {
        return withCors(
          request,
          NextResponse.json(
            {
              ok: false,
              needAuth: true,
              error:
                'Verify phone OTP or email/password in the app first, then confirm.',
            },
            { status: 401 },
          ),
        );
      }
      tokens = await issueTokensForUser(userId);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Verification failed';
    return withCors(
      request,
      NextResponse.json({ ok: false, error: msg }, { status: 401 }),
    );
  }

  if (!tokens?.accessToken || !tokens.refreshToken) {
    return withCors(
      request,
      NextResponse.json(
        { ok: false, error: 'Could not issue login tokens.' },
        { status: 500 },
      ),
    );
  }

  const confirmed = confirmQrChallenge(challengeId, tokens);
  if (!confirmed || confirmed.status !== 'confirmed') {
    return withCors(
      request,
      NextResponse.json(
        { ok: false, error: 'Could not confirm QR challenge.' },
        { status: 409 },
      ),
    );
  }

  return withCors(
    request,
    NextResponse.json({
      ok: true,
      status: 'confirmed',
      message:
        'Confirmed. Return to the browser — it will finish signing you in automatically.',
    }),
  );
}

export async function OPTIONS(request: Request) {
  return optionsCors(request);
}
