import {
  getReturnPathFromCookieValue,
  isValidReturnPath,
} from '@/lib/auth/return-path';
import {
  getMiddlewareSession,
  hasActiveAccessSession,
} from '@/lib/auth/middleware-session';
import { type NextRequest, NextResponse, userAgent } from 'next/server';

const applicantProtectedRoutes = ['/apply', '/dashboard'];
const applicantPublicRoutes = ['/login', '/signup', '/ecitizen'];
const psProtectedRoutes = ['/ps/dashboard', '/ps/signing', '/ps/applications', '/ps/profile', '/ps/help'];
const psPublicRoutes = ['/ps/sign-in'];
const PS_ROLES = new Set(['PS_LABOUR', 'PS_MSME']);

const ACCESS_TOKEN_COOKIE = 'access-token';
const REFRESH_TOKEN_COOKIE = 'refresh-token';

function clearAuthCookies(response: NextResponse) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, '', {
    expires: new Date(0),
    path: '/',
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, '', {
    expires: new Date(0),
    path: '/',
  });
}

function hasAuthCookieValues(request: NextRequest): boolean {
  return Boolean(
    request.cookies.get(ACCESS_TOKEN_COOKIE)?.value ||
      request.cookies.get(REFRESH_TOKEN_COOKIE)?.value,
  );
}

function buildProtectedLoginUrl(request: NextRequest): URL {
  const path = request.nextUrl.pathname;
  const loginUrl = new URL('/login', request.nextUrl);

  if (path === '/apply/create') {
    loginUrl.searchParams.set('callbackUrl', '/apply/create');
    return loginUrl;
  }

  const callbackUrl = path + request.nextUrl.search;
  if (isValidReturnPath(callbackUrl)) {
    loginUrl.searchParams.set('callbackUrl', callbackUrl);
  }

  return loginUrl;
}

function isPsRole(role: string): boolean {
  return PS_ROLES.has(role);
}

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const { device } = userAgent(request);
  const deviceType =
    device.type === 'mobile' || device.type === 'tablet' ? 'mobile' : 'desktop';

  requestHeaders.set('x-path', request.nextUrl.pathname);
  requestHeaders.set('x-device-type', deviceType);

  const path = request.nextUrl.pathname;
  const isApplicantProtected = applicantProtectedRoutes.some((route) =>
    path.startsWith(route),
  );
  const isApplicantPublic = applicantPublicRoutes.some((route) =>
    path.startsWith(route),
  );
  const isPsProtected = psProtectedRoutes.some((route) => path.startsWith(route));
  const isPsPublic = psPublicRoutes.some((route) => path.startsWith(route));
  const needsSession =
    isApplicantProtected || isPsProtected || isPsPublic || isApplicantPublic;
  const session = needsSession ? await getMiddlewareSession() : null;

  if (isPsPublic && path.startsWith('/ps/sign-in')) {
    if (session && isPsRole(session.role)) {
      return NextResponse.redirect(new URL('/ps/dashboard', request.nextUrl), {
        headers: requestHeaders,
      });
    }

    if (!session && hasAuthCookieValues(request)) {
      const response = NextResponse.next({
        request: { headers: requestHeaders },
      });
      clearAuthCookies(response);
      return response;
    }
  }

  if (isApplicantPublic && path.startsWith('/login')) {
    if (session && isPsRole(session.role)) {
      return NextResponse.redirect(new URL('/ps/dashboard', request.nextUrl), {
        headers: requestHeaders,
      });
    }

    if (await hasActiveAccessSession()) {
      const savedPath =
        getReturnPathFromCookieValue(
          request.cookies.get('majuu_return_path')?.value,
        ) ?? '/dashboard';

      return NextResponse.redirect(new URL(savedPath, request.nextUrl), {
        headers: requestHeaders,
      });
    }

    if (!session && hasAuthCookieValues(request)) {
      const response = NextResponse.next({
        request: { headers: requestHeaders },
      });
      clearAuthCookies(response);
      return response;
    }
  }

  if (isPsProtected) {
    if (!session) {
      const loginUrl = new URL('/ps/sign-in', request.nextUrl);
      const callbackUrl = path + request.nextUrl.search;
      if (isValidReturnPath(callbackUrl)) {
        loginUrl.searchParams.set('callbackUrl', callbackUrl);
      }
      return NextResponse.redirect(loginUrl, { headers: requestHeaders });
    }

    if (!isPsRole(session.role)) {
      return NextResponse.redirect(new URL('/dashboard', request.nextUrl), {
        headers: requestHeaders,
      });
    }
  }

  if (isApplicantProtected) {
    if (!session) {
      const loginUrl = buildProtectedLoginUrl(request);
      return NextResponse.redirect(loginUrl, { headers: requestHeaders });
    }

    if (isPsRole(session.role)) {
      return NextResponse.redirect(new URL('/ps/dashboard', request.nextUrl), {
        headers: requestHeaders,
      });
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|robots.txt|sitemap.xml).*)',
  ],
};
