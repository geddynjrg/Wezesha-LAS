import { assertGroupChairAccess } from '@/lib/group-application-access';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/guarantee/signatures?applicationId=...
 * Chair-only: current Signed status for guarantee auto-toggle.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const applicationId = String(searchParams.get('applicationId') || '').trim();
  if (!applicationId) {
    return NextResponse.json({ ok: false, message: 'applicationId required' }, { status: 400 });
  }

  try {
    await assertGroupChairAccess(applicationId);
  } catch {
    return NextResponse.json({ ok: false, message: 'Forbidden' }, { status: 403 });
  }

  const members = await prisma.groupMember.findMany({
    where: { applicationId },
    select: { id: true, signature: true, name: true },
  });

  return NextResponse.json({
    ok: true,
    signatures: Object.fromEntries(
      members.map((m) => [
        m.id,
        m.signature?.trim().toLowerCase() === 'accepted'
          ? 'accepted'
          : m.signature?.trim().toLowerCase() === 'declined'
            ? 'declined'
            : 'pending',
      ]),
    ),
  });
}
