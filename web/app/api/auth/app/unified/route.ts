import { optionsCors, withCors } from '@/lib/auth/cors-app';
import { upsertPortalIdentity } from '@/lib/auth/portal-identity';
import { upsertLoginWithEmailPhone } from '@/lib/auth/user';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type Tokens = { accessToken: string; refreshToken: string };

const LOANS_ACCOUNT_URL = (
  process.env.LOANS_APP_ACCOUNT_URL || 'http://uwezo-prod-web:3000/api/auth/app/account'
).replace(/\/$/, '');

async function majuuLogin(input: {
  email: string;
  password: string;
  phone?: string;
  createIfMissing: boolean;
}): Promise<{ created: boolean; tokens: Tokens; userId: string | null } | null> {
  try {
    const result = await upsertLoginWithEmailPhone({
      email: input.email,
      password: input.password,
      phone: input.phone,
      createIfMissing: input.createIfMissing,
    });
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true },
    });
    return { created: result.created, tokens: result.tokens, userId: user?.id || null };
  } catch {
    return null;
  }
}

async function loansLogin(input: {
  email: string;
  password: string;
  phone?: string;
  createIfMissing: boolean;
}): Promise<{ created: boolean; tokens: Tokens } | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(LOANS_ACCOUNT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        action: 'login_or_register',
        email: input.email,
        password: input.password,
        phone: input.phone || '',
        createIfMissing: input.createIfMissing,
      }),
      signal: ctrl.signal,
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      created?: boolean;
      accessToken?: string;
      access_token?: string;
      refreshToken?: string;
      refresh_token?: string;
    };
    const accessToken = String(data.accessToken || data.access_token || '');
    const refreshToken = String(data.refreshToken || data.refresh_token || '');
    if (!res.ok || data.ok === false || !accessToken) return null;
    return {
      created: Boolean(data.created),
      tokens: { accessToken, refreshToken },
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * One email, phone, and password for the Uwezo app.
 * Each portal keeps its own user row. This records the link and returns a token per portal that accepted the password.
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

  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const phone = String(body.phone || '').trim();
  if (!email || !password) {
    return withCors(
      request,
      NextResponse.json(
        { ok: false, error: 'Email and password are required.' },
        { status: 400 },
      ),
    );
  }
  if (password.length < 8) {
    return withCors(
      request,
      NextResponse.json(
        { ok: false, error: 'Password must be at least 8 characters.' },
        { status: 400 },
      ),
    );
  }

  let majuu = await majuuLogin({ email, password, phone, createIfMissing: false });
  let loans = await loansLogin({ email, password, phone, createIfMissing: false });

  if (loans && !majuu) {
    majuu = await majuuLogin({ email, password, phone, createIfMissing: true });
  }

  if (!majuu && !loans) {
    majuu = await majuuLogin({ email, password, phone, createIfMissing: true });
    loans = await loansLogin({ email, password, phone, createIfMissing: true });
  }

  if (!majuu && !loans) {
    return withCors(
      request,
      NextResponse.json(
        { ok: false, error: 'Email or password was not accepted.' },
        { status: 401 },
      ),
    );
  }

  await upsertPortalIdentity({
    email,
    phone,
    majuuUserId: majuu?.userId,
    loansLinked: Boolean(loans),
  }).catch(() => undefined);

  const portals = [
    ...(majuu ? ['https://majuu.uwezo.go.ke'] : []),
    ...(loans ? ['https://loans.uwezo.go.ke'] : []),
  ];
  const created = Boolean(majuu?.created || loans?.created);
  const message =
    majuu && loans
      ? 'Signed in. This account can open Wezesha Majuu and Loans.'
      : majuu
        ? 'Signed in to Wezesha Majuu. Loans did not accept this email and password, so that portal is not linked yet.'
        : 'Signed in to Loans. Wezesha Majuu did not accept this email and password, so that portal is not linked yet.';

  return withCors(
    request,
    NextResponse.json({
      ok: true,
      created,
      message,
      portals,
      email,
      phone,
      accessToken: majuu?.tokens.accessToken || loans?.tokens.accessToken,
      refreshToken: majuu?.tokens.refreshToken || loans?.tokens.refreshToken,
      majuuAccessToken: majuu?.tokens.accessToken || '',
      majuuRefreshToken: majuu?.tokens.refreshToken || '',
      loansAccessToken: loans?.tokens.accessToken || '',
      loansRefreshToken: loans?.tokens.refreshToken || '',
    }),
  );
}

export async function OPTIONS(request: Request) {
  return optionsCors(request);
}
