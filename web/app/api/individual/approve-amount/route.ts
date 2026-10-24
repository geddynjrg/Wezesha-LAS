import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma';
import { NextResponse } from 'next/server';
import { notifyApplicationStatusChannels } from '@/lib/notify/notify-application-status';

/**
 * Internal/LMS webhook-style endpoint to mark an individual loan amount as approved.
 * Auth: Authorization: Bearer <MAJUU_LMS_SYNC_TOKEN> or EXTERNAL_API_KEY
 */
export async function POST(request: Request) {
  const expected =
    process.env.MAJUU_LMS_SYNC_TOKEN || process.env.EXTERNAL_API_KEY || '';
  const auth = request.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';

  if (!expected || token !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    memberId?: string;
    acknowledgmentNumber?: string;
    awardAmount?: number | string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const app = body.memberId
    ? await prisma.individualApplication.findUnique({ where: { memberId: body.memberId } })
    : body.acknowledgmentNumber
      ? await prisma.individualApplication.findUnique({
          where: { acknowledgmentNumber: body.acknowledgmentNumber },
        })
      : null;

  if (!app) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

  const awardAmount =
    body.awardAmount != null
      ? new Prisma.Decimal(body.awardAmount.toString())
      : undefined;

  const updated = await prisma.$transaction(async (tx) => {
    const individual = await tx.individualApplication.update({
      where: { id: app.id },
      data: {
        loanAmountApproved: true,
        loanAmountApprovedAt: new Date(),
        status: 'APPROVED',
        ...(awardAmount ? { awardAmount } : {}),
      },
    });

    await tx.groupMember.update({
      where: { id: app.memberId },
      data: { loanStatus: 'AMOUNT_APPROVED' },
    });

    return individual;
  });

  try {
    const member = await prisma.groupMember.findUnique({
      where: { id: updated.memberId },
    });
    if (member) {
      await notifyApplicationStatusChannels({
        recipient: {
          name: member.name,
          phone: member.mobile,
          email: member.email,
        },
        title: 'Wezesha Majuu loan amount approved',
        emailSubject: 'Your Wezesha Majuu loan amount has been approved',
        message: `Dear ${member.name}, your Uwezo Fund Wezesha Majuu loan amount has been approved (Ref: ${updated.acknowledgmentNumber}). Open majuu.uwezo.go.ke or the Uwezo Fund app to review and consent to the predisbursement agreement.`,
      });
    }
  } catch (error) {
    console.warn('[approve-amount] member status notify failed', error);
  }

  return NextResponse.json({
    success: true,
    id: updated.id,
    acknowledgmentNumber: updated.acknowledgmentNumber,
    loanAmountApproved: updated.loanAmountApproved,
  });
}
