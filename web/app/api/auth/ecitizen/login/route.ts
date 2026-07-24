import { isValidReturnPath } from '@/lib/auth/return-path';
import { NextRequest, NextResponse } from 'next/server';

function getAdminDomain(request: NextRequest): string {
  return (
    process.env.NEXT_PUBLIC_ADMIN_DOMAIN ??
    process.env.ADMIN_DOMAIN ??
    'https://loans-admin.uwezo.go.ke'
  ).replace(/\/$/, '');
}

function getPortalOrigin(request: NextRequest): string {
  return (
    process.env.APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    request.nextUrl.origin
  ).replace(/\/$/, '');
}

export async function GET(request: NextRequest) {
  try {
    const callbackUrl =
      request.nextUrl.searchParams.get('callbackUrl') ?? '/dashboard';
    const safeCallback = isValidReturnPath(callbackUrl)
      ? callbackUrl
      : '/dashboard';
    const authUrl = new URL(`${getAdminDomain(request)}/api/oauth/ecitizen/login`);
    authUrl.searchParams.set('origin', getPortalOrigin(request));
    authUrl.searchParams.set('callbackUrl', safeCallback);
    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'OAuth initialization failed';
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', message);
    return NextResponse.redirect(loginUrl);
  }
}
