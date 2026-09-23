import { getOrCreateIndividualApplication } from '@/lib/data/applications';
import {
  loadSessionApplicantIdentity,
  sessionUserMatchesMember,
  userHasApplicantIdentity,
} from '@/lib/data/applications';
import { getSessionUserId } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function StartIndividualPage({
  searchParams,
}: {
  searchParams: Promise<{ idNo?: string }>;
}) {
  const { idNo } = await searchParams;
  const userId = await getSessionUserId();

  if (!userId) {
    redirect(
      `/login?callbackUrl=${encodeURIComponent(`/apply/individual/start?idNo=${idNo ?? ''}`)}`,
    );
  }

  if (!idNo?.trim()) {
    redirect('/apply/individual');
  }

  const entered = idNo.trim();
  const digits = entered.replace(/\D/g, '');

  const member = await prisma.groupMember.findFirst({
    where: {
      OR: [
        { idNo: entered },
        ...(digits && digits !== entered ? [{ idNo: digits }] : []),
      ],
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!member) {
    redirect('/apply/individual?error=not-found');
  }

  const user = await loadSessionApplicantIdentity(userId);
  if (!user || !userHasApplicantIdentity(user)) {
    redirect('/apply/individual?error=identity-required');
  }

  if (!sessionUserMatchesMember(user, member)) {
    redirect('/apply/individual?error=not-you');
  }

  await getOrCreateIndividualApplication(member.id);
  redirect(`/apply/individual/${member.id}/individual-information`);
}
