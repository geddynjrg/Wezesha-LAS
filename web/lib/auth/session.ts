'use server';

import {
  hashRefreshToken,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  getRefreshTokenExpiryDate,
} from '@/lib/auth/jwt';
import { isTokenExpired } from '@/lib/auth/jwt-utils';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

const ACCESS_TOKEN_COOKIE_NAME = 'access-token';
const REFRESH_TOKEN_COOKIE_NAME = 'refresh-token';

function shouldUseSecureCookies(): boolean {
  const appUrl = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? '';
  if (appUrl.startsWith('http://')) {
    return false;
  }
  return process.env.NODE_ENV === 'production';
}

export async function createSession(data: {
  accessToken: string;
  refreshToken: string;
}) {
  const cookieStore = await cookies();
  const secure = shouldUseSecureCookies();
  const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  cookieStore.set(ACCESS_TOKEN_COOKIE_NAME, data.accessToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
  });
  cookieStore.set(REFRESH_TOKEN_COOKIE_NAME, data.refreshToken, {
    httpOnly: true,
    secure,
    expires: refreshTokenExpiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function getSession(): Promise<string | null> {
  return (await cookies()).get(ACCESS_TOKEN_COOKIE_NAME)?.value ?? null;
}

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value;

  if (accessToken && !isTokenExpired(accessToken)) {
    const verified = await verifyAccessToken(accessToken);
    return verified?.userId ?? null;
  }

  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value;
  if (!refreshToken) {
    return null;
  }

  const verified = await verifyRefreshToken(refreshToken);
  if (!verified) {
    return null;
  }

  const tokenHash = hashRefreshToken(refreshToken);
  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash },
  });

  if (!storedToken || storedToken.expiresAt < new Date()) {
    return null;
  }

  return verified.userId;
}

export async function updateSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value;

  if (accessToken && !isTokenExpired(accessToken)) {
    return accessToken;
  }

  if (!refreshToken) {
    await deleteCookies();
    return null;
  }

  const verified = await verifyRefreshToken(refreshToken);
  if (!verified) {
    await deleteCookies();
    return null;
  }

  const tokenHash = hashRefreshToken(refreshToken);
  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash },
  });

  if (!storedToken || storedToken.expiresAt < new Date()) {
    await deleteCookies();
    return null;
  }

  const newAccessToken = await signAccessToken(verified.userId);
  const newRefreshToken = await signRefreshToken(verified.userId);

  await prisma.$transaction([
    prisma.refreshToken.deleteMany({ where: { tokenHash } }),
    prisma.refreshToken.create({
      data: {
        userId: verified.userId,
        tokenHash: hashRefreshToken(newRefreshToken),
        expiresAt: getRefreshTokenExpiryDate(),
      },
    }),
  ]);

  await createSession({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });

  return newAccessToken;
}

export async function invalidateSession() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value;

  if (refreshToken) {
    const tokenHash = hashRefreshToken(refreshToken);
    await prisma.refreshToken.deleteMany({ where: { tokenHash } });
  }

  await deleteCookies();
}

async function deleteCookies() {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_COOKIE_NAME, '', { expires: new Date(0), path: '/' });
  cookieStore.set(REFRESH_TOKEN_COOKIE_NAME, '', { expires: new Date(0), path: '/' });
}

export async function issueTokensForUser(userId: string) {
  const accessToken = await signAccessToken(userId);
  const refreshToken = await signRefreshToken(userId);

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashRefreshToken(refreshToken),
      expiresAt: getRefreshTokenExpiryDate(),
    },
  });

  return { accessToken, refreshToken };
}
