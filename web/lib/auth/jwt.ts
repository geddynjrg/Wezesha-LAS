import { createHash, randomBytes } from 'crypto';
import { SignJWT, jwtVerify } from 'jose';

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL_DAYS = 7;

function getAccessSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return new TextEncoder().encode(secret);
}

function getRefreshSecret(): Uint8Array {
  const secret = process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET is not configured');
  }
  return new TextEncoder().encode(secret);
}

export async function signAccessToken(userId: string, role?: string): Promise<string> {
  return new SignJWT({ sub: userId, role: role ?? 'APPLICANT' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_TTL)
    .sign(getAccessSecret());
}

export async function signRefreshToken(userId: string, role?: string): Promise<string> {
  return new SignJWT({ sub: userId, role: role ?? 'APPLICANT' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_TOKEN_TTL_DAYS}d`)
    .sign(getRefreshSecret());
}

export async function verifyAccessToken(
  token: string,
): Promise<{ userId: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getAccessSecret());
    const userId = payload.sub;
    const role = typeof payload.role === 'string' ? payload.role : 'APPLICANT';
    return typeof userId === 'string' ? { userId, role } : null;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(
  token: string,
): Promise<{ userId: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getRefreshSecret());
    const userId = payload.sub;
    const role = typeof payload.role === 'string' ? payload.role : 'APPLICANT';
    return typeof userId === 'string' ? { userId, role } : null;
  } catch {
    return null;
  }
}

export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function hashOtpCode(code: string): string {
  return createHash('sha256').update(code).digest('hex');
}

export function generateRequestId(): string {
  return randomBytes(16).toString('hex');
}

export function getRefreshTokenExpiryDate(): Date {
  return new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
}
