import {
  getReturnPathFromCookieValue,
  isValidReturnPath,
} from '@/lib/auth/return-path';
import {
  getMiddlewareSession,
  hasActiveAccessSession,
} from '@/lib/auth/middleware-session';
import { type NextRequest, NextResponse, userAgent } from 'next/server';

const protectedRoutes = ['/apply', '/dashboard'];
const publicRoutes = ['/login', '/signup', '/ecitizen'];

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

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const { device } = userAgent(request);
  const deviceType =
    device.type === 'mobile' || device.type === 'tablet' ? 'mobile' : 'desktop';

  requestHeaders.set('x-path', request.nextUrl.pathname);
  requestHeaders.set('x-device-type', deviceType);

  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route),
  );
  const isPublicRoute = publicRoutes.some((route) => path.startsWith(route));
  const session = await getMiddlewareSession();

  if (isPublicRoute && path.startsWith('/login')) {
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

  if (isProtectedRoute && !session) {
    const loginUrl = buildProtectedLoginUrl(request);
    return NextResponse.redirect(loginUrl, { headers: requestHeaders });
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images).*)'],
};
