import { createHmac, timingSafeEqual } from 'crypto';
import { getServerAppUrl } from '@/lib/app-url';

const TOKEN_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

function secret(): string {
  return (
    process.env.GUARANTEE_CONSENT_SECRET ||
    process.env.SESSION_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.JWT_SECRET ||
    'majuu-guarantee-consent-dev-secret'
  );
}

function b64url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function fromB64url(input: string): Buffer {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
  return Buffer.from(padded + pad, 'base64');
}

export type GuaranteeConsentPayload = {
  memberId: string;
  applicationId: string;
  exp: number;
};

function signPayload(payloadB64: string): string {
  return createHmac('sha256', secret()).update(payloadB64).digest('base64url');
}

export function createGuaranteeConsentToken(input: {
  memberId: string;
  applicationId: string;
  ttlMs?: number;
}): string {
  const body: GuaranteeConsentPayload = {
    memberId: input.memberId,
    applicationId: input.applicationId,
    exp: Date.now() + (input.ttlMs ?? TOKEN_TTL_MS),
  };
  const payloadB64 = b64url(JSON.stringify(body));
  return `${payloadB64}.${signPayload(payloadB64)}`;
}

export function verifyGuaranteeConsentToken(
  token: string,
): GuaranteeConsentPayload | null {
  const [payloadB64, sig] = String(token || '').split('.');
  if (!payloadB64 || !sig) return null;

  const expected = signPayload(payloadB64);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  try {
    const parsed = JSON.parse(fromB64url(payloadB64).toString('utf8')) as GuaranteeConsentPayload;
    if (!parsed?.memberId || !parsed?.applicationId || !parsed?.exp) return null;
    if (Date.now() > Number(parsed.exp)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function buildGuaranteeConsentUrl(token: string): string {
  const base = getServerAppUrl() || 'https://majuu.uwezo.go.ke';
  return `${base.replace(/\/$/, '')}/consent/guarantee/${encodeURIComponent(token)}`;
}
