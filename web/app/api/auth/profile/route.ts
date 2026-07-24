import { getSessionUserId } from '@/lib/auth/session';
import { getUserById } from '@/lib/auth/user';
import { NextResponse } from 'next/server';

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = await getUserById(userId);
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user });
}
