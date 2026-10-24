import { getSessionUserId } from '@/lib/auth/session';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { generateTotpSecret, otpauthUri } from '@/lib/auth/totp';
import { optionsCors, withCors } from '@/lib/auth/cors-app';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const ISSUER = 'Uwezo Fund';

async function userIdFromRequest(request: Request): Promise<string | null> {
  const sessionUser = await getSessionUserId();
  if (sessionUser) return sessionUser;
  const header = request.headers.get('authorization') || '';
  const token = header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : '';
  if (!token) return null;
  const verified = await verifyAccessToken(token);
  return verified?.userId ?? null;
}

/**
 * Register a TOTP authenticator for the signed-in applicant.
 * Returns the same otpauth secret Microsoft Authenticator would store from a QR.
 */
export async function POST(request: Request) {
  const userId = await userIdFromRequest(request);
  if (!userId) {
    return withCors(
      request,
      NextResponse.json({ ok: false, error: 'Sign in before registering an authenticator.' }, { status: 401 }),
    );
  }

  let rotate = false;
  try {
    const body = (await request.json()) as { rotate?: boolean };
    rotate = Boolean(body?.rotate);
  } catch {
    rotate = false;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, phoneNumber: true, name: true, totpSecret: true },
  });
  if (!user) {
    return withCors(
      request,
      NextResponse.json({ ok: false, error: 'Account not found.' }, { status: 404 }),
    );
  }

  const secret = !rotate && user.totpSecret ? user.totpSecret : generateTotpSecret();
  if (secret !== user.totpSecret) {
    await prisma.user.update({
      where: { id: user.id },
      data: { totpSecret: secret, totpEnrolledAt: new Date() },
    });
  }

  const account = user.email || user.phoneNumber || user.name || 'application';
  return withCors(
    request,
    NextResponse.json({
      ok: true,
      issuer: ISSUER,
      account,
      secret,
      digits: 6,
      period: 30,
      algorithm: 'SHA1',
      otpauth: otpauthUri({ issuer: ISSUER, account, secret }),
    }),
  );
}

export async function OPTIONS(request: Request) {
  return optionsCors(request);
}
