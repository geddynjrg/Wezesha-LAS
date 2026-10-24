import { getSessionUserId } from '@/lib/auth/session';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { verifyTotp } from '@/lib/auth/totp';
import { optionsCors, withCors } from '@/lib/auth/cors-app';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

async function userIdFromRequest(request: Request): Promise<string | null> {
  const sessionUser = await getSessionUserId();
  if (sessionUser) return sessionUser;
  const header = request.headers.get('authorization') || '';
  const token = header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : '';
  if (!token) return null;
  const verified = await verifyAccessToken(token);
  return verified?.userId ?? null;
}

export async function POST(request: Request) {
  const userId = await userIdFromRequest(request);
  if (!userId) {
    return withCors(
      request,
      NextResponse.json({ ok: false, error: 'Sign in first.' }, { status: 401 }),
    );
  }

  let code = '';
  try {
    const body = (await request.json()) as { code?: string };
    code = String(body?.code || '');
  } catch {
    code = '';
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totpSecret: true },
  });
  if (!user?.totpSecret) {
    return withCors(
      request,
      NextResponse.json(
        { ok: false, error: 'No authenticator is registered for this account.' },
        { status: 400 },
      ),
    );
  }

  const ok = verifyTotp(user.totpSecret, code);
  return withCors(
    request,
    NextResponse.json(
      ok
        ? { ok: true }
        : { ok: false, error: 'That code is not valid. Wait for the next code and try again.' },
      { status: ok ? 200 : 401 },
    ),
  );
}

export async function OPTIONS(request: Request) {
  return optionsCors(request);
}
