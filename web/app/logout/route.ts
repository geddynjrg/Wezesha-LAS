import { invalidateSession } from '@/lib/auth/session';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  await invalidateSession();
  const loginUrl = new URL('/login', request.url);
  return NextResponse.redirect(loginUrl);
}
