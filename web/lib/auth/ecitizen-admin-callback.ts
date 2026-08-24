'use server';

import { upsertEcitizenUser } from '@/lib/auth/ecitizen-user';
import { createSession, issueTokensForUser } from '@/lib/auth/session';
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { URL } from 'node:url';

function getPublicAdminDomain(): string {
  return (
    process.env.ADMIN_DOMAIN ??
    process.env.NEXT_PUBLIC_ADMIN_DOMAIN ??
    'https://loans-admin.uwezo.go.ke'
  ).replace(/\/$/, '');
}

function getAdminProfileRequestTarget(): { baseUrl: string; hostHeader?: string } {
  const internalDomain = process.env.ADMIN_INTERNAL_DOMAIN?.replace(/\/$/, '');
  if (internalDomain) {
    return {
      baseUrl: internalDomain,
      hostHeader: new URL(getPublicAdminDomain()).host,
    };
  }

  return { baseUrl: getPublicAdminDomain() };
}

async function readHttpResponse(
  url: URL,
  headers: Record<string, string>,
): Promise<{ statusCode: number; body: string }> {
  const requestFn = url.protocol === 'https:' ? httpsRequest : httpRequest;

  return new Promise((resolve, reject) => {
    const req = requestFn(
      {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: `${url.pathname}${url.search}`,
        method: 'GET',
        headers,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode ?? 500,
            body: Buffer.concat(chunks).toString('utf8'),
          });
        });
      },
    );

    req.on('error', reject);
    req.setTimeout(10_000, () => {
      req.destroy(new Error('Admin profile request timed out'));
    });
    req.end();
  });
}

async function verifyAdminAccessToken(adminAccessToken: string): Promise<string> {
  const { baseUrl, hostHeader } = getAdminProfileRequestTarget();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${adminAccessToken}`,
    Accept: 'application/json',
  };
  if (hostHeader) {
    headers.Host = hostHeader;
  }

  const profileUrl = new URL(`${baseUrl}/api/v1/user/profile`);

  let statusCode: number;
  let body: string;
  try {
    ({ statusCode, body } = await readHttpResponse(profileUrl, headers));
  } catch {
    throw new Error(
      'Unable to reach loans admin to verify your login. Please try again.',
    );
  }

  if (statusCode !== 200) {
    throw new Error('Unable to verify eCitizen login with loans admin.');
  }

  const payload = JSON.parse(body) as {
    data?: { email?: string };
  };
  const email = payload.data?.email?.trim();

  if (!email) {
    throw new Error('Loans admin profile did not include an email address.');
  }

  return email;
}

export type EcitizenBootstrapResult =
  | { ok: true }
  | { ok: false; error: string };

export async function bootstrapEcitizenSessionFromAdmin(params: {
  adminAccessToken: string;
  email?: string | null;
  name?: string | null;
  mobileNumber?: string | null;
  idNumber?: string | null;
  kraPin?: string | null;
  ecitizenId?: string | null;
}): Promise<EcitizenBootstrapResult> {
  try {
    return await bootstrapEcitizenSessionFromAdminInternal(params);
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : 'Authentication failed. Please try again.',
    };
  }
}

async function bootstrapEcitizenSessionFromAdminInternal(params: {
  adminAccessToken: string;
  email?: string | null;
  name?: string | null;
  mobileNumber?: string | null;
  idNumber?: string | null;
  kraPin?: string | null;
  ecitizenId?: string | null;
}): Promise<EcitizenBootstrapResult> {
  const verifiedEmail = await verifyAdminAccessToken(params.adminAccessToken);
  const email = params.email?.trim() || verifiedEmail;
  if (email !== verifiedEmail) {
    throw new Error('eCitizen profile email mismatch.');
  }

  const user = await upsertEcitizenUser({
    verifiedEmail: email,
    email,
    name: params.name,
    mobileNumber: params.mobileNumber,
    idNumber: params.idNumber,
    kraPin: params.kraPin,
    ecitizenId: params.ecitizenId,
  });

  const tokens = await issueTokensForUser(user.id);
  await createSession(tokens);
  return { ok: true };
}
