import { optionsCors, withCors } from '@/lib/auth/cors-app';
import { verifyLoginOtp } from '@/lib/auth/otp';
import {
  loginWithEmail,
  registerWithEmail,
  upsertLoginWithEmailPhone,
} from '@/lib/auth/user';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Mobile app account endpoints (Option A):
 * - login_or_register (upsert-style)
 * - signup (email + verified phone OTP)
 * - reset_request
 */
export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return withCors(
      request,
      NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 }),
    );
  }

  const action = String(body.action || '').toLowerCase();
  const email = String(body.email || '')
    .trim()
    .toLowerCase();
  const password = String(body.password || '');
  const phone = String(body.phone || '').trim();

  try {
    if (action === 'login_or_register') {
      if (!email || !password) {
        return withCors(
          request,
          NextResponse.json(
            { ok: false, error: 'Email and password are required.' },
            { status: 400 },
          ),
        );
      }
      const createIfMissing = body.createIfMissing !== false;
      const result = await upsertLoginWithEmailPhone({
        email,
        password,
        phone,
        createIfMissing,
      });
      return withCors(
        request,
        NextResponse.json({
          ok: true,
          ...result.tokens,
          created: result.created,
          message: result.created
            ? 'Account created and signed in.'
            : 'Signed in.',
        }),
      );
    }

    if (action === 'signup') {
      const requestId = String(body.requestId || '').trim();
      const otp = String(body.otp || '').trim();
      if (!email || !password || !phone || !requestId || !otp) {
        return withCors(
          request,
          NextResponse.json(
            {
              ok: false,
              error: 'Email, password, phone, OTP, and requestId are required.',
            },
            { status: 400 },
          ),
        );
      }
      // Verify phone OTP first (creates/links phone user), then ensure email+password.
      await verifyLoginOtp(requestId, otp);
      const existing = await prisma.user.findUnique({ where: { email } });
      let tokens: { accessToken: string; refreshToken: string };
      if (existing) {
        tokens = await loginWithEmail(email, password).catch(async () => {
          // Link password if phone-verified account had none / mismatch after OTP verify path.
          return upsertLoginWithEmailPhone({
            email,
            password,
            phone,
            createIfMissing: true,
            forceUpdatePassword: true,
          }).then((r) => r.tokens);
        });
      } else {
        tokens = await registerWithEmail(email, password);
        await prisma.user.update({
          where: { email },
          data: { phoneNumber: phone },
        });
      }
      return withCors(
        request,
        NextResponse.json({
          ok: true,
          ...tokens,
          created: !existing,
          message: 'Account ready with verified phone.',
        }),
      );
    }

    if (action === 'refresh') {
      const refreshToken = String(
        body.refreshToken || body.refresh_token || '',
      ).trim();
      if (!refreshToken) {
        return withCors(
          request,
          NextResponse.json(
            { ok: false, error: 'refreshToken is required.' },
            { status: 400 },
          ),
        );
      }
      const { verifyRefreshToken } = await import('@/lib/auth/jwt');
      const { issueTokensForUser } = await import('@/lib/auth/session');
      const verified = await verifyRefreshToken(refreshToken);
      if (!verified?.userId) {
        return withCors(
          request,
          NextResponse.json(
            { ok: false, error: 'Session could not be renewed. Stay in the app and scan again.' },
            { status: 401 },
          ),
        );
      }
      const tokens = await issueTokensForUser(verified.userId);
      return withCors(
        request,
        NextResponse.json({
          ok: true,
          ...tokens,
          message: 'Session renewed.',
        }),
      );
    }

    if (action === 'reset_request') {
      if (!email) {
        return withCors(
          request,
          NextResponse.json(
            { ok: false, error: 'Email is required.' },
            { status: 400 },
          ),
        );
      }
      // Avoid account enumeration: always succeed; email link uses existing reset flow when present.
      const user = await prisma.user.findUnique({ where: { email } });
      if (user?.email) {
        try {
          const { sendPlainEmail } = await import('@/lib/email/mail.service');
          const appUrl = (
            process.env.APP_URL ||
            process.env.NEXT_PUBLIC_APP_URL ||
            'https://majuu.uwezo.go.ke'
          ).replace(/\/$/, '');
          await sendPlainEmail({
            to: email,
            subject: 'Uwezo Fund password reset',
            text: `Reset your password here: ${appUrl}/reset\nIf you did not request this, ignore this email.`,
          });
        } catch (e) {
          console.error('[app/account] reset email failed', e);
        }
      }
      return withCors(
        request,
        NextResponse.json({
          ok: true,
          message:
            'If that email exists, a password reset message was sent. You can also use the website Reset page.',
        }),
      );
    }

    return withCors(
      request,
      NextResponse.json({ ok: false, error: 'Unknown action.' }, { status: 400 }),
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Account action failed';
    return withCors(
      request,
      NextResponse.json({ ok: false, error: msg }, { status: 400 }),
    );
  }
}

export async function OPTIONS(request: Request) {
  return optionsCors(request);
}
