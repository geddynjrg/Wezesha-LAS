'use server';

import { updateGroupProgress } from '@/lib/data/applications';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { groupBankSchema } from './bank-schema';

export async function saveBankAction(
  applicationId: string,
  _prev: unknown,
  formData: FormData,
) {
  const parsed = groupBankSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false as const, errors: parsed.error.flatten().fieldErrors };

  await prisma.groupBankAccount.upsert({
    where: { applicationId },
    create: { applicationId, ...parsed.data },
    update: parsed.data,
  });

  await updateGroupProgress(applicationId, 8);
  redirect(`/apply/group/${applicationId}/guarantee`);
}
