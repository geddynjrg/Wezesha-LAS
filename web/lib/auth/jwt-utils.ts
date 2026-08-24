export function decodeJwtPayload(token: string): {
  sub?: string;
  exp?: number;
  iat?: number;
} | null {
  try {
    const tokenPayloadBase64 = token.split('.')[1];
    if (!tokenPayloadBase64) {
      return null;
    }
    return JSON.parse(atob(tokenPayloadBase64));
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) {
    return true;
  }
  return Date.now() > payload.exp * 1000;
}
