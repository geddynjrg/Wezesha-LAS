export const RETURN_PATH_COOKIE = 'majuu_return_path';
export const POST_LOGIN_REDIRECT_PARAM = 'redirect';

const EXCLUDED_PATHS = new Set([
  '/',
  '/login',
  '/signup',
  '/reset',
  '/logout',
]);

const EXCLUDED_PREFIXES = [
  '/login/',
  '/signup/',
  '/reset/',
  '/logout/',
  '/ecitizen/',
];

const ALLOWED_PREFIXES = ['/apply', '/status', '/dashboard', '/my-application'];

export function isValidReturnPath(
  path: string | null | undefined,
): path is string {
  if (!path || !path.startsWith('/') || path.startsWith('//')) {
    return false;
  }

  const pathname = path.split('?')[0] ?? '';

  if (!pathname || EXCLUDED_PATHS.has(pathname)) {
    return false;
  }

  if (EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return false;
  }

  return ALLOWED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Where to send the user immediately after a successful login.
 * Default is the combined applications dashboard (group + individual).
 */
export function resolveLoginSuccessPath(
  callbackUrl?: string | null,
): string {
  const pending =
    callbackUrl && isValidReturnPath(callbackUrl) ? callbackUrl : null;

  if (!pending) {
    return '/dashboard';
  }

  return pending;
}

export function resolveReturnPath(explicit?: string | null): string {
  if (explicit && isValidReturnPath(explicit)) {
    return explicit;
  }

  if (typeof window === 'undefined') {
    return '/dashboard';
  }

  const fromStorage = localStorage.getItem(RETURN_PATH_COOKIE);
  if (isValidReturnPath(fromStorage)) {
    return fromStorage;
  }

  const fromCookie = readCookie(RETURN_PATH_COOKIE);
  if (isValidReturnPath(fromCookie)) {
    return fromCookie;
  }

  return '/dashboard';
}

export function isGroupLoginIntent(callbackUrl?: string | null): boolean {
  if (!callbackUrl || !isValidReturnPath(callbackUrl)) {
    return false;
  }

  const pathname = callbackUrl.split('?')[0] ?? '';
  return (
    pathname === '/apply/create' ||
    pathname === '/apply' ||
    pathname.startsWith('/apply/group/') ||
    pathname === '/dashboard'
  );
}

export function isMemberLoginIntent(callbackUrl?: string | null): boolean {
  if (!callbackUrl || !isValidReturnPath(callbackUrl)) {
    return false;
  }

  const pathname = callbackUrl.split('?')[0] ?? '';
  return (
    pathname === '/my-application' ||
    pathname === '/apply/individual' ||
    pathname.startsWith('/apply/individual/')
  );
}

export function persistReturnPath(path: string): void {
  if (!isValidReturnPath(path) || typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(RETURN_PATH_COOKIE, path);
  document.cookie = `${RETURN_PATH_COOKIE}=${encodeURIComponent(path)}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
}

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  if (!match) {
    return null;
  }

  try {
    const value = match[1];
    return value ? decodeURIComponent(value) : null;
  } catch {
    return null;
  }
}

export function getReturnPathFromCookieValue(
  raw: string | undefined,
): string | null {
  if (!raw) {
    return null;
  }

  try {
    const path = decodeURIComponent(raw);
    return isValidReturnPath(path) ? path : null;
  } catch {
    return null;
  }
}
