import {
  type ApplicantLoginRole,
  callbackForSelectedRole,
} from '@/lib/auth/return-path';

export function buildLoginHref(opts: {
  role?: ApplicantLoginRole | null;
  callbackUrl?: string | null;
  type?: string | null;
}): string {
  const params = new URLSearchParams();
  if (opts.type === 'email' || opts.type === 'phone' || opts.type === 'ecitizen') {
    params.set('type', opts.type);
  }
  if (opts.role) {
    params.set('role', opts.role);
    params.set(
      'callbackUrl',
      callbackForSelectedRole(opts.role, opts.callbackUrl),
    );
  } else if (opts.callbackUrl) {
    params.set('callbackUrl', opts.callbackUrl);
  }
  const query = params.toString();
  return query ? `/login?${query}` : '/login';
}
