import { jwtVerify } from 'jose';

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

export async function verifyAccessTokenEdge(
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

export async function verifyRefreshTokenEdge(
  token: string,
): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getRefreshSecret());
    const userId = payload.sub;
    return typeof userId === 'string' ? { userId } : null;
  } catch {
    return null;
  }
}
