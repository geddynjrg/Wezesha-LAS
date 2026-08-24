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

export type ApplicantLoginRole = 'individual' | 'group';

export function parseApplicantLoginRole(
  role?: string | null,
): ApplicantLoginRole | null {
  if (role === 'individual' || role === 'group') {
    return role;
  }
  return null;
}

export function defaultCallbackForRole(role: ApplicantLoginRole): string {
  return role === 'individual' ? '/my-application' : '/dashboard';
}

/**
 * Only resume/start paths imply a role. Generic destinations like
 * /dashboard and /my-application still need an explicit choice.
 */
export function inferApplicantLoginRoleFromCallback(
  callbackUrl?: string | null,
): ApplicantLoginRole | null {
  if (!callbackUrl || !isValidReturnPath(callbackUrl)) {
    return null;
  }

  const pathname = callbackUrl.split('?')[0] ?? '';

  if (pathname === '/apply/create' || pathname.startsWith('/apply/group/')) {
    return 'group';
  }

  if (
    pathname === '/apply/individual' ||
    pathname.startsWith('/apply/individual/')
  ) {
    return 'individual';
  }

  return null;
}

export function resolveApplicantLoginRole(
  roleParam?: string | null,
  callbackUrl?: string | null,
): ApplicantLoginRole | null {
  return (
    parseApplicantLoginRole(roleParam) ??
    inferApplicantLoginRoleFromCallback(callbackUrl)
  );
}

export function callbackForSelectedRole(
  role: ApplicantLoginRole,
  currentCallback?: string | null,
): string {
  const inferred = inferApplicantLoginRoleFromCallback(currentCallback);
  if (
    inferred === role &&
    currentCallback &&
    isValidReturnPath(currentCallback)
  ) {
    return currentCallback;
  }
  return defaultCallbackForRole(role);
}

export function isGroupLoginIntent(callbackUrl?: string | null): boolean {
  return inferApplicantLoginRoleFromCallback(callbackUrl) === 'group';
}

export function isMemberLoginIntent(callbackUrl?: string | null): boolean {
  return inferApplicantLoginRoleFromCallback(callbackUrl) === 'individual';
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
