import { createHash, randomBytes } from 'crypto';
import { upsertEcitizenUser } from '@/lib/auth/ecitizen-user';
import { issueTokensForUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

const ECITIZEN_AUTH_URL =
  process.env.ECITIZEN_AUTH_URL ??
  'https://accounts.ecitizen.go.ke/oauth/authorize';
const ECITIZEN_TOKEN_URL =
  process.env.ECITIZEN_TOKEN_URL ??
  'https://accounts.ecitizen.go.ke/oauth/access-token';
const ECITIZEN_USER_INFO_URL =
  process.env.ECITIZEN_USER_INFO_URL ??
  'https://accounts.ecitizen.go.ke/api/user-info';

function getEcitizenConfig() {
  const clientId = process.env.ECITIZEN_CLIENT_ID;
  const clientSecret = process.env.ECITIZEN_CLIENT_SECRET;
  const redirectUri =
    process.env.ECITIZEN_REDIRECT_URI ??
    (process.env.APP_URL
      ? `${process.env.APP_URL.replace(/\/$/, '')}/api/auth/ecitizen/callback`
      : undefined);

  if (!redirectUri) {
    throw new Error('eCitizen OAuth redirect URI is not configured');
  }

  if (!clientId || !clientSecret) {
    throw new Error('eCitizen OAuth is not configured');
  }

  return { clientId, clientSecret, redirectUri };
}

function generateRandomString(length: number): string {
  const charset =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const bytes = randomBytes(length);
  return Array.from(bytes, (byte) => charset[byte % charset.length]).join('');
}

function generateCodeChallenge(codeVerifier: string): string {
  return createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');
}

export async function startEcitizenLogin(callbackUrl: string) {
  const { clientId, redirectUri } = getEcitizenConfig();
  const codeVerifier = generateRandomString(64);
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = generateRandomString(32);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.ecitizenPkceState.create({
    data: {
      state,
      codeVerifier,
      callbackUrl,
      expiresAt,
    },
  });

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'openid profile email',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state,
  });

  return `${ECITIZEN_AUTH_URL}?${params.toString()}`;
}

interface EcitizenUserInfo {
  id?: string;
  first_name?: string;
  last_name?: string;
  surname?: string;
  email?: string;
  mobile_number?: string;
  id_number?: string;
  kra_pin_number?: string;
}

export async function completeEcitizenLogin(code: string, state: string) {
  const pkceState = await prisma.ecitizenPkceState.findUnique({
    where: { state },
  });

  if (!pkceState || pkceState.expiresAt < new Date()) {
    throw new Error('Invalid or expired OAuth state');
  }

  await prisma.ecitizenPkceState.delete({ where: { id: pkceState.id } });

  const { clientId, clientSecret, redirectUri } = getEcitizenConfig();

  const tokenResponse = await fetch(ECITIZEN_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
      code_verifier: pkceState.codeVerifier,
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error('Token exchange failed');
  }

  const tokenData = (await tokenResponse.json()) as { access_token?: string };
  if (!tokenData.access_token) {
    throw new Error('Token exchange failed');
  }

  const userInfoResponse = await fetch(ECITIZEN_USER_INFO_URL, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!userInfoResponse.ok) {
    throw new Error('Failed to fetch user info');
  }

  const userInfo = (await userInfoResponse.json()) as EcitizenUserInfo;
  const fullName = [userInfo.first_name, userInfo.last_name, userInfo.surname]
    .filter(Boolean)
    .join(' ')
    .trim();
  const ecitizenId = userInfo.id ?? userInfo.id_number ?? undefined;

  const user = await upsertEcitizenUser({
    email: userInfo.email,
    name: fullName,
    mobileNumber: userInfo.mobile_number,
    idNumber: userInfo.id_number,
    kraPin: userInfo.kra_pin_number,
    ecitizenId,
  });

  const tokens = await issueTokensForUser(user.id);
  return { tokens, callbackUrl: pkceState.callbackUrl };
}
