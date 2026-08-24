import { getOrCreateIndividualApplication } from '@/lib/data/applications';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function StartIndividualPage({
  searchParams,
}: {
  searchParams: Promise<{ idNo?: string }>;
}) {
  const { idNo } = await searchParams;

  if (!idNo) {
    redirect('/apply/individual');
  }

  const member = await prisma.groupMember.findFirst({
    where: { idNo },
    orderBy: { createdAt: 'desc' },
  });

  if (!member) {
    redirect('/apply/individual?error=not-found');
  }

  await getOrCreateIndividualApplication(member.id);
  redirect(`/apply/individual/${member.id}/individual-information`);
}
