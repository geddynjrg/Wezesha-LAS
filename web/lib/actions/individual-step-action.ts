'use server';

import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

const nextStep: Record<string, string> = {
  guarantor: 'recruitment',
  recruitment: 'budget',
  budget: 'bank',
  bank: 'credit-history',
  'credit-history': 'signature',
  signature: 'tripartite',
};

const progressMap: Record<string, number> = {
  guarantor: 3,
  recruitment: 4,
  budget: 5,
  bank: 6,
  'credit-history': 7,
  signature: 8,
};

export async function saveIndividualStepAction(
  memberId: string,
  step: string,
  _prev: unknown,
  _formData: FormData,
) {
  const app = await prisma.individualApplication.findUniqueOrThrow({ where: { memberId } });
  await prisma.individualApplication.update({
    where: { id: app.id },
    data: { progress: progressMap[step] ?? app.progress },
  });
  redirect(`/apply/individual/${memberId}/${nextStep[step]}`);
}
