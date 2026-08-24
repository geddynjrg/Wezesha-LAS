import { checkSoftDuplicates } from '@/lib/soft-duplicate-check';
import { getSessionUserId } from '@/lib/auth/session';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    phone?: string;
    nationalId?: string;
    applicationId?: string;
    memberId?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const result = await checkSoftDuplicates({
    phone: body.phone,
    nationalId: body.nationalId,
    excludeApplicationId: body.applicationId,
    excludeMemberId: body.memberId,
  });

  return NextResponse.json(result);
}
