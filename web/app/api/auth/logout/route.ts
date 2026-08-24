import { invalidateSession } from '@/lib/auth/session';
import { NextResponse } from 'next/server';

export async function POST() {
  await invalidateSession();
  return NextResponse.json({ success: true });
}
