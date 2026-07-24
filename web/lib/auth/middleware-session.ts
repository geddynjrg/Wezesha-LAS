import {
  verifyAccessTokenEdge,
  verifyRefreshTokenEdge,
} from '@/lib/auth/jwt-verify-edge';
import { isTokenExpired } from '@/lib/auth/jwt-utils';
import { cookies } from 'next/headers';

const ACCESS_TOKEN_COOKIE_NAME = 'access-token';
const REFRESH_TOKEN_COOKIE_NAME = 'refresh-token';

/** Returns a cryptographically verified, non-expired access token if present. */
export async function getValidAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value;

  if (!accessToken || isTokenExpired(accessToken)) {
    return null;
  }

  const verified = await verifyAccessTokenEdge(accessToken);
  return verified ? accessToken : null;
}

async function getVerifiedRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value;

  if (!refreshToken || isTokenExpired(refreshToken)) {
    return null;
  }

  const verified = await verifyRefreshTokenEdge(refreshToken);
  return verified ? refreshToken : null;
}

/** Lightweight session check for middleware (no DB/Prisma). */
export async function getMiddlewareSession(): Promise<string | null> {
  const accessToken = await getValidAccessToken();
  if (accessToken) {
    return accessToken;
  }

  return getVerifiedRefreshToken();
}

/** Whether the user has an active access session (login page redirect only). */
export async function hasActiveAccessSession(): Promise<boolean> {
  return (await getValidAccessToken()) !== null;
}
