import { getServerAppUrl } from '@/lib/app-url';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Legacy majuu-only eCitizen callback. OAuth now completes on loans-admin and
 * returns through /ecitizen/callback on this portal.
 */
export async function GET(request: NextRequest) {
  const appUrl = getServerAppUrl(request);
  const loginUrl = new URL('/login', appUrl);
  loginUrl.searchParams.set(
    'error',
    'Direct eCitizen callback is disabled. Use Sign in with eCitizen on the login page.',
  );
  return NextResponse.redirect(loginUrl);
}
