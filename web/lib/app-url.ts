import type { NextRequest } from 'next/server';

function normalizeAppUrl(url: string): string {
  return url.replace(/\/$/, '');
}

/** Client-safe public URL (inlined at build time via NEXT_PUBLIC_APP_URL). */
export function getPublicAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!url) return '';
  return normalizeAppUrl(url);
}

/**
 * Server-side app URL for redirects and cookies.
 * Prefer runtime APP_URL so Docker rebuilds are not required when the domain changes.
 */
export function getServerAppUrl(request?: NextRequest): string {
  const configured = process.env.APP_URL?.trim();
  if (configured) {
    return normalizeAppUrl(configured);
  }

  if (request) {
    const proto =
      request.headers.get('x-forwarded-proto') ??
      request.nextUrl.protocol.replace(':', '');
    const host =
      request.headers.get('x-forwarded-host') ??
      request.headers.get('host') ??
      request.nextUrl.host;
    return `${proto}://${host}`;
  }

  const publicUrl = getPublicAppUrl();
  return publicUrl;
}

export function buildIndividualApplicationStartUrl(idNo: string): string {
  const baseUrl = getPublicAppUrl();
  const path = `/apply/individual/start?idNo=${encodeURIComponent(idNo)}`;
  return baseUrl ? `${baseUrl}${path}` : path;
}
